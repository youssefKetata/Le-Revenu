import Link from "next/link";
import Icon, { type IconName } from "@/components/ui/icon";
import { feedHref } from "@/lib/forum/query";
import type { Category } from "@/lib/forum/types";

const categoryIcons: Record<string, IconName> = {
  chart: "chart",
  home: "home",
  wallet: "wallet",
  file: "file",
};

export function CategoryIcon({
  category,
  large = false,
}: {
  category: Pick<Category, "icon" | "color">;
  large?: boolean;
}) {
  const color =
    category.color && /^#[0-9a-f]{6}$/i.test(category.color)
      ? category.color
      : "#eb0f0f";
  return (
    <span
      className={`inline-grid shrink-0 place-items-center text-white shadow-[inset_0_.5px_0_rgb(255_255_255/35%),0_.5px_1.5px_rgb(0_0_0/18%)] ${large ? "size-14 rounded-[15px]" : "size-[22px] rounded-md"}`}
      style={{
        background: `linear-gradient(180deg,color-mix(in srgb,${color} 78%,white),${color})`,
      }}
    >
      <Icon
        name={categoryIcons[category.icon ?? ""] ?? "grid"}
        className={large ? "size-[34px]" : "size-[13px]"}
      />
    </span>
  );
}

export function CategoryTag({
  category,
}: {
  category: Omit<Category, "description"> | null;
}) {
  return category ? (
    <Link
      href={feedHref({ category: category.slug })}
      className="relative z-10 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-brand-text hover:text-foreground"
    >
      {category.name}
    </Link>
  ) : (
    <span className="text-[12.5px] text-muted">Catégorie supprimée</span>
  );
}

export function DiscussionType({ type }: { type: "question" | "discussion" }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-fill px-2 py-px text-xs font-semibold text-secondary">
      <Icon name={type === "question" ? "help" : "msg"} className="size-3" />
      {type === "question" ? "Question" : "Discussion"}
    </span>
  );
}
