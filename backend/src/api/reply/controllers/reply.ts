import type { Core } from '@strapi/strapi';
import type { Context } from 'koa';
import { pageQuery, readDocumentId } from '../../../utils/read-query';

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async find(ctx: Context) {
    const query = pageQuery(ctx.query);
    const documentId = readDocumentId(ctx.params.documentId);
    ctx.set('Cache-Control', 'no-store');
    return strapi.service('api::reply.reply').findPage(documentId, query);
  },
});
