import Link from "next/link";
import { notFound } from "next/navigation";
import PageContainer from "@/components/layout/page-container";
import { Byline } from "@/components/forum/byline";
import { CategoryTag } from "@/components/forum/category-tag";
import ReplyList from "@/components/forum/reply-list";
import { ButtonLink, buttonClassName } from "@/components/ui/button";
import Card from "@/components/ui/card";
import { Notice, ServiceError } from "@/components/ui/notice";
import { getDiscussionThread } from "@/lib/forum/api";
import {
  discussionHref,
  loginHref,
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
  let thread, session;
  try {
    [thread, session] = await Promise.all([
      getDiscussionThread(documentId, requestedPage),
      getSession(),
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
  return (
    <PageContainer
      width="discussion"
      className="grid items-start gap-[30px] md:grid-cols-[minmax(0,1fr)_270px]"
    >
      <div className="min-w-0 space-y-5">
        <Link
          href="/"
          className="mb-5 inline-block text-[13px] text-muted hover:text-brand-text"
        >
          ← Toutes les discussions
        </Link>
        <Card as="article" className="md:p-8">
          <div className="flex flex-wrap items-center gap-[9px]">
            <CategoryTag category={discussion.category} />
            <span className="rounded bg-surface-muted px-[7px] py-0.5 text-[10px] font-semibold">
              {discussion.type === "question" ? "Question" : "Discussion"}
            </span>
          </div>
          <h1 className="mt-4 font-serif text-3xl leading-tight font-bold wrap-anywhere sm:text-4xl">
            {discussion.title}
          </h1>
          <Byline author={discussion.author} createdAt={discussion.createdAt} />
          <p className="mt-7 leading-[1.85] whitespace-pre-wrap wrap-anywhere">
            {discussion.content}
          </p>
          <a className={buttonClassName("secondary", "mt-7")} href="#replies">
            Répondre à cette discussion
          </a>
        </Card>
        <section
          id="replies"
          className="space-y-4"
          aria-labelledby="replies-title"
        >
          <h2 id="replies-title" className="font-serif text-2xl font-bold">
            {replies.meta.pagination.total}{" "}
            {replies.meta.pagination.total === 1 ? "réponse" : "réponses"}
          </h2>
          <ReplyList documentId={documentId} replies={replies} />
          <Card>
            {session.member ? (
              <ReplyForm
                key={replies.meta.pagination.total}
                documentId={documentId}
                username={session.member.username}
              />
            ) : (
              <div className="py-2.5 text-center">
                <h3 className="font-serif text-xl font-bold">
                  Vous avez une expérience à partager ?
                </h3>
                <p className="mt-3 text-muted">
                  {session.unavailable
                    ? "Le service de connexion est indisponible. Réessayez dans quelques instants."
                    : "Connectez-vous pour prendre part à la conversation."}
                </p>
                {!session.unavailable && (
                  <ButtonLink
                    className="mt-5"
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
      <aside className="hidden pt-10 md:sticky md:top-[100px] md:block">
        <Card>
          <p className="text-[10px] font-bold tracking-widest text-brand-text">
            LA COMMUNAUTÉ
          </p>
          <h2 className="mt-3 font-serif text-xl font-bold">
            Chaque expérience compte.
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            Posez votre propre question ou explorez les échanges des autres
            lecteurs.
          </p>
          <ButtonLink href="/discussions/nouvelle" className="mt-5 w-full">
            Lancer une discussion
          </ButtonLink>
          <Link
            href="/"
            className="mt-4 block text-center text-sm font-semibold underline underline-offset-4"
          >
            Voir tous les espaces
          </Link>
        </Card>
      </aside>
    </PageContainer>
  );
}
