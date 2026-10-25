import type { Core, Data } from '@strapi/strapi';
import { errors } from '@strapi/utils';
import { pageMeta, type Page } from '../../../utils/read-query';
import type { ReplyInput } from '../../../utils/publish-input';

function replyView(row: Data.ContentType<'api::reply.reply', 'content' | 'createdAt' | 'author'>) {
  return {
    documentId: row.documentId, content: row.content, createdAt: row.createdAt,
    author: row.author ? { documentId: row.author.documentId, username: row.author.username } : null,
  };
}

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async publish(author: string, discussion: string, input: ReplyInput) {
    return strapi.db.transaction(async () => {
      const parent = await strapi.documents('api::discussion.discussion').findOne({
        documentId: discussion, fields: ['title'],
      });
      if (!parent) throw new errors.NotFoundError('Discussion not found.');
      const row = await strapi.documents('api::reply.reply').create({
        data: { content: input.content, discussion: parent.documentId, author },
        fields: ['content', 'createdAt'],
        populate: { author: { fields: ['username'] } },
      });
      return { data: replyView(row), meta: {} };
    });
  },
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
      data: rows.map(replyView),
      meta: { pagination: pageMeta(page, total) },
    };
  },
});
