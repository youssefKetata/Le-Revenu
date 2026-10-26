export const pageSize = 20;
export const maxPaginationOffset = 100_000;
export type SearchParams = Record<string, string | string[] | undefined>;
export type FeedQuery = {
  category?: string;
  q?: string;
  sort: "newest" | "oldest";
  page: number;
  view?: "compact";
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
  const view = params.view;
  const q = params.q;
  if (
    !page ||
    (q !== undefined && (typeof q !== "string" || q.length > 200)) ||
    (view !== undefined && view !== "compact") ||
    (sort !== "newest" && sort !== "oldest") ||
    (category !== undefined &&
      (typeof category !== "string" ||
        !category.trim() ||
        category.length > 255))
  )
    return null;
  return { page, sort, category, view, q: q?.trim() || undefined };
}

export function feedHref(query: Partial<FeedQuery> = {}): string {
  const params = new URLSearchParams();
  if (query.category) params.set("category", query.category);
  if (query.q) params.set("q", query.q);
  if (query.sort && query.sort !== "newest") params.set("sort", query.sort);
  if (query.page && query.page > 1) params.set("page", String(query.page));
  if (query.view) params.set("view", query.view);
  return params.size ? `/?${params}` : "/";
}

export function discussionHref(documentId: string): string {
  return `/discussions/${documentId}`;
}

export function safeReturnTo(value: unknown): string {
  if (typeof value !== "string") return "/";
  if (
    /^\/(?:discussions\/(?:nouvelle|[a-z0-9]{24})(?:#replies)?)?$/.test(value)
  )
    return value;
  if (!value.startsWith("/discussions/nouvelle?")) return "/";
  const params = new URLSearchParams(
    value.slice("/discussions/nouvelle?".length),
  );
  const type = params.get("type"),
    category = params.get("category");
  if (
    [...params.keys()].some((key) => key !== "type" && key !== "category") ||
    params.getAll("type").length > 1 ||
    params.getAll("category").length > 1 ||
    (type !== null && type !== "question" && type !== "discussion") ||
    (category !== null && !/^[a-z0-9]{24}$/.test(category))
  )
    return "/";
  return newDiscussionHref({
    type: type ?? undefined,
    category: category ?? undefined,
  });
}

export function newDiscussionHref({
  type,
  category,
}: { type?: "question" | "discussion"; category?: string } = {}) {
  const params = new URLSearchParams();
  if (type) params.set("type", type);
  if (category) params.set("category", category);
  return `/discussions/nouvelle${params.size ? `?${params}` : ""}`;
}

export function loginHref(returnTo: string): string {
  return `/connexion?returnTo=${encodeURIComponent(safeReturnTo(returnTo))}`;
}
