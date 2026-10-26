import Link from "next/link";
import Icon, { type IconName } from "@/components/ui/icon";
import { feedHref, type FeedQuery } from "@/lib/forum/query";
import type { Category } from "@/lib/forum/types";
import { CategoryIcon } from "./category-tag";

const navigation: {
  href: string;
  label: string;
  icon: IconName;
  active: string;
}[] = [
  { href: "/", label: "Accueil", icon: "home", active: "home" },
  {
    href: "/espaces",
    label: "Tous les espaces",
    icon: "grid",
    active: "spaces",
  },
  { href: "/charte", label: "Charte", icon: "book", active: "charter" },
];
function linkClassName(selected: boolean) {
  return `flex items-center gap-[11px] rounded-[9px] px-2.5 py-[7px] text-sm text-secondary transition-colors hover:bg-fill hover:text-foreground [@media(pointer:coarse)]:p-2.5 ${selected ? "bg-fill-strong font-semibold text-foreground shadow-[inset_3px_0_0_var(--brand)]" : "font-medium"}`;
}

export default function CategoryNav({
  categories,
  query,
  active = "home",
}: {
  categories: Category[];
  query?: FeedQuery;
  active?: "home" | "spaces" | "charter";
}) {
  return (
    <nav
      aria-label="Navigation principale"
      className="hidden flex-col gap-0.5 self-start md:sticky md:top-[86px] md:flex"
    >
      {navigation.map((item) => (
        <Link
          key={item.href}
          className={linkClassName(!query?.category && active === item.active)}
          aria-current={
            !query?.category && active === item.active ? "page" : undefined
          }
          href={item.href}
        >
          <Icon
            name={item.icon}
            className={
              !query?.category && active === item.active
                ? "text-brand-text"
                : ""
            }
          />
          {item.label}
        </Link>
      ))}
      <p className="px-2.5 pt-[18px] pb-1.5 text-xs font-semibold text-muted">
        Espaces
      </p>
      {categories.map((category) => (
        <Link
          key={category.documentId}
          className={linkClassName(query?.category === category.slug)}
          aria-current={query?.category === category.slug ? "page" : undefined}
          href={feedHref({
            category: category.slug,
            q: query?.q,
            sort: query?.sort,
            view: query?.view,
          })}
        >
          <CategoryIcon category={category} />
          {category.name}
        </Link>
      ))}
      <a
        className="mt-[18px] flex items-center gap-2 border-t border-hairline px-2.5 pt-3 text-[13px] text-muted hover:text-brand-text"
        href="https://www.lerevenu.com"
        target="_blank"
        rel="noopener"
      >
        Retour sur lerevenu.com
        <Icon name="external" className="ml-auto size-[13px]" />
      </a>
    </nav>
  );
}

export function CategoryScroller({
  categories,
  query,
}: {
  categories: Category[];
  query: FeedQuery;
}) {
  return (
    <nav
      aria-label="Espaces de discussion"
      className="flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:hidden"
    >
      {[{ slug: "", name: "Tout", documentId: "all" }, ...categories].map(
        (category) => (
          <Link
            key={category.documentId}
            href={feedHref({
              category: category.slug || undefined,
              q: query.q,
              sort: query.sort,
              view: query.view,
            })}
            aria-current={
              (query.category ?? "") === category.slug ? "page" : undefined
            }
            className={`shrink-0 rounded-full border px-[13px] py-1.5 text-[13.5px] font-medium whitespace-nowrap shadow-sm [@media(pointer:coarse)]:px-[15px] [@media(pointer:coarse)]:py-[9px] ${(query.category ?? "") === category.slug ? "border-brand bg-brand text-white" : "border-hairline bg-surface text-secondary"}`}
          >
            {category.name}
          </Link>
        ),
      )}
    </nav>
  );
}
