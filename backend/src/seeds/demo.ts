import type { Core } from '@strapi/strapi';
import { demoCategories, demoDiscussions, demoReplies, demoUsers } from './demo-data';

type MemberKey = (typeof demoUsers)[number]['key'];
type CategorySlug = (typeof demoCategories)[number]['slug'];
type RecordIdentity = { documentId: string };
type SeedSummary = Record<'users' | 'categories' | 'discussions' | 'replies', {
  created: number;
  kept: number;
}>;

function requirePassword(value: string | undefined, name: string): string {
  if (!value || value === 'GENERATE_SECRET' || value.length < 12 || Buffer.byteLength(value, 'utf8') > 72) {
    throw new Error(`${name} must contain 12 or more characters and at most 72 UTF-8 bytes. Set it in backend/.env; see backend/.env.example.`);
  }
  return value;
}

export async function seedDemo(
  strapi: Core.Strapi,
  passwords: Record<string, string | undefined> = process.env,
): Promise<SeedSummary> {
  return strapi.db.transaction(async () => {
    const summary: SeedSummary = {
      users: { created: 0, kept: 0 },
      categories: { created: 0, kept: 0 },
      discussions: { created: 0, kept: 0 },
      replies: { created: 0, kept: 0 },
    };
    const role = await strapi.db.query('plugin::users-permissions.role').findOne({
      where: { type: 'authenticated' },
    });
    if (!role) throw new Error('Strapi has no Authenticated member role. Start Strapi successfully before seeding.');

    const members = new Map<MemberKey, RecordIdentity>();
    for (const user of demoUsers) {
      const documents = strapi.documents('plugin::users-permissions.user');
      const existing = await documents.findOne({
        documentId: user.documentId,
      });
      if (existing) {
        members.set(user.key, existing);
        summary.users.kept++;
        continue;
      }
      const conflict = await documents.findFirst({
        filters: { $or: [{ username: user.username }, { email: user.email }] },
      });
      if (conflict) {
        throw new Error(`Demo identity conflict for ${user.username}; existing accounts were left unchanged.`);
      }
      // The native service hashes the password; existing accounts are never reset.
      const created = await strapi.plugin('users-permissions').service('user').add({
        documentId: user.documentId,
        username: user.username,
        email: user.email,
        password: requirePassword(passwords[user.passwordEnv], user.passwordEnv),
        provider: 'local',
        confirmed: true,
        blocked: false,
        role: role.id,
      });
      members.set(user.key, created);
      summary.users.created++;
    }

    const categories = new Map<CategorySlug, RecordIdentity>();
    for (const category of demoCategories) {
      const documents = strapi.documents('api::category.category');
      const existing = await documents.findOne({ documentId: category.documentId });
      if (existing) {
        categories.set(category.slug, existing);
        summary.categories.kept++;
      } else {
        const created = await documents.create({ data: { ...category } });
        categories.set(category.slug, created);
        summary.categories.created++;
      }
    }

    for (const discussion of demoDiscussions) {
      const documents = strapi.documents('api::discussion.discussion');
      if (await documents.findOne({ documentId: discussion.documentId })) {
        summary.discussions.kept++;
        continue;
      }
      await documents.create({
        data: {
          ...discussion,
          author: members.get(discussion.author)!.documentId,
          category: categories.get(discussion.category)!.documentId,
        },
      });
      summary.discussions.created++;
    }

    for (const reply of demoReplies) {
      const documents = strapi.documents('api::reply.reply');
      if (await documents.findOne({ documentId: reply.documentId })) {
        summary.replies.kept++;
        continue;
      }
      await documents.create({
        data: {
          ...reply,
          author: members.get(reply.author)!.documentId,
        },
      });
      summary.replies.created++;
    }
    return summary;
  });
}
