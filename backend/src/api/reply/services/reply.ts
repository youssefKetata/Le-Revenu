import type { Core } from '@strapi/strapi';
import { errors } from '@strapi/utils';
import { pageMeta, type Page } from '../../../utils/read-query';

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async findPage(documentId: string, page: Page) {
    const discussion = await strapi.documents('api::discussion.discussion').findOne({
      documentId, fields: ['title'],
    });
    if (!discussion) throw new errors.NotFoundError('Discussion not found.');
    const documents = strapi.documents('api::reply.reply');
    const filters = { discussion: { documentId } };
    const [rows, total] = await Promise.all([
      documents.findMany({
        fields: ['content', 'createdAt'],
        populate: { author: { fields: ['username'] } },
        filters,
        sort: 'createdAt:asc,documentId:asc',
        start: page.start,
        limit: page.limit,
      }),
      documents.count({ filters }),
    ]);
    return {
      data: rows.map(row => ({
        documentId: row.documentId, content: row.content, createdAt: row.createdAt,
        author: row.author ? { documentId: row.author.documentId, username: row.author.username } : null,
      })),
      meta: { pagination: pageMeta(page, total) },
    };
  },
});
