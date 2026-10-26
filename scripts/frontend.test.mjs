import assert from "node:assert/strict";
import { test } from "node:test";

// Read-only rendering checks against running, seeded development servers.
const frontend = process.env.TEST_FRONTEND_URL ?? "http://localhost:3000";
const backend = process.env.TEST_STRAPI_URL ?? "http://127.0.0.1:1337";
const escapeHtml = (value) =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
      })[character],
  );
async function api(path) {
  const response = await fetch(`${backend}/api${path}`, {
    signal: AbortSignal.timeout(20_000),
  });
  assert.equal(response.status, 200);
  return response.json();
}
async function page(path) {
  const response = await fetch(`${frontend}${path}`, {
    signal: AbortSignal.timeout(45_000),
  });
  assert.equal(response.status, 200);
  return response.text();
}

test("feed renders API discussions, preserves filter/order and handles empty or invalid pages", async () => {
  const { data } = await api("/discussions?pageSize=20&sort=newest");
  assert.ok(data.length, "Run npm run seed:demo before the frontend checks.");
  const html = await page("/");
  const cards = html.match(/<article\b[^>]*>[\s\S]*?<\/article>/g) ?? [];
  assert.equal(cards.length, data.length);
  data.forEach((discussion, index) => {
    assert.ok(cards[index].includes(escapeHtml(discussion.title)));
    assert.ok(cards[index].includes(escapeHtml(discussion.excerpt)));
    assert.ok(cards[index].includes(`/discussions/${discussion.documentId}`));
    assert.ok(
      cards[index].includes(
        escapeHtml(discussion.author?.username ?? "Membre supprimé"),
      ),
    );
    assert.ok(
      new RegExp(`<strong\\b[^>]*>${discussion.replyCount}</strong>`).test(
        cards[index],
      ),
    );
    assert.ok(cards[index].includes(`dateTime="${discussion.createdAt}"`));
    if (discussion.category)
      assert.ok(cards[index].includes(escapeHtml(discussion.category.name)));
  });
  const category = data.find((item) => item.category)?.category;
  assert.ok(category, "Seeded discussions need a category.");
  const query = `?category=${encodeURIComponent(category.slug)}&sort=oldest`;
  const filtered = await api(`/discussions${query}&pageSize=20`);
  const filteredHtml = await page(`/${query}`);
  const filteredCards =
    filteredHtml.match(/<article\b[^>]*>[\s\S]*?<\/article>/g) ?? [];
  assert.equal(filteredCards.length, filtered.data.length);
  filtered.data.forEach((item, index) =>
    assert.ok(filteredCards[index].includes(escapeHtml(item.title))),
  );
  assert.ok(
    (await page("/?category=missing-category-for-render-test")).includes(
      "La conversation commence ici",
    ),
  );
  assert.ok(
    (await page("/?page=5001")).includes("Aucune discussion sur cette page"),
  );
  assert.ok((await page("/?sort=invalid")).includes("Filtres invalides"));
  const compact = await page("/?view=compact");
  assert.ok(compact.includes("Vue détaillée"));
  data.forEach((item) => assert.ok(compact.includes(escapeHtml(item.title))));
  assert.ok((await page("/espaces")).includes(escapeHtml(category.name)));
  assert.ok((await page("/charte")).includes("Bienveillance"));
});

test("search renders filtered API results and keeps search in navigation", async () => {
  const query = "?category=bourse&q=PDF&sort=oldest&view=compact";
  const result = await api("/discussions?category=bourse&q=PDF&sort=oldest&pageSize=20");
  assert.ok(result.data.length, "Seeded Bourse discussions include PDF content.");
  const html = await page(`/${query}`);
  const cards = html.match(/<article\b[^>]*>[\s\S]*?<\/article>/g) ?? [];
  assert.equal(cards.length, result.data.length);
  result.data.forEach((item, index) => assert.ok(cards[index].includes(escapeHtml(item.title))));
  assert.ok(html.includes('name="q"'));
  assert.ok(html.includes('value="PDF"'));
  assert.ok(html.includes('/?category=bourse&amp;q=PDF&amp;view=compact'));
  assert.ok(html.includes('/?category=immobilier&amp;q=PDF&amp;sort=oldest&amp;view=compact'));
  assert.ok(html.includes('name="category" value="bourse"'));
  assert.ok(html.includes('name="sort" value="oldest"'));
  assert.ok(html.includes('name="view" value="compact"'));
  assert.ok((await page("/?q=no-matching-discussion-for-render-test")).includes("Aucune discussion trouvée"));
  for (const query of [`q=${'x'.repeat(201)}`, "q=a&q=b"]) {
    assert.ok((await page(`/?${query}`)).includes("Filtres invalides"));
  }
});

test("detail renders persisted content/replies, offers login and handles missing discussions", async () => {
  const feed = await api("/discussions?pageSize=20");
  const withReplies = feed.data.find((item) => item.bestAnswerId)
    ?? feed.data.find((item) => item.replyCount > 0);
  assert.ok(withReplies, "Seeded discussions include replies for rendering checks.");
  const id = withReplies.documentId;
  const [{ data: discussion }, { data: replies }] = await Promise.all([
    api(`/discussions/${id}`),
    api(`/discussions/${id}/replies?pageSize=20`),
  ]);
  const html = await page(`/discussions/${id}`);
  const renderedHtml = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "").replace(/<!--[\s\S]*?-->/g, "");
  assert.ok(html.includes(escapeHtml(discussion.title)));
  assert.ok(html.includes(escapeHtml(discussion.content)));
  replies.forEach((reply) => {
    assert.ok(html.includes(`id="reply-${reply.documentId}"`));
    assert.ok(html.includes(escapeHtml(reply.content)));
    assert.ok(renderedHtml.includes(`Utile (${reply.usefulCount})`));
  });
  if (replies.length) assert.ok(html.includes("Se connecter pour voter"));
  assert.ok(!html.includes('value="accept"'));
  if (discussion.bestAnswer) {
    assert.ok(html.includes("Meilleure réponse"));
    assert.ok(html.includes(escapeHtml(discussion.bestAnswer.content)));
    const replyIds = [...renderedHtml.matchAll(/id="reply-([a-z0-9]{24})"/g)].map(match => match[1]);
    assert.equal(replyIds.filter(id => id === discussion.bestAnswerId).length, 1,
      "The selected answer is rendered once, including when it is on the current reply page.");
    if (replies.some(reply => reply.documentId === discussion.bestAnswerId))
      assert.equal(replyIds[0], discussion.bestAnswerId, "The selected reply appears first with its actions.");
  }
  assert.ok(html.includes("Se connecter pour répondre"));
  assert.ok(
    html.includes(
      `returnTo=${encodeURIComponent(`/discussions/${id}#replies`)}`,
    ),
  );
  const missing = await fetch(
    `${frontend}/discussions/zzzzzzzzzzzzzzzzzzzzzzzz`,
    { signal: AbortSignal.timeout(30_000) },
  );
  // Next.js may stream its loading shell before it discovers a missing document.
  assert.ok([200, 404].includes(missing.status));
  assert.ok(
    (await missing.text()).includes("Cette discussion est introuvable"),
  );
  const protectedPage = await page("/discussions/nouvelle");
  assert.ok(
    protectedPage.includes("/connexion?returnTo=%2Fdiscussions%2Fnouvelle"),
  );
  assert.ok(!protectedPage.includes('name="content"'));
  const login = await page("/connexion?returnTo=%2Fdiscussions%2Fnouvelle");
  assert.ok(login.includes("Connexion"));
  assert.ok(login.includes('name="returnTo" value="/discussions/nouvelle"'));
});
