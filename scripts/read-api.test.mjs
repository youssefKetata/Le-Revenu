import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const backend = resolve(dirname(fileURLToPath(import.meta.url)), '../backend');
const require = createRequire(resolve(backend, 'package.json'));
process.chdir(backend);
process.env.NODE_ENV = 'production';
const { compileStrapi, createStrapi } = require('@strapi/strapi');
const { Client } = require('pg');

test('public forum read API', { timeout: 90_000 }, async t => {
  const context = await compileStrapi({ appDir: backend });
  const app = createStrapi(context);
  const { seedDemo } = require(resolve(context.distDir, 'src/seeds/demo.js'));
  const fixtures = require(resolve(context.distDir, 'src/seeds/demo-data.js'));
  const { configureForumPermissions } = require(resolve(context.distDir, 'src/permissions/forum.js'));
  const connection = app.config.get('database.connection.connection');
  const client = new Client({ ...connection, password: connection.password });
  const schema = `read_api_test_${randomBytes(6).toString('hex')}`;
  assert.match(schema, /^read_api_test_[a-f0-9]{12}$/);
  let schemaCreated = false;

  try {
    await client.connect();
    await client.query(`CREATE SCHEMA "${schema}"`);
    schemaCreated = true;
    app.config.set('database.connection.connection.schema', schema);
    app.config.set('server.host', '127.0.0.1');
    app.config.set('server.port', 0);
    await app.start();
    assert.equal(app.db.getSchemaName(), schema);
    const base = `http://127.0.0.1:${app.server.httpServer.address().port}`;
    async function request(path, options) {
      const response = await fetch(`${base}${path}`, options);
      const text = await response.text();
      const body = response.headers.get('content-type')?.includes('application/json') ? JSON.parse(text) : text;
      return { response, body };
    }

    let events = 0;
    let finishEvents;
    const eventsFinished = new Promise(resolveEvents => { finishEvents = resolveEvents; });
    const unsubscribe = app.eventHub.on('entry.create', () => {
      if (++events === 16) finishEvents();
    });
    let timer;
    try {
      await seedDemo(app, {
        DEMO_CAMILLE_PASSWORD: randomBytes(24).toString('hex'),
        DEMO_THOMAS_PASSWORD: randomBytes(24).toString('hex'),
      });
      await Promise.race([
        eventsFinished,
        new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Seed events did not finish.')), 15_000); }),
      ]);
    } finally { clearTimeout(timer); unsubscribe(); }

    const ids = fixtures.demoDiscussions.map(row => row.documentId);
    const dates = ['2026-01-01', '2026-01-02', '2026-01-03', '2026-01-04', '2026-01-01'];
    for (const [index, documentId] of ids.entries()) {
      await app.db.query('api::discussion.discussion').update({ where: { documentId }, data: { createdAt: `${dates[index]}T00:00:00.000Z` } });
    }

    await t.test('safe feed, detail and categories return the seeded content', async () => {
      const { response, body } = await request('/api/discussions');
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('cache-control'), 'no-store');
      assert.deepEqual(body.meta.pagination, { page: 1, pageSize: 25, pageCount: 1, total: 5 });
      assert.deepEqual(body.data.map(row => row.documentId), [ids[3], ids[2], ids[1], ids[0], ids[4]]);
      const counts = new Map(ids.map((id, index) => [id, [2, 1, 1, 1, 0][index]]));
      for (const row of body.data) {
        assert.deepEqual(Object.keys(row).sort(), ['documentId', 'title', 'type', 'createdAt', 'author', 'category', 'replyCount'].sort());
        assert.deepEqual(Object.keys(row.author).sort(), ['documentId', 'username']);
        assert.deepEqual(Object.keys(row.category).sort(), ['documentId', 'name', 'slug', 'icon', 'color'].sort());
        assert.equal(row.replyCount, counts.get(row.documentId));
      }
      const detail = await request(`/api/discussions/${ids[0]}`);
      assert.equal(detail.response.status, 200);
      assert.equal(detail.body.data.content, fixtures.demoDiscussions[0].content);
      assert.equal(detail.body.data.replyCount, 2);
      assert.equal('replies' in detail.body.data, false);
      assert.deepEqual(detail.body.data.author, { documentId: fixtures.demoUsers[0].documentId, username: fixtures.demoUsers[0].username });
      const categories = await request('/api/categories?pageSize=2');
      assert.equal(categories.response.status, 200);
      assert.equal(categories.body.data.length, 2);
      assert.deepEqual(categories.body.meta.pagination, { page: 1, pageSize: 2, pageCount: 2, total: 4 });
      assert.ok(categories.body.data.every(row => !('discussions' in row) && !('id' in row)));
      const secondPage = await request('/api/categories?pageSize=2&page=2');
      assert.equal(new Set([...categories.body.data, ...secondPage.body.data].map(row => row.documentId)).size, 4);
    });

    await t.test('category filtering, date sorting and tie-breaking happen before pagination', async () => {
      const first = await request('/api/discussions?category=bourse&sort=oldest&pageSize=1');
      const second = await request('/api/discussions?category=bourse&sort=oldest&pageSize=1&page=2');
      assert.deepEqual(first.body.meta.pagination, { page: 1, pageSize: 1, pageCount: 2, total: 2 });
      assert.equal(first.body.data[0].documentId, ids[0]);
      assert.equal(second.body.data[0].documentId, ids[4]);
      const oldest = await request('/api/discussions?sort=oldest&pageSize=2&page=2');
      assert.deepEqual(oldest.body.data.map(row => row.documentId), [ids[1], ids[2]]);
      const none = await request('/api/discussions?category=unknown-category');
      assert.equal(none.response.status, 200);
      assert.deepEqual(none.body.data, []);
      assert.equal(none.body.meta.pagination.total, 0);
      assert.equal(none.body.meta.pagination.pageCount, 0);
      const outOfRange = await request('/api/discussions?page=10');
      assert.equal(outOfRange.response.status, 200);
      assert.deepEqual(outOfRange.body.data, []);
      assert.equal(outOfRange.body.meta.pagination.total, 5);
      const boundary = await request('/api/discussions?pageSize=100&page=1001');
      assert.equal(boundary.response.status, 200);
      assert.deepEqual(boundary.body.data, []);
    });

    await t.test('replies are separately paginated and ordered, including empty threads', async () => {
      const first = await request(`/api/discussions/${ids[0]}/replies?pageSize=1`);
      const second = await request(`/api/discussions/${ids[0]}/replies?pageSize=1&page=2`);
      assert.equal(first.response.status, 200);
      assert.deepEqual(first.body.meta.pagination, { page: 1, pageSize: 1, pageCount: 2, total: 2 });
      assert.equal(first.body.data[0].documentId, fixtures.demoReplies[0].documentId);
      assert.equal(second.body.data[0].documentId, fixtures.demoReplies[1].documentId);
      assert.deepEqual(Object.keys(first.body.data[0]).sort(), ['documentId', 'content', 'createdAt', 'author'].sort());
      assert.deepEqual(Object.keys(first.body.data[0].author).sort(), ['documentId', 'username']);
      const empty = await request(`/api/discussions/${ids[4]}/replies`);
      assert.equal(empty.response.status, 200);
      assert.deepEqual(empty.body.data, []);
      assert.equal(empty.body.meta.pagination.total, 0);
    });

    await t.test('invalid and unsupported queries return coherent 400/404 errors', async () => {
      for (const query of [
        'page=0', 'page=-1', 'page=1.5', 'page=1e2', 'page=', 'page=9007199254740992',
        'page=1&page=2', 'page[]=1', 'pageSize=0', 'pageSize=101', 'pageSize=-1',
        'pageSize=100&page=1002', 'sort=popular', 'sort[]=oldest', 'category=', 'category[]=bourse',
        'populate=*', 'fields=email', 'filters[author][email][$eq]=example', '_q=foo',
      ]) {
        const { response, body } = await request(`/api/discussions?${query}`);
        assert.equal(response.status, 400, query);
        assert.equal(body.error.status, 400, query);
      }
      for (const path of ['/api/categories?sort=oldest', `/api/discussions/${ids[0]}?populate=*`, `/api/discussions/${ids[0]}/replies?sort=newest`, '/api/discussions/1']) {
        assert.equal((await request(path)).response.status, 400, path);
      }
      for (const path of [`/api/discussions/${'z'.repeat(24)}`, `/api/discussions/${'z'.repeat(24)}/replies`]) {
        const { response, body } = await request(path);
        assert.equal(response.status, 404);
        assert.equal(body.error.status, 404);
      }
    });

    await t.test('feed uses one grouped reply-count query for a whole page', async () => {
      async function countQueries(pageSize) {
        const sql = [];
        const collect = query => { if (/select/i.test(query.sql)) sql.push(query.sql); };
        app.db.connection.on('query', collect);
        try { assert.equal((await request(`/api/discussions?pageSize=${pageSize}`)).response.status, 200); }
        finally { app.db.connection.removeListener('query', collect); }
        const replyQueries = sql.filter(query => query.includes('"replies"'));
        assert.equal(replyQueries.length, 1);
        assert.match(replyQueries[0], /count\(\*\).*group by/is);
        return sql.length;
      }
      assert.equal(await countQueries(1), await countQueries(5));
    });

    await t.test('public and member permissions allow only the intended forum reads', async () => {
      const user = await app.db.query('plugin::users-permissions.user').findOne({ where: { documentId: fixtures.demoUsers[1].documentId } });
      const token = await app.plugin('users-permissions').service('jwt').issue({ id: user.id });
      const headers = { Authorization: `Bearer ${token}` };
      assert.equal((await request('/api/discussions', { headers })).response.status, 200);
      for (const options of [{}, { headers }]) {
        assert.equal((await request('/api/users', options)).response.status, 403);
        assert.equal((await request('/api/users/count', options)).response.status, 403);
        assert.equal((await request(`/api/users/${user.id}`, options)).response.status, 403);
        for (const path of ['/api/discussions', '/api/categories', `/api/discussions/${ids[0]}/replies`]) {
          assert.equal((await request(path, { ...options, method: 'POST' })).response.status, 405);
        }
      }
      const registration = await request('/api/auth/local/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'unexpected_member', email: 'unexpected@example.test', password: randomBytes(24).toString('hex') }) });
      assert.equal(registration.response.status, 400);
      assert.equal(await app.db.query('plugin::users-permissions.user').count(), 2);

      const role = await app.db.query('plugin::users-permissions.role').findOne({ where: { type: 'public' } });
      const permissions = app.db.query('plugin::users-permissions.permission');
      await permissions.delete({ where: { role: { id: role.id }, action: 'api::discussion.discussion.find' } });
      assert.equal((await request('/api/discussions')).response.status, 403);
      await permissions.create({ data: { role: role.id, action: 'api::discussion.discussion.create' } });
      await permissions.create({ data: { role: role.id, action: 'plugin::users-permissions.user.count' } });
      await configureForumPermissions(app);
      assert.equal((await request('/api/discussions')).response.status, 200);
      assert.equal(await permissions.count({ where: { role: { id: role.id }, action: 'api::discussion.discussion.create' } }), 0);
      assert.equal(await permissions.count({ where: { role: { id: role.id }, action: 'plugin::users-permissions.user.count' } }), 0);
      const before = await permissions.count();
      await configureForumPermissions(app);
      assert.equal(await permissions.count(), before);
    });

    await t.test('dashboard deletions of an author or category do not break reads', async () => {
      await app.documents('plugin::users-permissions.user').delete({ documentId: fixtures.demoUsers[0].documentId });
      await app.documents('api::category.category').delete({ documentId: fixtures.demoCategories[0].documentId });
      const detail = await request(`/api/discussions/${ids[0]}`);
      assert.equal(detail.response.status, 200);
      assert.equal(detail.body.data.author, null);
      assert.equal(detail.body.data.category, null);
      assert.equal(detail.body.data.replyCount, 2);
      const replies = await request(`/api/discussions/${ids[0]}/replies`);
      assert.equal(replies.response.status, 200);
      assert.ok(replies.body.data.some(row => row.author === null));
    });
  } finally {
    try { await app.destroy(); }
    finally {
      try { if (schemaCreated) await client.query(`DROP SCHEMA "${schema}" CASCADE`); }
      finally { await client.end(); }
    }
  }
});
