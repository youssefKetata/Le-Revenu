import Link from "next/link";
import Icon from "@/components/ui/icon";
import { feedHref, type FeedQuery } from "@/lib/forum/query";

export default function FeedControls({ query }: { query: FeedQuery }) {
  const tabClass = (selected: boolean) =>
    `inline-flex items-center gap-[7px] rounded-lg px-3.5 py-1.5 text-sm whitespace-nowrap [@media(pointer:coarse)]:px-[15px] [@media(pointer:coarse)]:py-[9px] ${selected ? "bg-surface font-semibold text-foreground shadow-[0_1px_3px_rgb(0_0_0/12%),0_0_0_.5px_rgb(0_0_0/4%)]" : "font-medium text-secondary hover:text-foreground"}`;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <nav
        aria-label="Trier les discussions"
        className="inline-flex max-w-full gap-0.5 overflow-x-auto rounded-[10px] bg-fill p-[3px]"
      >
        <Link
          className={tabClass(query.sort === "newest")}
          aria-current={query.sort === "newest" ? "page" : undefined}
          href={feedHref({ ...query, sort: "newest", page: 1 })}
        >
          <Icon name="clock" />
          Récentes
        </Link>
        <Link
          className={tabClass(query.sort === "oldest")}
          aria-current={query.sort === "oldest" ? "page" : undefined}
          href={feedHref({ ...query, sort: "oldest", page: 1 })}
        >
          <Icon name="clock" />
          Anciennes
        </Link>
      </nav>
      <nav
        aria-label="Affichage de la liste"
        className="inline-flex gap-0.5 rounded-lg bg-fill p-0.5"
      >
        {(
          [
            { view: undefined, icon: "rows", label: "Vue détaillée" },
            { view: "compact", icon: "list", label: "Vue compacte" },
          ] as const
        ).map((item) => (
          <Link
            key={item.label}
            href={feedHref({ ...query, view: item.view })}
            aria-label={item.label}
            title={item.label}
            aria-current={query.view === item.view ? "page" : undefined}
            className={`grid h-[30px] w-[34px] place-items-center rounded-md [@media(pointer:coarse)]:h-[38px] [@media(pointer:coarse)]:w-[42px] ${query.view === item.view ? "bg-surface text-foreground shadow-sm" : "text-muted hover:text-foreground"}`}
          >
            <Icon name={item.icon} />
          </Link>
        ))}
      </nav>
    </div>
  );
}
