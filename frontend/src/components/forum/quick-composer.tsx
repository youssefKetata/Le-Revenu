import Link from "next/link";
import { Avatar } from "./byline";
import Icon from "@/components/ui/icon";
import { newDiscussionHref } from "@/lib/forum/query";

export default function QuickComposer({
  username,
  category,
}: {
  username?: string;
  category?: string;
}) {
  const href = (type: "question" | "discussion") =>
    newDiscussionHref({ type, category });
  return (
    <div
      role="group"
      aria-label="Nouvelle publication"
      className="flex items-center gap-3 rounded-[14px] border border-hairline bg-surface px-2.5 py-2 shadow-card transition-shadow hover:border-border-strong hover:shadow-[var(--panel-shadow),0_8px_22px_-14px_rgb(0_0_0/25%)] md:px-3 md:py-2.5"
    >
      {username ? (
        <Avatar name={username} size="md" />
      ) : (
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-muted text-white">
          <Icon name="user" />
        </span>
      )}
      <Link
        className="min-w-0 flex-1 truncate rounded-[10px] bg-fill px-3.5 py-[9px] text-muted hover:bg-fill-strong"
        href={href("question")}
      >
        Posez votre question à la communauté…
      </Link>
      <div className="hidden gap-1 md:flex">
        <Link
          className="inline-flex items-center gap-1.5 rounded-[9px] px-2.5 py-[7px] text-[13.5px] font-medium text-secondary hover:bg-fill"
          href={href("question")}
        >
          <Icon name="help" />
          Question
        </Link>
        <Link
          className="inline-flex items-center gap-1.5 rounded-[9px] px-2.5 py-[7px] text-[13.5px] font-medium text-secondary hover:bg-fill"
          href={href("discussion")}
        >
          <Icon name="msg" />
          Discussion
        </Link>
      </div>
    </div>
  );
}
