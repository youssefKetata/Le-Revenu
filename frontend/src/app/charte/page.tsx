import PageContainer from "@/components/layout/page-container";
import CategoryNav from "@/components/forum/category-nav";
import { getCategories } from "@/lib/forum/api";
import { StrapiError } from "@/lib/strapi";

const rules = [
  [
    "Bienveillance",
    "On débat des idées, jamais des personnes. Les débutants sont les bienvenus : aucune question n’est bête.",
  ],
  [
    "Expérience, pas conseil personnalisé",
    "Partagez ce que vous faites et pourquoi. Chacun reste responsable de ses décisions d’investissement.",
  ],
  [
    "Pas de sollicitation",
    "Aucune promotion de produit, de parrainage ou de service payant.",
  ],
  [
    "Des sources fiables",
    "Appuyez vos échanges sur des sources fiables : lerevenu.com, les sites publics, l’AMF, la Banque de France, l’Insee ou la Cour des comptes.",
  ],
  [
    "Pas de rumeurs de marché",
    "Évitez les « tuyaux » non sourcés et les incitations à acheter ou vendre un titre.",
  ],
  [
    "Protégez-vous",
    "Un pseudonyme suffit pour participer. Ne publiez jamais vos coordonnées bancaires, numéros de contrat ou informations permettant de vous identifier.",
  ],
];
export const metadata = { title: "La charte — Communauté Le Revenu" };
export default async function CharterPage() {
  let categories = [] as Awaited<ReturnType<typeof getCategories>>;
  try {
    categories = await getCategories();
  } catch (error) {
    if (!(error instanceof StrapiError)) throw error;
  }
  return (
    <PageContainer
      width="community"
      className="grid items-start gap-7 md:grid-cols-[212px_minmax(0,1fr)]"
    >
      <CategoryNav categories={categories} active="charter" />
      <div>
        <h1 className="font-serif text-[28px] font-bold tracking-[-.01em]">
          La charte de la communauté
        </h1>
        <p className="mt-2 text-secondary">
          Des règles simples pour que les échanges restent utiles, sûrs et
          agréables.
        </p>
        <ol className="mt-6 space-y-5">
          {rules.map(([title, text], index) => (
            <li key={title} className="flex gap-4">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-soft font-semibold text-brand-text">
                {index + 1}
              </span>
              <div>
                <h2 className="font-semibold">{title}</h2>
                <p className="mt-1 max-w-[70ch] text-sm leading-7 text-secondary">
                  {text}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </PageContainer>
  );
}
