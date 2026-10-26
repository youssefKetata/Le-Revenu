import type { Core, Data, Modules } from '@strapi/strapi';
import { errors } from '@strapi/utils';
import { pageMeta, type Page } from '../../../utils/read-query';
import type { ReplyInput } from '../../../utils/publish-input';

const populate = {
  author: { fields: ['username'] },
  usefulVoters: { count: true },
} satisfies Modules.Documents.Params.Populate.Any<'api::reply.reply'>;

function replyView(row: Data.ContentType<'api::reply.reply', 'content' | 'createdAt' | 'author'> & { usefulVoters?: unknown }, hasVoted = false) {
  return {
    documentId: row.documentId, content: row.content, createdAt: row.createdAt,
    author: row.author ? { documentId: row.author.documentId, username: row.author.username } : null,
    usefulCount: (row.usefulVoters as { count: number }).count,
    hasVoted,
  };
}

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async setUseful(member: string, discussion: string, documentId: string, useful: boolean) {
    return strapi.db.transaction(async ({ trx }) => {
      // Serialize changes on this reply, including simultaneous retries by one member.
      const { tableName, attributes } = strapi.db.metadata.get('api::reply.reply');
      const field = attributes.documentId;
      if (!('columnName' in field) || !field.columnName) throw new Error('Reply column metadata is missing.');
      await strapi.db.getConnection(tableName).select('id').where(field.columnName, documentId).transacting(trx).forUpdate().first();
      const documents = strapi.documents('api::reply.reply');
      const reply = await documents.findOne({
        documentId, fields: ['content'],
        populate: { author: { fields: ['username'] }, discussion: { fields: ['title'] } },
      });
      if (!reply || reply.discussion?.documentId !== discussion) throw new errors.NotFoundError('Reply not found in this discussion.');
      if (reply.author?.documentId === member) throw new errors.ForbiddenError('You cannot vote for your own reply.');
      const row = await documents.update({
        documentId,
        data: { usefulVoters: useful ? { connect: [member] } : { disconnect: [member] } },
        fields: ['content', 'createdAt'], populate,
      });
      if (!row) throw new errors.NotFoundError('Reply not found.');
      return { data: replyView(row, useful), meta: {} };
    });
  },
  async publish(author: string, discussion: string, input: ReplyInput) {
    return strapi.db.transaction(async () => {
      const parent = await strapi.documents('api::discussion.discussion').findOne({
        documentId: discussion, fields: ['title'],
      });
      if (!parent) throw new errors.NotFoundError('Discussion not found.');
      const row = await strapi.documents('api::reply.reply').create({
        data: { content: input.content, discussion: parent.documentId, author },
        fields: ['content', 'createdAt'],
        populate,
      });
      return { data: replyView(row), meta: {} };
    });
  },
  async findPage(documentId: string, page: Page, member?: string) {
    const discussion = await strapi.documents('api::discussion.discussion').findOne({
      documentId, fields: ['title'],
    });
    if (!discussion) throw new errors.NotFoundError('Discussion not found.');
    const documents = strapi.documents('api::reply.reply');
    const filters = { discussion: { documentId } };
    const [rows, total] = await Promise.all([
      documents.findMany({
        fields: ['content', 'createdAt'],
        populate,
        filters,
        sort: 'createdAt:asc,documentId:asc',
        start: page.start,
        limit: page.limit,
      }),
      documents.count({ filters }),
    ]);
    // Resolve only the viewer's votes for this page in one batched query; never expose voters.
    const voted = member && rows.length ? await documents.findMany({
      fields: ['documentId'],
      filters: { documentId: { $in: rows.map(row => row.documentId) }, usefulVoters: { documentId: member } },
      limit: page.limit,
    }) : [];
    const votedIds = new Set(voted.map(row => row.documentId));
    return {
      data: rows.map(row => replyView(row, votedIds.has(row.documentId))),
      meta: { pagination: pageMeta(page, total) },
    };
  },
});
