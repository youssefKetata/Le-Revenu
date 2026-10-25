import type { Core } from '@strapi/strapi';
import type { Context } from 'koa';
import { allowQuery, feedQuery, readDocumentId } from '../../../utils/read-query';
import { discussionInput } from '../../../utils/publish-input';

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async create(ctx: Context) {
    allowQuery(ctx.query, []);
    const input = discussionInput(ctx.request.body);
    const result = await strapi.service('api::discussion.discussion').publish(ctx.state.user.documentId, input);
    ctx.status = 201;
    ctx.set('Cache-Control', 'no-store');
    return result;
  },
  async find(ctx: Context) {
    const query = feedQuery(ctx.query);
    ctx.set('Cache-Control', 'no-store');
    return strapi.service('api::discussion.discussion').findPage(query);
  },
  async findOne(ctx: Context) {
    allowQuery(ctx.query, []);
    const documentId = readDocumentId(ctx.params.documentId);
    ctx.set('Cache-Control', 'no-store');
    return strapi.service('api::discussion.discussion').findDetail(documentId);
  },
});
