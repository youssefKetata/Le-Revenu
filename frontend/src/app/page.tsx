import PageContainer from "@/components/layout/page-container";
import CategoryNav from "@/components/forum/category-nav";
import CommunityHero from "@/components/forum/community-hero";
import CommunitySidebar from "@/components/forum/community-sidebar";
import DiscussionCard from "@/components/forum/discussion-card";
import Pagination from "@/components/forum/pagination";
import { Button, ButtonLink } from "@/components/ui/button";
import { Notice, ServiceError } from "@/components/ui/notice";
import { getCategories, getDiscussions } from "@/lib/forum/api";
import { feedHref, readFeedQuery, type SearchParams } from "@/lib/forum/query";
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
          <p>Vérifiez la catégorie, le tri et le numéro de page.</p>
          <ButtonLink variant="secondary" className="mt-5" href="/">
            Revenir aux discussions
          </ButtonLink>
        </Notice>
      </PageContainer>
    );
  let categories, feed;
  try {
    [categories, feed] = await Promise.all([
      getCategories(),
      getDiscussions(query),
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
      className="grid items-start gap-[18px] md:grid-cols-[180px_minmax(0,1fr)] md:gap-5 wide:grid-cols-[205px_minmax(0,1fr)_265px] wide:gap-[26px]"
    >
      <CategoryNav categories={categories} query={query} />
      <div className="min-w-0 space-y-5">
        <CommunityHero category={category} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-xl font-bold">
            {query.category
              ? (category?.name ?? "Discussions de cet espace")
              : "Toutes les discussions"}
            <span className="ml-2 inline-block rounded-md bg-neutral-200 px-[7px] py-px align-middle font-sans text-[11px]">
              {feed.meta.pagination.total}
            </span>
          </h2>
          <form method="get" action="/" className="flex gap-1.5">
            {query.category && (
              <input type="hidden" name="category" value={query.category} />
            )}
            <label htmlFor="sort" className="sr-only">
              Trier les discussions
            </label>
            <select
              id="sort"
              name="sort"
              defaultValue={query.sort}
              className="max-w-full rounded-lg border border-border bg-white px-2 py-[7px] text-xs"
            >
              <option value="newest">Plus récentes</option>
              <option value="oldest">Plus anciennes</option>
            </select>
            <Button variant="secondary" type="submit">
              Trier
            </Button>
          </form>
        </div>
        {feed.data.length ? (
          <section
            className="divide-y divide-border overflow-hidden rounded-[14px] border border-black/7 bg-white shadow-sm"
            aria-label="Discussions"
          >
            {feed.data.map((discussion) => (
              <DiscussionCard
                key={discussion.documentId}
                discussion={discussion}
              />
            ))}
          </section>
        ) : (
          <Notice
            title={
              query.page > 1
                ? "Aucune discussion sur cette page"
                : "La conversation commence ici"
            }
          >
            <p>
              {query.page > 1
                ? "Revenez à la première page pour retrouver les discussions."
                : "Il n’y a pas encore de discussion dans cet espace. Partagez la première question."}
            </p>
            <ButtonLink
              variant="secondary"
              className="mt-5"
              href={
                query.page > 1
                  ? feedHref({ ...query, page: 1 })
                  : "/discussions/nouvelle"
              }
            >
              {query.page > 1 ? "Première page" : "Créer une discussion"}
            </ButtonLink>
          </Notice>
        )}
        <Pagination
          pagination={feed.meta.pagination}
          href={(page) => feedHref({ ...query, page })}
        />
      </div>
      <CommunitySidebar />
    </PageContainer>
  );
}
