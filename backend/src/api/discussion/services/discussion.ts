import type { Core, Data, Modules } from '@strapi/strapi';
import { errors } from '@strapi/utils';
import { pageMeta, type FeedQuery } from '../../../utils/read-query';

const populate = {
  author: { fields: ['username'] },
  category: { fields: ['name', 'slug', 'icon', 'color'] },
  replies: { count: true },
} satisfies Modules.Documents.Params.Populate.Any<'api::discussion.discussion'>;

type SummaryRow = Data.ContentType<'api::discussion.discussion', 'title' | 'type' | 'createdAt' | 'author' | 'category'> & { replies?: unknown };

function summary(row: SummaryRow) {
  return {
    documentId: row.documentId, title: row.title, type: row.type, createdAt: row.createdAt,
    author: row.author ? { documentId: row.author.documentId, username: row.author.username } : null,
    category: row.category ? {
      documentId: row.category.documentId, name: row.category.name, slug: row.category.slug,
      icon: row.category.icon ?? null, color: row.category.color ?? null,
    } : null,
    // Strapi's result typings do not represent count-only relation population.
    replyCount: (row.replies as { count: number }).count,
  };
}

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async findPage(page: FeedQuery) {
    const documents = strapi.documents('api::discussion.discussion');
    const filters = page.category ? { category: { slug: page.category } } : {};
    const [rows, total] = await Promise.all([
      documents.findMany({
        fields: ['title', 'type', 'createdAt'],
        populate,
        filters,
        sort: `createdAt:${page.order},documentId:asc`,
        start: page.start,
        limit: page.limit,
      }),
      documents.count({ filters }),
    ]);
    return { data: rows.map(summary), meta: { pagination: pageMeta(page, total) } };
  },
  async findDetail(documentId: string) {
    const row = await strapi.documents('api::discussion.discussion').findOne({
      documentId,
      fields: ['title', 'content', 'type', 'createdAt'],
      populate,
    });
    if (!row) throw new errors.NotFoundError('Discussion not found.');
    return { data: { ...summary(row), content: row.content }, meta: {} };
  },
});
