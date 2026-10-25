export const pageSize = 20;
export const maxPaginationOffset = 100_000;
export type SearchParams = Record<string, string | string[] | undefined>;
export type FeedQuery = {
  category?: string;
  sort: "newest" | "oldest";
  page: number;
};

export function readPage(value: SearchParams[string]): number | null {
  if (value === undefined) return 1;
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) return null;
  const page = Number(value);
  return Number.isSafeInteger(page) &&
    (page - 1) * pageSize <= maxPaginationOffset
    ? page
    : null;
}

export function lastPage(total: number, size = pageSize): number {
  return Math.min(
    Math.floor(maxPaginationOffset / size) + 1,
    Math.max(1, Math.ceil(total / size)),
  );
}

export function readFeedQuery(params: SearchParams): FeedQuery | null {
  const page = readPage(params.page);
  const sort = params.sort ?? "newest";
  const category = params.category;
  if (
    !page ||
    (sort !== "newest" && sort !== "oldest") ||
    (category !== undefined &&
      (typeof category !== "string" ||
        !category.trim() ||
        category.length > 255))
  )
    return null;
  return { page, sort, category };
}

export function feedHref(query: Partial<FeedQuery> = {}): string {
  const params = new URLSearchParams();
  if (query.category) params.set("category", query.category);
  if (query.sort && query.sort !== "newest") params.set("sort", query.sort);
  if (query.page && query.page > 1) params.set("page", String(query.page));
  return params.size ? `/?${params}` : "/";
}

export function discussionHref(documentId: string): string {
  return `/discussions/${documentId}`;
}

export function safeReturnTo(value: unknown): string {
  return typeof value === "string" &&
    /^\/(?:discussions\/(?:nouvelle|[a-z0-9]{24})(?:#replies)?)?$/.test(value)
    ? value
    : "/";
}

export function loginHref(returnTo: string): string {
  return `/connexion?returnTo=${encodeURIComponent(safeReturnTo(returnTo))}`;
}
