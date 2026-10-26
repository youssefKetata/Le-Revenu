import type { Core, Data, Modules } from '@strapi/strapi';
import { errors } from '@strapi/utils';
import { pageMeta, type FeedQuery } from '../../../utils/read-query';
import type { DiscussionInput } from '../../../utils/publish-input';

const populate = {
  author: { fields: ['username'] },
  category: { fields: ['name', 'slug', 'icon', 'color'] },
  replies: { count: true },
  bestAnswer: { fields: ['documentId'] },
} satisfies Modules.Documents.Params.Populate.Any<'api::discussion.discussion'>;

type SummaryRow = Data.ContentType<'api::discussion.discussion', 'title' | 'type' | 'createdAt' | 'author' | 'category' | 'bestAnswer'> & { replies?: unknown };

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
    bestAnswerId: row.bestAnswer?.documentId ?? null,
  };
}

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async setBestAnswer(member: string, documentId: string, replyId: string | null) {
    return strapi.db.transaction(async ({ trx }) => {
      // A single relation plus this row lock serializes competing selections.
      const { tableName, attributes } = strapi.db.metadata.get('api::discussion.discussion');
      const field = attributes.documentId;
      if (!('columnName' in field) || !field.columnName) throw new Error('Discussion column metadata is missing.');
      await strapi.db.getConnection(tableName).select('id').where(field.columnName, documentId).transacting(trx).forUpdate().first();
      const documents = strapi.documents('api::discussion.discussion');
      const discussion = await documents.findOne({ documentId, fields: ['type'], populate: { author: { fields: ['username'] } } });
      if (!discussion) throw new errors.NotFoundError('Discussion not found.');
      if (discussion.author?.documentId !== member) throw new errors.ForbiddenError('Only the question author can choose its best answer.');
      if (discussion.type !== 'question') throw new errors.ValidationError('Only questions can have a best answer.');
      if (replyId) {
        const reply = await strapi.documents('api::reply.reply').findOne({
          documentId: replyId, fields: ['content'],
          populate: { discussion: { fields: ['title'] }, author: { fields: ['username'] } },
        });
        if (!reply || reply.discussion?.documentId !== documentId) throw new errors.NotFoundError('Reply not found in this question.');
        if (reply.author?.documentId === member) throw new errors.ForbiddenError('You cannot select your own reply.');
      }
      await documents.update({ documentId, data: { bestAnswer: replyId }, fields: ['title'] });
      return { data: { bestAnswerId: replyId }, meta: {} };
    });
  },
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
      return { data: { ...summary(row, excerpt(row.content!)), content: row.content, bestAnswer: null }, meta: {} };
    });
  },
  async findPage(page: FeedQuery) {
    const documents = strapi.documents('api::discussion.discussion');
    const filters = {
      ...(page.category ? { category: { slug: page.category } } : {}),
      ...(page.q ? { $or: [{ title: { $containsi: page.q } }, { content: { $containsi: page.q } }] } : {}),
    };
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
      populate: {
        ...populate,
        bestAnswer: { fields: ['content', 'createdAt'], populate: { author: { fields: ['username'] } } },
      },
    });
    if (!row) throw new errors.NotFoundError('Discussion not found.');
    const best = row.bestAnswer;
    return { data: {
      ...summary(row, excerpt(row.content!)), content: row.content,
      bestAnswer: best ? {
        documentId: best.documentId, content: best.content, createdAt: best.createdAt,
        author: best.author ? { documentId: best.author.documentId, username: best.author.username } : null,
      } : null,
    }, meta: {} };
  },
});
