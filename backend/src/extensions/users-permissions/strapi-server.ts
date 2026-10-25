import type { Plugin } from '@strapi/strapi';

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

  return plugin;
};
