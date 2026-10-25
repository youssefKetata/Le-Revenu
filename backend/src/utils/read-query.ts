import { errors } from '@strapi/utils';

export type Page = { page: number; pageSize: number; start: number; limit: number };
export type FeedQuery = Page & { category?: string; order: 'asc' | 'desc' };

export function allowQuery(query: Record<string, unknown>, names: string[]): void {
  for (const name of Object.keys(query)) {
    if (!names.includes(name)) throw new errors.ValidationError(`Unsupported query parameter: ${name}`);
  }
}

function positiveInteger(value: unknown, fallback: number, name: string): number {
  if (value === undefined) return fallback;
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value))) {
    throw new errors.ValidationError(`${name} must be a positive integer.`);
  }
  return Number(value);
}

function pagination(query: Record<string, unknown>): Page {
  const page = positiveInteger(query.page, 1, 'page');
  const pageSize = positiveInteger(query.pageSize, 25, 'pageSize');
  if (pageSize > 100) throw new errors.ValidationError('pageSize must not exceed 100.');
  const start = (page - 1) * pageSize;
  if (!Number.isSafeInteger(start) || start > 100_000) {
    throw new errors.ValidationError('Pagination offset must not exceed 100000.');
  }
  return { page, pageSize, start, limit: pageSize };
}

export function pageQuery(query: Record<string, unknown>): Page {
  allowQuery(query, ['page', 'pageSize']);
  return pagination(query);
}

export function feedQuery(query: Record<string, unknown>): FeedQuery {
  allowQuery(query, ['page', 'pageSize', 'category', 'sort']);
  const { category, sort = 'newest' } = query;
  if (category !== undefined && (typeof category !== 'string' || !category.trim() || category.length > 255)) {
    throw new errors.ValidationError('category must be a nonempty slug of at most 255 characters.');
  }
  if (sort !== 'newest' && sort !== 'oldest') {
    throw new errors.ValidationError('sort must be newest or oldest.');
  }
  return { ...pagination(query), category, order: sort === 'oldest' ? 'asc' : 'desc' };
}

export function readDocumentId(value: unknown, field = 'documentId'): string {
  if (typeof value !== 'string' || !/^[a-z0-9]{24}$/.test(value)) {
    throw new errors.ValidationError(`${field} must be a valid Strapi documentId.`, { field });
  }
  return value;
}

export function pageMeta({ page, pageSize }: Page, total: number) {
  return { page, pageSize, pageCount: Math.ceil(total / pageSize), total };
}
