import { Byline } from "./byline";
import Pagination from "./pagination";
import { ButtonLink } from "@/components/ui/button";
import Card from "@/components/ui/card";
import { Notice } from "@/components/ui/notice";
import { discussionHref } from "@/lib/forum/query";
import type { Collection, Reply } from "@/lib/forum/types";
import ReplyActions from "./reply-actions";
import Icon from "@/components/ui/icon";

export default function ReplyList({
  documentId,
  replies,
  memberId,
  canChoose,
  bestAnswerId,
}: {
  documentId: string;
  replies: Collection<Reply>;
  memberId?: string;
  canChoose: boolean;
  bestAnswerId: string | null;
}) {
  const bestAnswer = replies.data.find((reply) => reply.documentId === bestAnswerId);
  const orderedReplies = bestAnswer
    ? [bestAnswer, ...replies.data.filter((reply) => reply.documentId !== bestAnswerId)]
    : replies.data;
  return (
    <>
      {replies.data.length ? (
        orderedReplies.map((reply) => (
          <Card
            as="article"
            id={`reply-${reply.documentId}`}
            aria-label={reply.documentId === bestAnswerId ? "Meilleure réponse" : undefined}
            key={reply.documentId}
            padding="none"
            className={`px-4 py-4 md:px-5 ${reply.documentId === bestAnswerId ? "border-success/40" : ""}`}
          >
            {reply.documentId === bestAnswerId && (
              <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-success">
                <Icon name="check" /> Meilleure réponse
              </p>
            )}
            <Byline
              author={reply.author}
              createdAt={reply.createdAt}
              variant="reply"
            />
            <p className="mt-2.5 max-w-[66ch] text-[15.5px] leading-[1.7] whitespace-pre-wrap wrap-anywhere">
              {reply.content}
            </p>
            {reply.documentId === bestAnswerId && (
              <p className="mt-3 text-xs text-muted">Choisie par l’auteur de la question.</p>
            )}
            <ReplyActions discussionId={documentId} reply={reply} signedIn={Boolean(memberId)}
              ownReply={memberId === reply.author?.documentId} canChoose={canChoose}
              page={replies.meta.pagination.page}
              selected={reply.documentId === bestAnswerId} />
          </Card>
        ))
      ) : (
        <Notice
          title={
            replies.meta.pagination.page > 1
              ? "Aucune réponse sur cette page"
              : "Soyez le premier à répondre"
          }
        >
          <p>
            {replies.meta.pagination.page > 1
              ? "Revenez à la première page des réponses."
              : "Votre expérience peut aider un autre lecteur."}
          </p>
          {replies.meta.pagination.page > 1 && (
            <ButtonLink
              variant="secondary"
              className="mt-4"
              href={`${discussionHref(documentId)}#replies`}
            >
              Première page
            </ButtonLink>
          )}
        </Notice>
      )}
      <Pagination
        pagination={replies.meta.pagination}
        href={(page) => `${discussionHref(documentId)}?page=${page}#replies`}
      />
    </>
  );
}
