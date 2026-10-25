import type { Core } from '@strapi/strapi';
import type { Context } from 'koa';
import { pageQuery } from '../../../utils/read-query';

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async find(ctx: Context) {
    const query = pageQuery(ctx.query);
    ctx.set('Cache-Control', 'no-store');
    return strapi.service('api::category.category').findPage(query);
  },
});
