import type { Core } from '@strapi/strapi';
import type { Context } from 'koa';
import { allowQuery, feedQuery, readDocumentId } from '../../../utils/read-query';

export default ({ strapi }: { strapi: Core.Strapi }) => ({
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
