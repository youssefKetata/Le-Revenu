import { Byline } from "./byline";
import Pagination from "./pagination";
import { ButtonLink } from "@/components/ui/button";
import Card from "@/components/ui/card";
import { Notice } from "@/components/ui/notice";
import { discussionHref } from "@/lib/forum/query";
import type { Collection, Reply } from "@/lib/forum/types";

export default function ReplyList({
  documentId,
  replies,
}: {
  documentId: string;
  replies: Collection<Reply>;
}) {
  return (
    <>
      {replies.data.length ? (
        replies.data.map((reply) => (
          <Card
            as="article"
            id={`reply-${reply.documentId}`}
            key={reply.documentId}
          >
            <Byline author={reply.author} createdAt={reply.createdAt} />
            <p className="mt-4 leading-[1.85] whitespace-pre-wrap wrap-anywhere">
              {reply.content}
            </p>
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
