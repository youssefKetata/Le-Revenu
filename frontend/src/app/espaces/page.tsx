import Link from 'next/link';
import PageContainer from '@/components/layout/page-container';
import CategoryNav from '@/components/forum/category-nav';
import { CategoryIcon } from '@/components/forum/category-tag';
import Card from '@/components/ui/card';
import { ServiceError } from '@/components/ui/notice';
import { getCategories } from '@/lib/forum/api';
import { feedHref } from '@/lib/forum/query';
import { StrapiError } from '@/lib/strapi';

export const metadata = { title: 'Tous les espaces — Communauté Le Revenu' };
export default async function SpacesPage() {
  let categories;
  try {
    categories = await getCategories();
  } catch (error) {
    if (!(error instanceof StrapiError)) throw error;
    return (
      <PageContainer>
        <ServiceError href="/espaces" />
      </PageContainer>
    );
  }
  return (
    <PageContainer
      width="community"
      className="grid items-start gap-7 md:grid-cols-[212px_minmax(0,1fr)]"
    >
      <CategoryNav categories={categories} active="spaces" />
      <div className="space-y-[18px]">
        <header>
          <h1 className="font-serif text-[28px] font-bold tracking-[-.01em]">
            Tous les espaces
          </h1>
          <p className="mt-2 text-secondary">
            Retrouvez les espaces thématiques de la communauté des lecteurs du
            Revenu.
          </p>
        </header>
        <div className="grid gap-4 min-[600px]:grid-cols-2">
          {categories.map((category) => (
            <Card
              key={category.documentId}
              className="relative transition-shadow hover:border-border-strong"
            >
              <CategoryIcon category={category} large />
              <h2 className="mt-3 font-serif text-xl font-bold">
                <Link
                  className="after:absolute after:inset-0"
                  href={feedHref({ category: category.slug })}
                >
                  {category.name}
                </Link>
              </h2>
              <p className="mt-2 text-sm leading-6 text-secondary">
                {category.description}
              </p>
            </Card>
          ))}
        </div>
        {!categories.length && (
          <Card>
            <p className="text-muted">Aucun espace n’est encore disponible.</p>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
