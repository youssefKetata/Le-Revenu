import Link from "next/link";
import { Byline } from "./byline";
import { CategoryTag } from "./category-tag";
import { discussionHref } from "@/lib/forum/query";
import type { DiscussionSummary } from "@/lib/forum/types";

export default function DiscussionCard({
  discussion,
}: {
  discussion: DiscussionSummary;
}) {
  return (
    <article className="grid grid-cols-[46px_minmax(0,1fr)] gap-3 px-[15px] py-[18px] hover:bg-neutral-50 md:grid-cols-[52px_minmax(0,1fr)] md:gap-4 md:px-[19px] md:py-[21px]">
      <div
        className={`flex h-[54px] flex-col items-center justify-center gap-0.5 self-start rounded-[9px] border ${discussion.replyCount === 0 ? "border-dashed border-border text-brand-text" : "border-border"}`}
      >
        <strong className="text-xl leading-tight">
          {discussion.replyCount}
        </strong>
        <span className="text-[9px] text-muted">
          {discussion.replyCount === 1 ? "réponse" : "réponses"}
        </span>
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-[9px]">
          <CategoryTag category={discussion.category} />
          <span className="rounded bg-surface-muted px-[7px] py-0.5 text-[10px] font-semibold">
            {discussion.type === "question" ? "Question" : "Discussion"}
          </span>
        </div>
        <h2 className="mt-2 font-serif text-lg leading-snug font-bold wrap-anywhere md:text-[19px]">
          <Link
            href={discussionHref(discussion.documentId)}
            className="hover:text-brand-text"
          >
            {discussion.title}
          </Link>
        </h2>
        <Byline author={discussion.author} createdAt={discussion.createdAt} />
      </div>
    </article>
  );
}
