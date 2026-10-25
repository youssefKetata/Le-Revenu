import type { Author } from "@/lib/forum/types";

const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Paris",
});

export function Avatar({ name }: { name: string }) {
  return (
    <span
      className="inline-grid size-[25px] shrink-0 place-items-center rounded-full bg-[#ebe8f7] text-[10px] font-bold text-[#4e4188]"
      aria-hidden="true"
    >
      {Array.from(name).slice(0, 2).join("").toUpperCase()}
    </span>
  );
}

export function Byline({
  author,
  createdAt,
}: {
  author: Author | null;
  createdAt: string;
}) {
  const name = author?.username ?? "Membre supprimé";
  return (
    <div className="mt-[13px] flex flex-wrap items-center gap-[7px] text-[10px] wrap-anywhere text-muted md:text-[11px]">
      <Avatar name={name} />
      <span className="font-semibold">{name}</span>
      <span aria-hidden="true">·</span>
      <time dateTime={createdAt}>{dateFormat.format(new Date(createdAt))}</time>
    </div>
  );
}
