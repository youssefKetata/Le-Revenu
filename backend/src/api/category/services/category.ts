import type { Core } from '@strapi/strapi';
import { pageMeta, type Page } from '../../../utils/read-query';

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async findPage(page: Page) {
    const documents = strapi.documents('api::category.category');
    const [rows, total] = await Promise.all([
      documents.findMany({
        fields: ['name', 'slug', 'description', 'icon', 'color'],
        sort: 'name:asc,documentId:asc',
        start: page.start,
        limit: page.limit,
      }),
      documents.count({}),
    ]);
    return {
      data: rows.map(row => ({
        documentId: row.documentId, name: row.name, slug: row.slug,
        description: row.description ?? null, icon: row.icon ?? null, color: row.color ?? null,
      })),
      meta: { pagination: pageMeta(page, total) },
    };
  },
});
