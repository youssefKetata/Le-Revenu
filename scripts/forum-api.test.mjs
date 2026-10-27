import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const backend = resolve(dirname(fileURLToPath(import.meta.url)), '../backend');
const require = createRequire(resolve(backend, 'package.json'));
process.chdir(backend);
process.env.NODE_ENV = 'production';
const { compileStrapi, createStrapi } = require('@strapi/strapi');
const { Client } = require('pg');

test('forum integration', { timeout: 90_000 }, async t => {
  const context = await compileStrapi({ appDir: backend });
  const app = createStrapi(context);
  const { seedDemo } = require(resolve(context.distDir, 'src/seeds/demo.js'));
  const fixtures = require(resolve(context.distDir, 'src/seeds/demo-data.js'));
  const { configureForumPermissions } = require(resolve(context.distDir, 'src/permissions/forum.js'));
  const connection = app.config.get('database.connection.connection');
  const client = new Client({ ...connection, password: connection.password });
  const schema = `forum_api_test_${randomBytes(6).toString('hex')}`;
  assert.match(schema, /^forum_api_test_[a-f0-9]{12}$/);
  let schemaCreated = false;
  try {
    await client.connect();
    await client.query(`CREATE SCHEMA "${schema}"`);
    schemaCreated = true;
    app.config.set('database.connection.connection.schema', schema);
    app.config.set('server.host', '127.0.0.1');
    app.config.set('server.port', 0);
    await app.start();
    assert.equal(app.db.getSchemaName(), schema);
    const base = `http://127.0.0.1:${app.server.httpServer.address().port}`;
    async function request(path, options) {
      const response = await fetch(base + path, options);
      return { status: response.status, body: await response.json() };
    }
    const post = (body, token) => ({
      method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body),
    });
    const counts = async () => [await app.db.query('api::discussion.discussion').count(), await app.db.query('api::reply.reply').count()];
    const passwords = { DEMO_CAMILLE_PASSWORD: randomBytes(24).toString('hex'), DEMO_THOMAS_PASSWORD: randomBytes(24).toString('hex') };
    let events = 0;
    let finishEvents;
    const eventsFinished = new Promise(done => { finishEvents = done; });
    const unsubscribe = app.eventHub.on('entry.create', () => { if (++events === 16) finishEvents(); });
    let timer;
    let seeded;
    try {
      seeded = await seedDemo(app, passwords);
      await Promise.race([eventsFinished, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Seed events did not finish.')), 15_000); })]);
    } finally { clearTimeout(timer); unsubscribe(); }
    const ids = fixtures.demoDiscussions.map(row => row.documentId);
    const valid = { title: 'A discussion published by a member', content: 'Member content.', type: 'question', category: fixtures.demoCategories[0].documentId };
    let firstToken;
    let secondToken;
    let publishedId;

    await t.test('seed creates the demo data and preserves edits/passwords on rerun', async () => {
      assert.deepEqual(Object.values(seeded).map(value => value.created), [2, 4, 5, 5]);
      const users = app.db.query('plugin::users-permissions.user');
      const saved = await users.findOne({ where: { documentId: fixtures.demoUsers[0].documentId } });
      assert.equal(await app.plugin('users-permissions').service('user').validatePassword(passwords.DEMO_CAMILLE_PASSWORD, saved.password), true);
      await app.db.query('api::discussion.discussion').update({ where: { documentId: ids[0] }, data: { title: 'An edited demo discussion' } });
      const rerun = await seedDemo(app, {});
      assert.deepEqual(Object.values(rerun).map(value => value.created), [0, 0, 0, 0]);
      assert.deepEqual(Object.values(rerun).map(value => value.kept), [2, 4, 5, 5]);
      assert.equal((await app.documents('api::discussion.discussion').findOne({ documentId: ids[0] })).title, 'An edited demo discussion');
      assert.ok((await users.findOne({ where: { documentId: saved.documentId } })).password === saved.password);
    });

    await t.test('reads filter, sort and paginate safely with batched reply counts', async () => {
      for (const [index, day] of [1, 2, 3, 4, 1].entries()) {
        await app.db.query('api::discussion.discussion').update({ where: { documentId: ids[index] }, data: { createdAt: `2026-01-0${day}T00:00:00.000Z` } });
      }
      async function feed(pageSize) {
        const sql = [];
        const collect = query => { if (/select/i.test(query.sql)) sql.push(query.sql); };
        app.db.connection.on('query', collect);
        let result;
        try { result = await request(`/api/discussions?pageSize=${pageSize}`); }
        finally { app.db.connection.removeListener('query', collect); }
        assert.equal(result.status, 200);
        const replyQueries = sql.filter(query => query.includes('"replies"') && /count\(\*\)/i.test(query));
        assert.equal(replyQueries.length, 1);
        assert.match(replyQueries[0], /count\(\*\).*group by/is);
        return { ...result, queries: sql.length };
      }
      const small = await feed(1);
      const full = await feed(5);
      assert.equal(small.queries, full.queries);
      assert.deepEqual(full.body.data.map(row => row.documentId), [ids[3], ids[2], ids[1], ids[0], ids[4]]);
      assert.deepEqual(full.body.data.map(row => row.replyCount), [1, 1, 1, 2, 0]);
      for (const row of full.body.data) {
        assert.deepEqual(Object.keys(row.author).sort(), ['documentId', 'username']);
        assert.equal('replies' in row || 'content' in row, false);
        assert.equal(typeof row.excerpt, 'string');
        assert.ok(row.excerpt.length <= 220);
        assert.ok(fixtures.demoDiscussions.find(item => item.documentId === row.documentId).content.replace(/\s+/g, ' ').startsWith(row.excerpt));
      }
      const filtered = await request('/api/discussions?category=bourse&sort=oldest&pageSize=1&page=2');
      assert.deepEqual(filtered.body.meta.pagination, { page: 2, pageSize: 1, pageCount: 2, total: 2 });
      assert.equal(filtered.body.data[0].documentId, ids[4]);
      assert.equal((await request('/api/categories')).body.data.length, 4);
      assert.deepEqual((await request(`/api/discussions/${ids[4]}/replies`)).body.data, []);
      assert.equal((await request(`/api/discussions/${'z'.repeat(24)}`)).status, 404);
      assert.equal((await request('/api/discussions?pageSize=101')).status, 400);
      assert.equal((await request('/api/discussions?populate=*')).status, 400);
    });

    await t.test('search matches titles and content literally with category, sorting and pagination', async () => {
      const { configureSearchIndexes } = require(resolve(context.distDir, 'src/search/indexes.js'));
      // Re-running setup and Strapi schema synchronization must preserve the indexes.
      await configureSearchIndexes(app);
      await app.db.schema.syncSchema();
      const queries = [];
      const collect = query => {
        if (/select.*from.*"discussions"/is.test(query.sql) && /like lower/i.test(query.sql)) queries.push(query);
      };
      app.db.connection.on('query', collect);
      try { assert.equal((await request('/api/discussions?q=PDF')).status, 200); }
      finally { app.db.connection.removeListener('query', collect); }
      assert.equal(queries.length, 2, 'Capture the real filtered page and count queries.');
      await client.query('BEGIN');
      try {
        // Tiny fixtures normally favor sequential scans; verify index eligibility only.
        await client.query('SET LOCAL enable_seqscan = off');
        for (const query of queries) {
          const result = await client.query(`EXPLAIN (FORMAT JSON) ${query.sql}`, query.bindings);
          const plan = JSON.stringify(result.rows[0]['QUERY PLAN']);
          assert.ok(plan.includes('discussions_title_search_gin'));
          assert.ok(plan.includes('discussions_content_search_gin'));
        }
      } finally { await client.query('ROLLBACK'); }
      for (const q of ['  RAPPORT ANNUEL  ', 'PDF complet']) {
        const result = await request(`/api/discussions?${new URLSearchParams({ q })}`);
        assert.equal(result.status, 200);
        assert.deepEqual(result.body.data.map(row => row.documentId), [ids[4]]);
        assert.equal(result.body.meta.pagination.total, 1);
      }
      const accented = await request(`/api/discussions?${new URLSearchParams({ q: 'DÉCLARATION' })}`);
      assert.deepEqual(accented.body.data.map(row => row.documentId), [ids[3]]);
      const combined = await request('/api/discussions?q=je&category=bourse&sort=oldest&pageSize=1&page=2');
      assert.equal(combined.status, 200);
      assert.deepEqual(combined.body.data.map(row => row.documentId), [ids[4]]);
      assert.deepEqual(combined.body.meta.pagination, { page: 2, pageSize: 1, pageCount: 2, total: 2 });
      for (const q of ['no-matching-discussion', '%', '_', '\\', "x' OR 1=1 --"]) {
        const result = await request(`/api/discussions?${new URLSearchParams({ q })}`);
        assert.equal(result.status, 200);
        assert.deepEqual(result.body.data, []);
        assert.equal(result.body.meta.pagination.total, 0);
      }
      assert.equal((await request('/api/discussions?q=%20%20')).body.meta.pagination.total, 5);
      for (const query of [`q=${'x'.repeat(201)}`, 'q=a&q=b', 'q[$contains]=a']) {
        assert.equal((await request(`/api/discussions?${query}`)).status, 400);
      }
      assert.equal((await request(`/api/discussions?q=${'x'.repeat(200)}`)).status, 200);
    });

    await t.test('native login and publishing persist the authenticated authors and reply count', async () => {
      assert.equal((await request('/api/auth/local', post({ identifier: fixtures.demoUsers[0].username, password: 'wrong-password' }))).status, 400);
      const first = await request('/api/auth/local', post({ identifier: fixtures.demoUsers[0].username, password: passwords.DEMO_CAMILLE_PASSWORD }));
      const second = await request('/api/auth/local', post({ identifier: fixtures.demoUsers[1].email, password: passwords.DEMO_THOMAS_PASSWORD }));
      assert.equal(first.status, 200);
      assert.equal(second.status, 200);
      firstToken = first.body.jwt;
      secondToken = second.body.jwt;
      const payload = require('jsonwebtoken').decode(firstToken);
      assert.equal(payload.exp - payload.iat, 600);
      const created = await request('/api/discussions', post({ data: { ...valid, title: `  ${valid.title}  `, content: '  Stored content.  ' } }, firstToken));
      assert.equal(created.status, 201);
      publishedId = created.body.data.documentId;
      assert.equal(created.body.data.title, valid.title);
      assert.equal(created.body.data.author.documentId, fixtures.demoUsers[0].documentId);
      const reply = await request(`/api/discussions/${publishedId}/replies`, post({ data: { content: '  A member reply.  ' } }, secondToken));
      assert.equal(reply.status, 201);
      assert.equal(reply.body.data.content, 'A member reply.');
      assert.deepEqual(reply.body.data.author, { documentId: fixtures.demoUsers[1].documentId, username: fixtures.demoUsers[1].username });
      const detail = await request(`/api/discussions/${publishedId}`);
      assert.equal(detail.body.data.content, 'Stored content.');
      assert.equal(detail.body.data.replyCount, 1);
      assert.equal((await request(`/api/discussions/${publishedId}/replies`)).body.data[0].documentId, reply.body.data.documentId);
    });

    await t.test('useful votes are private, removable, idempotent and authorized', async () => {
      const discussion = ids[0], reply = fixtures.demoReplies[0].documentId;
      const path = `/api/discussions/${discussion}/replies/${reply}/useful`;
      const vote = (useful, token = firstToken) => request(path, post({ data: { useful } }, token));
      for (const token of [undefined, 'forged-token']) {
        assert.equal((await request(path, post({ data: { useful: true } }, token))).status, token ? 401 : 403);
      }
      assert.equal((await vote(true, secondToken)).status, 403, 'self voting is forbidden');
      for (const data of [{}, { useful: 'true' }, { useful: true, author: fixtures.demoUsers[1].documentId }]) {
        assert.equal((await request(path, post({ data }, firstToken))).status, 400);
      }
      assert.equal((await request(`/api/discussions/${ids[1]}/replies/${reply}/useful`, post({ data: { useful: true } }, firstToken))).status, 404);
      assert.equal((await request(`/api/discussions/${discussion}/replies/${'z'.repeat(24)}/useful`, post({ data: { useful: true } }, firstToken))).status, 404);
      const attempts = await Promise.all([vote(true), vote(true), vote(true)]);
      attempts.forEach(result => {
        assert.equal(result.status, 200);
        assert.equal(result.body.data.usefulCount, 1);
        assert.equal(result.body.data.hasVoted, true);
        assert.equal('usefulVoters' in result.body.data, false);
      });
      const anonymous = await request(`/api/discussions/${discussion}/replies`);
      const member = await request(`/api/discussions/${discussion}/replies`, { headers: { Authorization: `Bearer ${firstToken}` } });
      const other = await request(`/api/discussions/${discussion}/replies`, { headers: { Authorization: `Bearer ${secondToken}` } });
      assert.equal(anonymous.body.data[0].usefulCount, 1);
      assert.equal(anonymous.body.data[0].hasVoted, false);
      assert.equal(member.body.data[0].hasVoted, true);
      assert.equal(other.body.data[0].hasVoted, false);
      assert.deepEqual(Object.keys(member.body.data[0]).sort(), ['author', 'content', 'createdAt', 'documentId', 'hasVoted', 'usefulCount']);
      for (let i = 0; i < 2; i++) {
        const removed = await vote(false);
        assert.equal(removed.status, 200);
        assert.equal(removed.body.data.usefulCount, 0);
        assert.equal(removed.body.data.hasVoted, false);
      }
      // Two distinct members can vote; removing one leaves the other vote intact.
      const role = await app.db.query('plugin::users-permissions.role').findOne({ where: { type: 'authenticated' } });
      const password = randomBytes(24).toString('hex');
      await app.plugin('users-permissions').service('user').add({
        username: 'third_voter', email: 'third@example.test', password,
        provider: 'local', confirmed: true, blocked: false, role: role.id,
      });
      const login = await request('/api/auth/local', post({ identifier: 'third_voter', password }));
      assert.equal(login.status, 200);
      assert.equal((await vote(true)).body.data.usefulCount, 1);
      assert.equal((await vote(true, login.body.jwt)).body.data.usefulCount, 2);
      assert.equal((await vote(false)).body.data.usefulCount, 1);
      assert.equal((await vote(false, login.body.jwt)).body.data.usefulCount, 0);
    });

    await t.test('only question owners can choose, replace or clear a related best answer', async () => {
      const path = `/api/discussions/${ids[0]}/best-answer`;
      const reply = fixtures.demoReplies[0].documentId;
      const choose = (value, token = firstToken) => request(path, post({ data: { reply: value } }, token));
      assert.equal((await request(path, post({ data: { reply } }))).status, 403);
      assert.equal((await choose(reply, secondToken)).status, 403);
      assert.equal((await choose(null, secondToken)).status, 403);
      assert.equal((await choose(fixtures.demoReplies[1].documentId)).status, 403, 'cannot accept own reply');
      assert.equal((await choose(fixtures.demoReplies[2].documentId)).status, 404, 'cross-question reply');
      assert.equal((await choose('z'.repeat(24))).status, 404);
      assert.equal((await choose('invalid')).status, 400);
      assert.equal((await request(path, post({ data: { reply, author: fixtures.demoUsers[1].documentId } }, firstToken))).status, 400);
      assert.equal((await request(`/api/discussions/${ids[2]}/best-answer`, post({ data: { reply: fixtures.demoReplies[3].documentId } }, firstToken))).status, 400, 'ordinary discussions cannot be resolved');
      assert.equal((await request(`/api/discussions/${'z'.repeat(24)}/best-answer`, post({ data: { reply } }, firstToken))).status, 404);
      assert.equal((await choose(reply)).status, 200);
      assert.equal((await choose(reply)).status, 200, 'repeated selection is idempotent');
      const selected = await request(`/api/discussions/${ids[0]}`);
      assert.equal(selected.body.data.bestAnswerId, reply);
      assert.equal(selected.body.data.bestAnswer.content, fixtures.demoReplies[0].content);
      assert.deepEqual(Object.keys(selected.body.data.bestAnswer.author).sort(), ['documentId', 'username']);
      assert.equal((await request('/api/discussions?category=bourse')).body.data.find(row => row.documentId === ids[0]).bestAnswerId, reply);
      const replacement = await request(`/api/discussions/${ids[0]}/replies`, post({ data: { content: 'A second eligible answer.' } }, secondToken));
      assert.equal(replacement.status, 201);
      assert.equal((await choose(replacement.body.data.documentId)).status, 200);
      // The selected answer is returned in detail even when absent from the requested reply page.
      const firstPage = await request(`/api/discussions/${ids[0]}/replies?pageSize=1`);
      assert.equal(firstPage.body.data.length, 1);
      assert.notEqual(firstPage.body.data[0].documentId, replacement.body.data.documentId);
      assert.equal((await request(`/api/discussions/${ids[0]}`)).body.data.bestAnswer.documentId, replacement.body.data.documentId);
      const concurrent = await Promise.all([choose(reply), choose(replacement.body.data.documentId)]);
      concurrent.forEach(result => assert.equal(result.status, 200));
      assert.ok([reply, replacement.body.data.documentId].includes((await request(`/api/discussions/${ids[0]}`)).body.data.bestAnswerId));
      assert.equal((await choose(replacement.body.data.documentId)).status, 200);
      await app.documents('api::reply.reply').delete({ documentId: replacement.body.data.documentId });
      assert.equal((await request(`/api/discussions/${ids[0]}`)).body.data.bestAnswer, null, 'admin deletion removes the selected relation');
      assert.equal((await choose(reply)).status, 200);
      assert.equal((await choose(null)).status, 200);
      assert.equal((await choose(null)).status, 200);
      const cleared = await request(`/api/discussions/${ids[0]}`);
      assert.equal(cleared.body.data.bestAnswerId, null);
      assert.equal(cleared.body.data.bestAnswer, null);
    });

    await t.test('anonymous/forged requests, invalid input and author spoofing cannot write', async () => {
      const before = await counts();
      for (const token of [undefined, 'forged-token']) {
        assert.equal((await request('/api/discussions', post({ data: valid }, token))).status, token ? 401 : 403);
        assert.equal((await request(`/api/discussions/${publishedId}/replies`, post({ data: { content: 'reply' } }, token))).status, token ? 401 : 403);
      }
      for (const changes of [{ title: '    123456789    ' }, { content: ' \n ' }, { type: 'poll' }, { category: null }, { content: 'x'.repeat(50_001) }, { author: fixtures.demoUsers[1].documentId }]) {
        assert.equal((await request('/api/discussions', post({ data: { ...valid, ...changes } }, firstToken))).status, 400);
      }
      assert.equal((await request('/api/discussions', post({}, firstToken))).status, 400);
      assert.equal((await request('/api/discussions', post({ data: { ...valid, category: 'z'.repeat(24) } }, firstToken))).status, 404);
      for (const data of [{ content: ' \n ' }, { content: 'reply', author: fixtures.demoUsers[0].documentId }]) {
        assert.equal((await request(`/api/discussions/${publishedId}/replies`, post({ data }, secondToken))).status, 400);
      }
      assert.equal((await request(`/api/discussions/${'z'.repeat(24)}/replies`, post({ data: { content: 'reply' } }, secondToken))).status, 404);
      assert.deepEqual(await counts(), before);
    });

    await t.test('expired, blocked, underprivileged and logged-out sessions cannot publish', async () => {
      const before = await counts();
      const jwt = require('jsonwebtoken');
      const expired = jwt.sign({ ...jwt.decode(firstToken), exp: Math.floor(Date.now() / 1000) - 1 }, app.config.get('plugin::users-permissions.jwtSecret'));
      assert.equal((await request('/api/discussions', post({ data: valid }, expired))).status, 401);
      const usefulPath = `/api/discussions/${ids[0]}/replies/${fixtures.demoReplies[0].documentId}/useful`;
      const bestPath = `/api/discussions/${ids[0]}/best-answer`;
      assert.equal((await request(usefulPath, post({ data: { useful: true } }, expired))).status, 401);
      assert.equal((await request(bestPath, post({ data: { reply: null } }, expired))).status, 401);
      const users = app.db.query('plugin::users-permissions.user');
      await users.update({ where: { documentId: fixtures.demoUsers[1].documentId }, data: { blocked: true } });
      assert.equal((await request('/api/discussions', post({ data: valid }, secondToken))).status, 401);
      assert.equal((await request(bestPath, post({ data: { reply: null } }, secondToken))).status, 401);
      await users.update({ where: { documentId: fixtures.demoUsers[1].documentId }, data: { blocked: false } });
      const role = await app.db.query('plugin::users-permissions.role').findOne({ where: { type: 'authenticated' } });
      await app.db.query('plugin::users-permissions.permission').delete({ where: { role: { id: role.id }, action: 'api::discussion.discussion.create' } });
      assert.equal((await request('/api/discussions', post({ data: valid }, secondToken))).status, 403);
      for (const action of ['api::reply.reply.useful', 'api::discussion.discussion.bestAnswer']) {
        await app.db.query('plugin::users-permissions.permission').delete({ where: { role: { id: role.id }, action } });
      }
      assert.equal((await request(usefulPath, post({ data: { useful: true } }, firstToken))).status, 403);
      assert.equal((await request(bestPath, post({ data: { reply: null } }, firstToken))).status, 403);
      await configureForumPermissions(app);
      assert.equal((await request('/api/auth/logout', post({}, firstToken))).status, 200);
      assert.equal((await request('/api/users/me', { headers: { Authorization: `Bearer ${firstToken}` } })).status, 401);
      assert.equal((await request('/api/discussions', post({ data: valid }, firstToken))).status, 401);
      assert.equal((await request(usefulPath, post({ data: { useful: true } }, firstToken))).status, 401);
      assert.equal((await request(bestPath, post({ data: { reply: null } }, firstToken))).status, 401);
      assert.equal((await request(`/api/discussions/${ids[0]}/replies`, { headers: { Authorization: `Bearer ${firstToken}` } })).status, 401);
      assert.equal((await request(`/api/discussions/${publishedId}/replies`, post({ data: { content: 'reply' } }, firstToken))).status, 401);
      assert.equal((await request('/api/users/me', { headers: { Authorization: `Bearer ${secondToken}` } })).status, 200);
      assert.deepEqual(await counts(), before);
    });
  } finally {
    try { await app.destroy(); }
    finally {
      try { if (schemaCreated) await client.query(`DROP SCHEMA "${schema}" CASCADE`); }
      finally { await client.end(); }
    }
  }
});
