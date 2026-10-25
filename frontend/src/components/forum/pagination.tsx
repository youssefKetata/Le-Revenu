import { ButtonLink } from "@/components/ui/button";
import { lastPage } from "@/lib/forum/query";
import type { Pagination as Page } from "@/lib/forum/types";

export default function Pagination({
  pagination,
  href,
}: {
  pagination: Page;
  href: (page: number) => string;
}) {
  const { page, pageCount } = pagination;
  if (pageCount <= 1 && page === 1) return null;
  const finalPage = lastPage(pagination.total, pagination.pageSize);
  return (
    <nav
      className="flex items-center justify-between gap-2.5 pt-1"
      aria-label="Pagination"
    >
      {page > 1 ? (
        <ButtonLink
          variant="secondary"
          href={href(Math.min(page - 1, finalPage))}
        >
          ← Précédent
        </ButtonLink>
      ) : (
        <span />
      )}
      <span className="text-sm text-muted">
        Page {page} sur {Math.max(pageCount, 1)}
      </span>
      {page < finalPage ? (
        <ButtonLink variant="secondary" href={href(page + 1)}>
          Suivant →
        </ButtonLink>
      ) : (
        <span />
      )}
    </nav>
  );
}
