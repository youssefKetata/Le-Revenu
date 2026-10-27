import type { Core } from '@strapi/strapi';
import { configureForumPermissions } from './permissions/forum';
import { configureSearchIndexes } from './search/indexes';

export default {
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await configureSearchIndexes(strapi);
    await configureForumPermissions(strapi);
  },
};
