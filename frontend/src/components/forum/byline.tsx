import type { Author } from "@/lib/forum/types";

const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Paris",
});
const colors = ["#5856d6", "#0a7f99", "#6e6e73", "#c93400", "#d30f45"];
const sizes = {
  xs: "size-[22px] text-[9.5px]",
  sm: "size-[30px] text-[11.5px]",
  md: "size-10 text-sm",
};

export function Avatar({
  name,
  size = "xs",
}: {
  name: string;
  size?: keyof typeof sizes;
}) {
  const color =
    colors[
      Array.from(name).reduce(
        (sum, letter) => sum + letter.codePointAt(0)!,
        0,
      ) % colors.length
    ];
  return (
    <span
      className={`inline-grid shrink-0 place-items-center rounded-full font-semibold tracking-wide text-white ${sizes[size]}`}
      aria-hidden="true"
      style={{
        background: `linear-gradient(180deg,color-mix(in srgb,${color} 70%,white),${color})`,
      }}
    >
      {Array.from(name).slice(0, 2).join("").toUpperCase()}
    </span>
  );
}

function relativeDate(value: string) {
  const minutes = Math.max(
    0,
    (Date.now() - new Date(value).getTime()) / 60_000,
  );
  if (minutes < 1) return "à l’instant";
  if (minutes < 60) return `il y a ${Math.round(minutes)} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.round(hours / 24);
  return days === 1 ? "hier" : `il y a ${days} j`;
}

export function Byline({
  author,
  createdAt,
  variant = "inline",
}: {
  author: Author | null;
  createdAt: string;
  variant?: "inline" | "post" | "reply";
}) {
  const name = author?.username ?? "Membre supprimé";
  const date = (
    <time dateTime={createdAt} title={dateFormat.format(new Date(createdAt))}>
      {relativeDate(createdAt)}
    </time>
  );
  if (variant !== "inline")
    return (
      <div className="flex items-center gap-[11px]">
        <Avatar name={name} size={variant === "post" ? "md" : "sm"} />
        <div className="min-w-0">
          <p className="font-semibold wrap-anywhere">{name}</p>
          <div className="text-[12.5px] text-muted">{date}</div>
        </div>
      </div>
    );
  return (
    <div className="flex flex-wrap items-center gap-[7px] text-[12.5px] wrap-anywhere text-muted">
      <Avatar name={name} />
      <span className="font-semibold text-secondary">{name}</span>
      <span aria-hidden="true">·</span>
      {date}
    </div>
  );
}
