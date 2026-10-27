import PageContainer from "@/components/layout/page-container";
import CategoryNav, { CategoryScroller } from "@/components/forum/category-nav";
import CommunityHero from "@/components/forum/community-hero";
import CommunitySidebar from "@/components/forum/community-sidebar";
import DiscussionCard from "@/components/forum/discussion-card";
import FeedControls from "@/components/forum/feed-controls";
import QuickComposer from "@/components/forum/quick-composer";
import Pagination from "@/components/forum/pagination";
import DiscussionSearch from "@/components/forum/discussion-search";
import { ButtonLink } from "@/components/ui/button";
import { Notice, ServiceError } from "@/components/ui/notice";
import { getCategories, getDiscussions } from "@/lib/forum/api";
import { feedHref, readFeedQuery, type SearchParams } from "@/lib/forum/query";
import { getSession } from "@/lib/session";
import { StrapiError } from "@/lib/strapi";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const query = readFeedQuery(await searchParams);
  if (!query)
    return (
      <PageContainer>
        <Notice title="Filtres invalides">
          <p>
            Vérifiez la recherche (200 caractères maximum), la catégorie, le tri
            et le numéro de page.
          </p>
          <ButtonLink variant="secondary" className="mt-5" href="/">
            Revenir aux discussions
          </ButtonLink>
        </Notice>
      </PageContainer>
    );
  let categories, feed, session;
  try {
    [categories, feed, session] = await Promise.all([
      getCategories(),
      getDiscussions(query),
      getSession(),
    ]);
  } catch (error) {
    if (!(error instanceof StrapiError)) throw error;
    return (
      <PageContainer>
        <ServiceError href={feedHref(query)} />
      </PageContainer>
    );
  }
  const category = categories.find((item) => item.slug === query.category);
  return (
    <PageContainer
      width="community"
      className="grid items-start gap-[18px] md:grid-cols-[200px_minmax(0,1fr)] md:gap-7 wide:grid-cols-[212px_minmax(0,1fr)_304px]"
    >
      <CategoryNav categories={categories} query={query} />
      <div className="flex min-w-0 flex-col gap-[18px]">
        {query.q ? (
          <h1 className="font-serif text-[26px] font-bold tracking-[-.01em]">
            Rechercher une discussion
          </h1>
        ) : session.member && !category ? (
          <h1 className="font-serif text-[26px] font-bold tracking-[-.01em] wrap-anywhere">
            Bonjour {session.member.username}
          </h1>
        ) : (
          <CommunityHero
            category={category}
            discussionCount={feed.meta.pagination.total}
            categoryCount={categories.length}
          />
        )}
        <QuickComposer
          username={session.member?.username}
          category={category?.documentId}
        />
        <CategoryScroller categories={categories} query={query} />
        <DiscussionSearch
          key={query.q ?? ""}
          query={query}
          total={feed.meta.pagination.total}
        />
        <FeedControls query={query} />
        {feed.data.length ? (
          <section
            className="divide-y divide-border overflow-hidden rounded-[14px] border border-hairline bg-surface shadow-card"
            aria-label="Discussions"
          >
            {query.view === "compact" && (
              <div className="grid grid-cols-[minmax(0,1fr)_62px_80px] gap-2.5 bg-surface-muted px-3.5 py-2.5 text-xs font-semibold text-muted md:grid-cols-[minmax(0,1fr)_72px_100px] md:gap-4 md:px-[18px]">
                <span>Discussion</span>
                <span className="text-center">Réponses</span>
                <span className="text-right">Publication</span>
              </div>
            )}
            {feed.data.map((discussion) => (
              <DiscussionCard
                key={discussion.documentId}
                discussion={discussion}
                compact={query.view === "compact"}
              />
            ))}
          </section>
        ) : (
          <Notice
            title={
              query.page > 1
                ? "Aucune discussion sur cette page"
                : query.q
                  ? "Aucune discussion trouvée"
                  : "La conversation commence ici"
            }
          >
            <p>
              {query.page > 1
                ? "Revenez à la première page pour retrouver les discussions."
                : query.q
                  ? "Essayez une autre expression ou changez d’espace."
                  : "Il n’y a pas encore de discussion dans cet espace. Partagez la première question."}
            </p>
            <ButtonLink
              variant="secondary"
              className="mt-5"
              href={
                query.page > 1
                  ? feedHref({ ...query, page: 1 })
                  : query.q
                    ? feedHref({ ...query, q: undefined, page: 1 })
                    : "/discussions/nouvelle"
              }
            >
              {query.page > 1
                ? "Première page"
                : query.q
                  ? "Voir les discussions"
                  : "Créer une discussion"}
            </ButtonLink>
          </Notice>
        )}
        <Pagination
          pagination={feed.meta.pagination}
          href={(page) => feedHref({ ...query, page })}
        />
      </div>
      <CommunitySidebar
        isMember={Boolean(session.member)}
        question={feed.data.find(
          (discussion) =>
            discussion.type === "question" && discussion.replyCount === 0,
        )}
      />
    </PageContainer>
  );
}
