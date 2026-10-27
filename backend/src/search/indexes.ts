import type { Core } from '@strapi/strapi';

export async function configureSearchIndexes(strapi: Core.Strapi): Promise<void> {
  const { tableName, attributes } = strapi.db.metadata.get('api::discussion.discussion');
  const schema = strapi.db.getSchemaName() ?? 'public';

  // Bootstrap runs after Strapi creates its tables. These expression indexes
  // match the PostgreSQL LOWER(CAST(column AS VARCHAR)) used by $containsi.
  await strapi.db.connection.transaction(async trx => {
    await trx.raw('CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public');
    for (const field of ['title', 'content'] as const) {
      const attribute = attributes[field];
      if (!('columnName' in attribute) || !attribute.columnName) {
        throw new Error(`Discussion ${field} column metadata is missing.`);
      }
      await trx.raw(
        'CREATE INDEX IF NOT EXISTS ?? ON ??.?? USING gin (lower(cast(?? as varchar)) public.gin_trgm_ops)',
        [`discussions_${field}_search_gin`, schema, tableName, attribute.columnName],
      );
    }
  });
}
