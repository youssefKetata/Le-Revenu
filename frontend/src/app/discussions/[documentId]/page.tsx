import Link from "next/link";
import { notFound } from "next/navigation";
import PageContainer from "@/components/layout/page-container";
import CategoryNav from "@/components/forum/category-nav";
import { Byline, Avatar } from "@/components/forum/byline";
import {
  CategoryTag,
  CategoryIcon,
  DiscussionType,
} from "@/components/forum/category-tag";
import ReplyList from "@/components/forum/reply-list";
import CopyLink from "@/components/forum/copy-link";
import { ButtonLink, buttonClassName } from "@/components/ui/button";
import Card from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { Notice, ServiceError } from "@/components/ui/notice";
import { getCategories, getDiscussionThread } from "@/lib/forum/api";
import {
  discussionHref,
  feedHref,
  loginHref,
  newDiscussionHref,
  readPage,
  type SearchParams,
} from "@/lib/forum/query";
import { getSession } from "@/lib/session";
import { StrapiError } from "@/lib/strapi";
import ReplyForm from "./reply-form";

export const metadata = { title: "Discussion — Communauté Le Revenu" };
export default async function DiscussionPage({
  params,
  searchParams,
}: {
  params: Promise<{ documentId: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { documentId } = await params;
  if (!/^[a-z0-9]{24}$/.test(documentId)) notFound();
  const query = await searchParams;
  const requestedPage = query.page === "last" ? "last" : readPage(query.page);
  if (!requestedPage)
    return (
      <PageContainer>
        <Notice title="Numéro de page invalide">
          <ButtonLink
            variant="secondary"
            className="mt-5"
            href={discussionHref(documentId)}
          >
            Revenir à la discussion
          </ButtonLink>
        </Notice>
      </PageContainer>
    );
  let thread, session, categories;
  try {
    [thread, session, categories] = await Promise.all([
      getDiscussionThread(documentId, requestedPage),
      getSession(),
      getCategories(),
    ]);
  } catch (error) {
    if (!(error instanceof StrapiError)) throw error;
    if (error.status === 404) notFound();
    return (
      <PageContainer>
        <ServiceError href={discussionHref(documentId)} />
      </PageContainer>
    );
  }
  const { discussion, replies } = thread;
  const category = categories.find(
    (item) => item.documentId === discussion.category?.documentId,
  );
  const participants = new Map(
    [discussion.author, ...replies.data.map((reply) => reply.author)]
      .filter((author) => author !== null)
      .map((author) => [author.documentId, author]),
  );
  return (
    <PageContainer
      width="discussion"
      className="grid items-start gap-[18px] md:grid-cols-[200px_minmax(0,1fr)] md:gap-7 wide:grid-cols-[212px_minmax(0,1fr)_304px]"
    >
      <CategoryNav
        categories={categories}
        query={{ page: 1, sort: "newest", category: category?.slug }}
      />
      <div className="flex min-w-0 flex-col gap-[18px]">
        <nav
          aria-label="Fil d’Ariane"
          className="flex flex-wrap items-center gap-1.5 text-[13.5px] text-muted"
        >
          <Link href="/" className="hover:text-foreground">
            Accueil
          </Link>
          {category && (
            <>
              <Icon name="chevron" className="size-3.5" />
              <Link
                className="hover:text-foreground"
                href={feedHref({ category: category.slug })}
              >
                {category.name}
              </Link>
            </>
          )}
        </nav>
        <Card as="article" padding="none" className="p-4 md:px-[22px] md:py-5">
          <div className="mb-[5px] flex flex-wrap items-center gap-2">
            <CategoryTag category={discussion.category} />
            <DiscussionType type={discussion.type} />
          </div>
          <h1 className="mt-1.5 mb-3.5 font-serif text-2xl leading-[1.2] font-bold tracking-[-.01em] wrap-anywhere md:text-[29px]">
            {discussion.title}
          </h1>
          <Byline
            author={discussion.author}
            createdAt={discussion.createdAt}
            variant="post"
          />
          <p className="mt-3.5 max-w-[66ch] text-base leading-[1.7] whitespace-pre-wrap wrap-anywhere">
            {discussion.content}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-1">
            <a className={buttonClassName("quiet")} href="#replies">
              <Icon name="msg" />
              Répondre
            </a>
            <CopyLink />
          </div>
        </Card>
        <section
          id="replies"
          className="space-y-3"
          aria-labelledby="replies-title"
        >
          <h2
            id="replies-title"
            className="font-serif text-[21px] font-bold tracking-[-.01em]"
          >
            {replies.meta.pagination.total
              ? `${replies.meta.pagination.total} ${replies.meta.pagination.total === 1 ? "réponse" : "réponses"}`
              : "Aucune réponse pour l’instant"}
          </h2>
          <ReplyList documentId={documentId} replies={replies} />
          <Card padding="none">
            {session.member ? (
              <ReplyForm
                key={replies.meta.pagination.total}
                documentId={documentId}
                username={session.member.username}
              />
            ) : (
              <div className="flex flex-col items-center gap-2.5 px-5 py-[26px] text-center">
                <h3 className="font-serif text-[19px] font-bold tracking-[-.01em]">
                  Vous avez un avis ou une expérience à partager ?
                </h3>
                <p className="text-muted">
                  {session.unavailable
                    ? "Le service de connexion est indisponible. Réessayez dans quelques instants."
                    : "Rejoignez la communauté pour participer à la conversation."}
                </p>
                {!session.unavailable && (
                  <ButtonLink
                    href={loginHref(`${discussionHref(documentId)}#replies`)}
                  >
                    Se connecter pour répondre
                  </ButtonLink>
                )}
              </div>
            )}
          </Card>
        </section>
      </div>
      <aside className="flex flex-col gap-[18px] md:col-start-2 wide:col-start-auto">
        <Card>
          <h2 className="mb-3 text-[13px] font-semibold">Cette discussion</h2>
          <dl className="grid grid-cols-2 gap-x-2.5 gap-y-3">
            <div>
              <dt className="text-xs text-muted">Réponses</dt>
              <dd className="text-base font-semibold tabular-nums">
                {replies.meta.pagination.total}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Publication</dt>
              <dd className="text-[13.5px] font-semibold">
                <time dateTime={discussion.createdAt}>
                  {new Intl.DateTimeFormat("fr-FR", {
                    dateStyle: "medium",
                    timeZone: "Europe/Paris",
                  }).format(new Date(discussion.createdAt))}
                </time>
              </dd>
            </div>
          </dl>
          <p className="mt-3.5 text-xs text-muted">
            Participants de cette page
          </p>
          <div className="mt-1.5 flex -space-x-1.5">
            {[...participants.values()].slice(0, 8).map((author) => (
              <span
                key={author.documentId}
                title={author.username}
                className="rounded-full border-2 border-surface"
              >
                <Avatar name={author.username} size="sm" />
              </span>
            ))}
          </div>
        </Card>
        {category && (
          <Card>
            <h2 className="flex items-center gap-2 font-serif text-lg font-bold">
              <CategoryIcon category={category} />
              {category.name}
            </h2>
            <p className="mt-2 text-sm leading-6 text-secondary">
              {category.description}
            </p>
            <ButtonLink
              variant="secondary"
              className="mt-3"
              href={newDiscussionHref({ category: category.documentId })}
            >
              <Icon name="plus" />
              Publier dans cet espace
            </ButtonLink>
          </Card>
        )}
      </aside>
    </PageContainer>
  );
}
