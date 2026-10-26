import type { Core, Data, Modules } from '@strapi/strapi';
import { errors } from '@strapi/utils';
import { pageMeta, type FeedQuery } from '../../../utils/read-query';
import type { DiscussionInput } from '../../../utils/publish-input';

const populate = {
  author: { fields: ['username'] },
  category: { fields: ['name', 'slug', 'icon', 'color'] },
  replies: { count: true },
} satisfies Modules.Documents.Params.Populate.Any<'api::discussion.discussion'>;

type SummaryRow = Data.ContentType<'api::discussion.discussion', 'title' | 'type' | 'createdAt' | 'author' | 'category'> & { replies?: unknown };

function excerpt(content: string) { return content.slice(0, 220).replace(/[\uD800-\uDBFF]$/, '').replace(/\s+/g, ' ').trim(); }

function summary(row: SummaryRow, preview: string) {
  return {
    documentId: row.documentId, title: row.title, excerpt: preview, type: row.type, createdAt: row.createdAt,
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
  async publish(author: string, input: DiscussionInput) {
    return strapi.db.transaction(async () => {
      const category = await strapi.documents('api::category.category').findOne({
        documentId: input.category, fields: ['name'],
      });
      if (!category) throw new errors.NotFoundError('Category not found.');
      const row = await strapi.documents('api::discussion.discussion').create({
        data: { title: input.title, content: input.content, type: input.type, category: category.documentId, author },
        fields: ['title', 'content', 'type', 'createdAt'],
        populate,
      });
      return { data: { ...summary(row, excerpt(row.content!)), content: row.content }, meta: {} };
    });
  },
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
    // Project bounded previews in one query; do not transfer full text bodies for a feed.
    const db = strapi.db.connection;
    const { tableName, attributes } = strapi.db.metadata.get('api::discussion.discussion');
    const idField = attributes.documentId, contentField = attributes.content;
    if (!('columnName' in idField) || !idField.columnName || !('columnName' in contentField) || !contentField.columnName) {
      throw new Error('Discussion scalar column metadata is missing.');
    }
    const previews: { documentId: string; excerpt: string }[] = rows.length ? await strapi.db.getConnection(tableName)
      .select({ documentId: idField.columnName })
      .select({ excerpt: db.raw('left(??, ?)', [contentField.columnName, 220]) })
      .whereIn(idField.columnName, rows.map(row => row.documentId)) : [];
    const byId = new Map(previews.map(row => [row.documentId, excerpt(row.excerpt)]));
    return { data: rows.map(row => summary(row, byId.get(row.documentId) ?? '')), meta: { pagination: pageMeta(page, total) } };
  },
  async findDetail(documentId: string) {
    const row = await strapi.documents('api::discussion.discussion').findOne({
      documentId,
      fields: ['title', 'content', 'type', 'createdAt'],
      populate,
    });
    if (!row) throw new errors.NotFoundError('Discussion not found.');
    return { data: { ...summary(row, excerpt(row.content!)), content: row.content }, meta: {} };
  },
});
