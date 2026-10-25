import Card from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";

export default function CommunitySidebar() {
  return (
    <aside className="hidden space-y-5 wide:block">
      <Card>
        <p className="text-[10px] font-bold tracking-widest text-brand-text">
          UN ESPACE POUR ÉCHANGER
        </p>
        <h2 className="mt-3 font-serif text-xl font-bold">
          Ensemble, faisons les bons choix.
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted">
          Une question, un retour d’expérience ou un point de vue : chaque
          contribution enrichit la communauté.
        </p>
        <ButtonLink
          variant="secondary"
          className="mt-5 w-full"
          href="/discussions/nouvelle"
        >
          Poser ma question
        </ButtonLink>
      </Card>
      <section className="rounded-[14px] border border-black/7 p-[22px]">
        <h2 className="font-semibold">Les bons réflexes</h2>
        <ul className="mt-3 list-disc space-y-3 pl-4 text-sm leading-6 text-muted marker:text-brand">
          <li>Choisissez un titre précis et le bon espace.</li>
          <li>Partagez votre expérience et citez vos sources.</li>
          <li>Restez courtois et respectez les autres membres.</li>
        </ul>
      </section>
    </aside>
  );
}
