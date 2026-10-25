import type { Core } from '@strapi/strapi';
import { configureForumPermissions } from './permissions/forum';

export default {
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await configureForumPermissions(strapi);
  },
};
