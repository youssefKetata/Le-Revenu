import "server-only";
import { strapiRequest } from "@/lib/strapi";
import { getSession, sessionToken } from "@/lib/session";
import { lastPage, pageSize, type FeedQuery } from "@/lib/forum/query";
import type {
  Category,
  Collection,
  Discussion,
  DiscussionSummary,
  Item,
  Reply,
} from "@/lib/forum/types";

export async function getCategories(): Promise<Category[]> {
  const first = await strapiRequest<Collection<Category>>(
    "/categories?pageSize=100",
  );
  const categories = [...first.data];
  for (let page = 2; page <= first.meta.pagination.pageCount; page++) {
    const next = await strapiRequest<Collection<Category>>(
      `/categories?pageSize=100&page=${page}`,
    );
    categories.push(...next.data);
  }
  return categories;
}

export function getDiscussions(
  query: FeedQuery,
): Promise<Collection<DiscussionSummary>> {
  const params = new URLSearchParams({
    sort: query.sort,
    page: String(query.page),
    pageSize: String(pageSize),
  });
  if (query.category) params.set("category", query.category);
  if (query.q) params.set("q", query.q);
  return strapiRequest(`/discussions?${params}`);
}

export async function getDiscussion(documentId: string): Promise<Discussion> {
  const result = await strapiRequest<Item<Discussion>>(
    `/discussions/${encodeURIComponent(documentId)}`,
  );
  return result.data;
}

export async function getReplies(
  documentId: string,
  page: number,
): Promise<Collection<Reply>> {
  const { member } = await getSession();
  return strapiRequest(
    `/discussions/${encodeURIComponent(documentId)}/replies?page=${page}&pageSize=${pageSize}`,
    { token: member ? await sessionToken() : undefined },
  );
}

export async function getDiscussionThread(
  documentId: string,
  page: number | "last",
) {
  if (page === "last") {
    const discussion = await getDiscussion(documentId);
    const replies = await getReplies(
      documentId,
      lastPage(discussion.replyCount),
    );
    return { discussion, replies };
  }
  const [discussion, replies] = await Promise.all([
    getDiscussion(documentId),
    getReplies(documentId, page),
  ]);
  return { discussion, replies };
}
