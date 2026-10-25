import Link from "next/link";
import { feedHref, type FeedQuery } from "@/lib/forum/query";
import type { Category } from "@/lib/forum/types";
import { CategoryDot } from "./category-tag";

function linkClassName(selected: boolean) {
  return `flex shrink-0 items-center gap-2.5 rounded-full border px-[13px] py-2 text-xs whitespace-nowrap md:rounded-[9px] md:border-0 md:p-2.5 md:text-[13px] ${selected ? "border-brand-text bg-brand-text font-bold text-white md:bg-black/5 md:text-foreground" : "border-border bg-white font-medium hover:bg-black/2 md:bg-transparent"}`;
}

export default function CategoryNav({
  categories,
  query,
}: {
  categories: Category[];
  query: FeedQuery;
}) {
  return (
    <aside className="min-w-0 md:sticky md:top-[100px]">
      <h2 className="hidden px-2.5 py-2.5 text-[11px] font-bold tracking-wider text-muted md:block">
        LA COMMUNAUTÉ
      </h2>
      <nav
        aria-label="Espaces de discussion"
        className="flex gap-1 overflow-x-auto px-0.5 py-1 md:flex-col md:overflow-visible md:p-0"
      >
        <Link
          className={linkClassName(!query.category)}
          aria-current={!query.category ? "page" : undefined}
          href={feedHref({ sort: query.sort })}
        >
          <span aria-hidden="true">☰</span>Toutes les discussions
        </Link>
        <p className="hidden px-2.5 py-2.5 text-[11px] font-bold tracking-wider text-muted md:block">
          NOS ESPACES
        </p>
        {categories.map((category) => (
          <Link
            key={category.documentId}
            className={linkClassName(query.category === category.slug)}
            aria-current={query.category === category.slug ? "page" : undefined}
            href={feedHref({ category: category.slug, sort: query.sort })}
          >
            <CategoryDot color={category.color} />
            {category.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
