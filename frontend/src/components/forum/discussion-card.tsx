import Link from "next/link";
import { Byline } from "./byline";
import { CategoryTag, DiscussionType } from "./category-tag";
import Icon from "@/components/ui/icon";
import { discussionHref } from "@/lib/forum/query";
import type { DiscussionSummary } from "@/lib/forum/types";

const compactDate = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  timeZone: "Europe/Paris",
});

export default function DiscussionCard({
  discussion,
  compact = false,
}: {
  discussion: DiscussionSummary;
  compact?: boolean;
}) {
  if (compact)
    return (
      <article className="grid grid-cols-[minmax(0,1fr)_62px_80px] items-center gap-2.5 px-3.5 py-2.5 hover:bg-surface-muted hover:shadow-[inset_3px_0_0_var(--brand)] md:grid-cols-[minmax(0,1fr)_72px_100px] md:gap-4 md:px-[18px]">
        <div className="min-w-0">
          <Link
            className="block truncate text-sm font-semibold hover:text-brand-text"
            href={discussionHref(discussion.documentId)}
          >
            {discussion.title}
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
            <CategoryTag category={discussion.category} />
            <span>{discussion.author?.username ?? "Membre supprimé"}</span>
          </div>
        </div>
        <strong
          className={`text-center text-sm tabular-nums ${discussion.replyCount === 0 ? "text-warning" : "text-secondary"}`}
        >
          {discussion.replyCount}
        </strong>
        <time
          className="text-right text-xs text-muted"
          dateTime={discussion.createdAt}
        >
          {compactDate.format(new Date(discussion.createdAt))}
        </time>
      </article>
    );
  return (
    <article className="relative grid grid-cols-1 gap-2 px-4 py-3.5 transition-colors hover:bg-surface-muted md:grid-cols-[62px_minmax(0,1fr)] md:gap-4 md:px-[18px] md:py-4 md:hover:shadow-[inset_3px_0_0_var(--brand)]">
      <div
        className={`hidden h-[58px] w-[62px] flex-col items-center justify-center rounded-[9px] border leading-[1.1] md:flex ${discussion.replyCount === 0 ? "border-dashed border-warning bg-warning-soft text-warning" : "border-border bg-surface-muted text-secondary"}`}
      >
        <strong className="text-[19px] font-semibold tabular-nums">
          {discussion.replyCount}
        </strong>
        <span className="mt-1 text-[11.5px]">
          {discussion.replyCount === 1 ? "réponse" : "réponses"}
        </span>
      </div>
      <div className="min-w-0">
        <div className="mb-[5px] flex flex-wrap items-center gap-2">
          <CategoryTag category={discussion.category} />
          <DiscussionType type={discussion.type} />
        </div>
        <h2 className="font-serif text-[18.5px] leading-[1.3] font-bold tracking-[-.01em] wrap-anywhere">
          <Link
            href={discussionHref(discussion.documentId)}
            className="after:absolute after:inset-0 hover:text-brand-text focus-visible:after:rounded-[14px] focus-visible:after:outline-2 focus-visible:after:outline-brand"
          >
            <span>{discussion.title}</span>
          </Link>
        </h2>
        <p className="mt-1 line-clamp-2 text-sm leading-normal text-secondary">
          {discussion.excerpt}
        </p>
        <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
          <Byline author={discussion.author} createdAt={discussion.createdAt} />
          <span
            className={`ml-auto inline-flex items-center gap-1 text-[13px] md:hidden ${discussion.replyCount === 0 ? "text-warning" : "text-muted"}`}
          >
            <Icon name="msg" className="size-[15px]" />
            {discussion.replyCount}
          </span>
        </div>
      </div>
    </article>
  );
}
