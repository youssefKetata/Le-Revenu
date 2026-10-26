import { ButtonLink } from "@/components/ui/button";
import { CategoryIcon } from "./category-tag";
import type { Category } from "@/lib/forum/types";
import styles from "./community-hero.module.css";

export default function CommunityHero({
  category,
  discussionCount,
  categoryCount,
}: {
  category?: Category;
  discussionCount: number;
  categoryCount: number;
}) {
  if (category)
    return (
      <section className="flex flex-wrap items-start gap-[18px] rounded-[14px] border border-hairline bg-surface p-[22px] shadow-card">
        <CategoryIcon category={category} large />
        <div className="min-w-0 flex-1">
          <h1 className="font-serif text-[27px] leading-tight font-bold tracking-[-.01em]">
            {category.name}
          </h1>
          <p className="mt-1.5 text-sm text-secondary">
            {category.description}
          </p>
          <p className="mt-3 text-[13px] text-muted">
            <strong className="text-foreground">{discussionCount}</strong>{" "}
            discussions
          </p>
        </div>
        <ButtonLink href="/discussions/nouvelle">Publier ici</ButtonLink>
      </section>
    );
  return (
    <section
      className={`${styles.background} grid grid-cols-1 items-end gap-x-6 gap-y-[18px] overflow-hidden rounded-2xl px-5 py-[22px] text-white md:grid-cols-[minmax(0,1fr)_auto] md:rounded-[18px] md:px-7 md:pt-7 md:pb-6`}
    >
      <div>
        <h1 className="max-w-[22ch] font-serif text-[25px] leading-[1.12] font-bold tracking-[-.01em] md:text-[32px]">
          La communauté des lecteurs du Revenu
        </h1>
        <p className="mt-2 max-w-[52ch] text-[15px] text-white/78">
          Posez vos questions d’argent, partagez vos expériences et échangez
          avec la communauté. Bourse, épargne, impôts, retraite, transmission.
        </p>
        <div className="mt-4 flex flex-wrap gap-3.5 text-[13px] text-white/90 md:gap-[22px]">
          <span className="border-r border-white/16 pr-3.5 md:pr-[22px]">
            <strong className="block text-[17px] font-bold text-white tabular-nums md:text-xl">
              {discussionCount}
            </strong>
            discussions
          </span>
          <span>
            <strong className="block text-[17px] font-bold text-white tabular-nums md:text-xl">
              {categoryCount}
            </strong>
            espaces
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 md:flex-col">
        <ButtonLink href="/connexion">Rejoindre la communauté</ButtonLink>
        <ButtonLink
          href="/espaces"
          variant="quiet"
          className="border-white/18! bg-white/14! text-white! hover:bg-white/24!"
        >
          Explorer les espaces
        </ButtonLink>
      </div>
    </section>
  );
}
