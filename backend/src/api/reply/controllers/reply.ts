import type { Core } from '@strapi/strapi';
import type { Context } from 'koa';
import { allowQuery, pageQuery, readDocumentId } from '../../../utils/read-query';
import { replyInput } from '../../../utils/publish-input';

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async create(ctx: Context) {
    allowQuery(ctx.query, []);
    const discussion = readDocumentId(ctx.params.documentId, 'discussion');
    const input = replyInput(ctx.request.body);
    const result = await strapi.service('api::reply.reply').publish(ctx.state.user.documentId, discussion, input);
    ctx.status = 201;
    ctx.set('Cache-Control', 'no-store');
    return result;
  },
  async find(ctx: Context) {
    const query = pageQuery(ctx.query);
    const documentId = readDocumentId(ctx.params.documentId);
    ctx.set('Cache-Control', 'no-store');
    return strapi.service('api::reply.reply').findPage(documentId, query);
  },
});
