import Link from "next/link";
import { feedHref } from "@/lib/forum/query";
import type { Category } from "@/lib/forum/types";

export function CategoryDot({ color }: { color: string | null }) {
  return (
    <span
      className="inline-block size-[9px] shrink-0 rounded-[3px] bg-brand"
      aria-hidden="true"
      style={
        color && /^#[0-9a-f]{6}$/i.test(color)
          ? { backgroundColor: color }
          : undefined
      }
    />
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
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-text hover:underline"
    >
      <CategoryDot color={category.color} />
      {category.name}
    </Link>
  ) : (
    <span className="text-sm text-muted">Catégorie supprimée</span>
  );
}
