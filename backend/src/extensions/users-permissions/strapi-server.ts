import type { Core, Plugin } from '@strapi/strapi';

export default (plugin: Plugin.LoadedPlugin) => {
  // Extend the native user without replacing its authentication attributes.
  const attributes = plugin.contentTypes.user.schema.attributes;

  attributes.discussions = {
    type: 'relation',
    relation: 'oneToMany',
    target: 'api::discussion.discussion',
    mappedBy: 'author',
  };

  attributes.replies = {
    type: 'relation',
    relation: 'oneToMany',
    target: 'api::reply.reply',
    mappedBy: 'author',
  };

  // Extend the current native router factory; keep native login/logout handlers.
  const contentApi = plugin.routes['content-api'] as (params: { strapi: Core.Strapi }) => Core.Router;
  plugin.routes['content-api'] = (params) => {
    const router = contentApi(params);
    for (const route of router.routes) {
      if (route.handler === 'user.me' || route.handler === 'auth.logout') {
        route.config = {
          ...route.config,
          policies: [...(route.config?.policies ?? []), 'global::member-session'],
        };
      }
    }
    return router;
  };

  return plugin;
};
