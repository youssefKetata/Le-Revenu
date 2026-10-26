// Public Strapi response shapes and forum form state; no private user fields.
export type Author = { documentId: string; username: string };
export type Category = {
  documentId: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
};
export type DiscussionSummary = {
  documentId: string;
  title: string;
  excerpt: string;
  type: "question" | "discussion";
  createdAt: string;
  author: Author | null;
  category: Omit<Category, "description"> | null;
  replyCount: number;
  bestAnswerId: string | null;
};
export type Discussion = DiscussionSummary & {
  content: string;
  bestAnswer: Pick<Reply, "documentId" | "content" | "createdAt" | "author"> | null;
};
export type Reply = {
  documentId: string;
  content: string;
  createdAt: string;
  author: Author | null;
  usefulCount: number;
  hasVoted: boolean;
};
export type Pagination = {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
};
export type Collection<T> = { data: T[]; meta: { pagination: Pagination } };
export type Item<T> = { data: T; meta: Record<string, never> };
export type PublishState = {
  error: string | null;
  field?: string;
  signIn?: boolean;
};
