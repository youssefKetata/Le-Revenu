import Link from "next/link";
import { redirect } from "next/navigation";
import PageContainer from "@/components/layout/page-container";
import Card from "@/components/ui/card";
import { Notice, ServiceError } from "@/components/ui/notice";
import { getCategories } from "@/lib/forum/api";
import { loginHref } from "@/lib/forum/query";
import { getSession } from "@/lib/session";
import { StrapiError } from "@/lib/strapi";
import DiscussionForm from "./discussion-form";

export const metadata = { title: "Nouvelle discussion — Communauté Le Revenu" };

export default async function NewDiscussionPage() {
  const session = await getSession();
  if (session.unavailable)
    return (
      <PageContainer>
        <ServiceError href="/discussions/nouvelle" />
      </PageContainer>
    );
  if (!session.member) redirect(loginHref("/discussions/nouvelle"));
  let categories;
  try {
    categories = await getCategories();
  } catch (error) {
    if (!(error instanceof StrapiError)) throw error;
    return (
      <PageContainer>
        <ServiceError href="/discussions/nouvelle" />
      </PageContainer>
    );
  }
  return (
    <PageContainer>
      <Link
        href="/"
        className="mb-5 inline-block text-[13px] text-muted hover:text-brand-text"
      >
        ← Retour aux discussions
      </Link>
      <Card className="md:p-8">
        <p className="text-[10px] font-bold tracking-widest text-brand-text">
          À VOUS LA PAROLE
        </p>
        <h1 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">
          Lancez la conversation.
        </h1>
        <p className="mt-3 leading-7 text-muted">
          Une question à poser, une expérience à partager ? Publiez en tant que{" "}
          <strong>{session.member.username}</strong>.
        </p>
        {categories.length ? (
          <DiscussionForm
            categories={categories.map(({ documentId, name }) => ({
              documentId,
              name,
            }))}
          />
        ) : (
          <div className="mt-6">
            <Notice title="Aucun espace disponible">
              <p>
                Un administrateur doit créer une catégorie avant la première
                publication.
              </p>
            </Notice>
          </div>
        )}
      </Card>
    </PageContainer>
  );
}
