import { ButtonLink } from "@/components/ui/button";
import type { Category } from "@/lib/forum/types";
import styles from "./community-hero.module.css";

export default function CommunityHero({ category }: { category?: Category }) {
  return (
    <section
      className={`${styles.background} rounded-[17px] px-[22px] py-[25px] text-white shadow-lg md:p-7`}
    >
      <p className="text-[10px] font-bold tracking-widest text-[#ffb6b6]">
        LA COMMUNAUTÉ LE REVENU
      </p>
      <h1 className="mt-[13px] max-w-[22ch] font-serif text-[clamp(28px,2.6vw,36px)] leading-[1.15] font-bold tracking-tight wrap-anywhere">
        {category?.name ?? "Votre expérience a de la valeur."}
      </h1>
      <p className="mt-[13px] max-w-[53ch] text-sm leading-7 text-white/90">
        {category?.description ??
          "Épargne, bourse, immobilier… Posez vos questions et partagez vos expériences avec les lecteurs du Revenu."}
      </p>
      <ButtonLink className="mt-5" href="/discussions/nouvelle">
        Lancer une discussion <span aria-hidden="true">→</span>
      </ButtonLink>
    </section>
  );
}
