import { redirect } from "next/navigation";
import FormPanel from "@/components/layout/form-panel";
import { Notice, ServiceError } from "@/components/ui/notice";
import { getCategories } from "@/lib/forum/api";
import {
  loginHref,
  newDiscussionHref,
  type SearchParams,
} from "@/lib/forum/query";
import { getSession } from "@/lib/session";
import { StrapiError } from "@/lib/strapi";
import DiscussionForm from "./discussion-form";

export default async function NewDiscussionContent({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const query = await searchParams;
  const type = query.type === "discussion" ? "discussion" : "question";
  const category =
    typeof query.category === "string" && /^[a-z0-9]{24}$/.test(query.category)
      ? query.category
      : undefined;
  const session = await getSession();
  if (session.unavailable)
    return (
      <>
        <ServiceError href={newDiscussionHref({ type, category })} />
      </>
    );
  if (!session.member)
    redirect(
      loginHref(
        newDiscussionHref({ ...(query.type ? { type } : {}), category }),
      ),
    );
  let categories;
  try {
    categories = await getCategories();
  } catch (error) {
    if (!(error instanceof StrapiError)) throw error;
    return (
      <>
        <ServiceError href={newDiscussionHref({ type, category })} />
      </>
    );
  }
  return (
    <>
      <FormPanel title="Nouvelle publication">
        {categories.length ? (
          <DiscussionForm
            categories={categories.map(({ documentId, name }) => ({
              documentId,
              name,
            }))}
            initialType={type}
            initialCategory={
              categories.some((item) => item.documentId === category)
                ? category
                : undefined
            }
          />
        ) : (
          <div className="p-[22px]">
            <Notice title="Aucun espace disponible">
              <p>
                Un administrateur doit créer une catégorie avant la première
                publication.
              </p>
            </Notice>
          </div>
        )}
      </FormPanel>
    </>
  );
}
