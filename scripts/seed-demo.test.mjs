import assert from 'node:assert/strict';
import { createHash, randomBytes } from 'node:crypto';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const backend = resolve(root, 'backend');
const require = createRequire(resolve(backend, 'package.json'));
process.chdir(backend);
process.env.NODE_ENV = 'production';
const { compileStrapi, createStrapi } = require('@strapi/strapi');
const { Client } = require('pg');

function withTimeout(promise) {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error('Strapi content events did not finish.')), 15_000);
    }),
  ]).finally(() => clearTimeout(timer));
}

function canonical(value) {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) {
    return value.map(canonical).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
  }
  return value;
}

test('demo seed creates fresh data, preserves edits and rolls back failures', { timeout: 60_000 }, async () => {
  const context = await compileStrapi({ appDir: backend });
  const app = createStrapi(context);
  const { seedDemo } = require(resolve(context.distDir, 'src/seeds/demo.js'));
  const fixtures = require(resolve(context.distDir, 'src/seeds/demo-data.js'));
  const connection = app.config.get('database.connection.connection');
  const client = new Client({ ...connection, password: connection.password });
  const schema = `demo_seed_test_${randomBytes(6).toString('hex')}`;
  assert.match(schema, /^demo_seed_test_[a-f0-9]{12}$/);
  const uids = ['plugin::users-permissions.user', 'api::category.category', 'api::discussion.discussion', 'api::reply.reply'];
  const kept = {
    users: { created: 0, kept: 2 }, categories: { created: 0, kept: 4 },
    discussions: { created: 0, kept: 5 }, replies: { created: 0, kept: 5 },
  };
  const passwords = {
    DEMO_CAMILLE_PASSWORD: randomBytes(24).toString('hex'),
    DEMO_THOMAS_PASSWORD: randomBytes(24).toString('hex'),
  };
  let schemaCreated = false;
  async function snapshot() {
    const rows = [];
    for (const uid of uids) {
      rows.push(await app.db.query(uid).findMany({ orderBy: { id: 'asc' }, populate: true }));
    }
    // Hash snapshots so assertion failures cannot print private user attributes.
    return createHash('sha256').update(JSON.stringify(canonical(rows))).digest('hex');
  }
  try {
    await client.connect();
    await client.query(`CREATE SCHEMA "${schema}"`);
    schemaCreated = true;
    app.config.set('database.connection.connection.schema', schema);
    await app.load();
    assert.equal(app.db.getSchemaName(), schema);
    assert.equal((await app.db.connection.raw('SELECT current_schema() AS name')).rows[0].name, schema);
    for (const uid of uids) assert.equal(await app.db.query(uid).count(), 0);

    let createdEvents = 0;
    let finishEvents;
    const eventsFinished = new Promise(resolveEvents => { finishEvents = resolveEvents; });
    const unsubscribe = app.eventHub.on('entry.create', () => {
      if (++createdEvents === 16) finishEvents();
    });
    try {
      assert.deepEqual(await seedDemo(app, passwords), {
        users: { created: 2, kept: 0 }, categories: { created: 4, kept: 0 },
        discussions: { created: 5, kept: 0 }, replies: { created: 5, kept: 0 },
      });
      await withTimeout(eventsFinished);
    } finally { unsubscribe(); }

    for (const user of fixtures.demoUsers) {
      const saved = await app.db.query(uids[0]).findOne({ where: { documentId: user.documentId }, populate: ['role'] });
      assert.equal(saved.role.type, 'authenticated');
      assert.equal(saved.confirmed, true);
      assert.equal(saved.blocked, false);
      assert.notEqual(saved.password, passwords[user.passwordEnv]);
      assert.equal(await app.plugin('users-permissions').service('user').validatePassword(passwords[user.passwordEnv], saved.password), true);
    }
    for (const [index, discussion] of fixtures.demoDiscussions.entries()) {
      const saved = await app.documents(uids[2]).findOne({ documentId: discussion.documentId, populate: ['author', 'category', 'replies'] });
      assert.equal(saved.replies.length, [2, 1, 1, 1, 0][index]);
      assert.equal(saved.author.documentId, fixtures.demoUsers.find(user => user.key === discussion.author).documentId);
      assert.equal(saved.category.slug, discussion.category);
    }
    for (const reply of fixtures.demoReplies) {
      const saved = await app.documents(uids[3]).findOne({ documentId: reply.documentId, populate: ['author', 'discussion'] });
      assert.equal(saved.author.documentId, fixtures.demoUsers.find(user => user.key === reply.author).documentId);
      assert.equal(saved.discussion.documentId, reply.discussion);
    }
    const original = await snapshot();
    assert.deepEqual(await seedDemo(app, {}), kept);
    assert.equal(await snapshot(), original);

    const rollback = new Error('Roll back temporary edits');
    await assert.rejects(app.db.transaction(async () => {
      const publicRole = await app.db.query('plugin::users-permissions.role').findOne({ where: { type: 'public' } });
      await app.documents(uids[0]).update({ documentId: fixtures.demoUsers[0].documentId, data: { username: 'edited_demo_member', blocked: true, role: publicRole.id } });
      await app.documents(uids[1]).update({ documentId: fixtures.demoCategories[0].documentId, data: { name: 'Edited category', slug: 'edited-category' } });
      await app.documents(uids[2]).update({ documentId: fixtures.demoDiscussions[0].documentId, data: { title: 'An edited discussion title', content: 'Edited content.', author: fixtures.demoUsers[1].documentId } });
      await app.documents(uids[3]).update({ documentId: fixtures.demoReplies[0].documentId, data: { content: 'Edited reply.' } });
      const edited = await snapshot();
      assert.deepEqual(await seedDemo(app, { DEMO_CAMILLE_PASSWORD: 'changed-password-value', DEMO_THOMAS_PASSWORD: 'changed-password-value' }), kept);
      assert.equal(await snapshot(), edited);
      throw rollback;
    }), error => error === rollback);
    assert.equal(await snapshot(), original);

    // A different document may not be adopted by matching a username or slug.
    for (const [fixture, expectedError] of [[fixtures.demoUsers[0], /Demo identity conflict/], [fixtures.demoCategories[0], { name: 'ValidationError' }]]) {
      const documentId = fixture.documentId;
      try {
        fixture.documentId = randomBytes(12).toString('hex');
        await assert.rejects(() => seedDemo(app, {}), expectedError);
      } finally { fixture.documentId = documentId; }
      assert.equal(await snapshot(), original);
    }

    const originals = fixtures.demoUsers.map(user => ({ ...user }));
    try {
      for (const user of fixtures.demoUsers) {
        const marker = randomBytes(8).toString('hex');
        Object.assign(user, { documentId: randomBytes(12).toString('hex'), username: `rollback_${marker}`, email: `rollback_${marker}@example.test` });
      }
      await assert.rejects(() => seedDemo(app, { DEMO_CAMILLE_PASSWORD: passwords.DEMO_CAMILLE_PASSWORD }), /DEMO_THOMAS_PASSWORD/);
      assert.equal(await snapshot(), original);
    } finally { fixtures.demoUsers.forEach((user, index) => Object.assign(user, originals[index])); }
  } finally {
    try { await app.destroy(); }
    finally {
      try {
        if (schemaCreated) await client.query(`DROP SCHEMA "${schema}" CASCADE`);
      } finally { await client.end(); }
    }
  }
});
