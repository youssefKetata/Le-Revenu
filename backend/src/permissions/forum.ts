import type { Core } from '@strapi/strapi';

const readActions = [
  'api::category.category.find',
  'api::discussion.discussion.find',
  'api::discussion.discussion.findOne',
  'api::reply.reply.find',
];

export async function configureForumPermissions(strapi: Core.Strapi): Promise<void> {
  await strapi.db.transaction(async () => {
    const permissions = strapi.db.query('plugin::users-permissions.permission');
    for (const type of ['public', 'authenticated']) {
      const role = await strapi.db.query('plugin::users-permissions.role').findOne({ where: { type } });
      if (!role) throw new Error(`Missing Strapi ${type} role.`);
      const existing = await permissions.findMany({ where: { role: { id: role.id } } });
      for (const permission of existing) {
        const forumAction = ['category', 'discussion', 'reply'].some(name => permission.action.startsWith(`api::${name}.${name}.`));
        const userManagement = permission.action.startsWith('plugin::users-permissions.user.')
          && permission.action !== 'plugin::users-permissions.user.me';
        if ((forumAction && !readActions.includes(permission.action)) || userManagement) {
          await permissions.delete({ where: { id: permission.id } });
        }
      }
      for (const action of readActions) {
        if (!existing.some(permission => permission.action === action)) {
          await permissions.create({ data: { action, role: role.id } });
        }
      }
    }
  });

  // This forum uses seeded members; self-registration is outside its scope.
  const store = strapi.store({ type: 'plugin', name: 'users-permissions' });
  const settings = await store.get({ key: 'advanced' }) as Record<string, unknown>;
  if (settings.allow_register !== false) {
    await store.set({ key: 'advanced', value: { ...settings, allow_register: false } });
  }
}
