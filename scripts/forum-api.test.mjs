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

test('forum integration', { timeout: 90_000 }, async t => {
  const context = await compileStrapi({ appDir: backend });
  const app = createStrapi(context);
  const { seedDemo } = require(resolve(context.distDir, 'src/seeds/demo.js'));
  const fixtures = require(resolve(context.distDir, 'src/seeds/demo-data.js'));
  const { configureForumPermissions } = require(resolve(context.distDir, 'src/permissions/forum.js'));
  const connection = app.config.get('database.connection.connection');
  const client = new Client({ ...connection, password: connection.password });
  const schema = `forum_api_test_${randomBytes(6).toString('hex')}`;
  assert.match(schema, /^forum_api_test_[a-f0-9]{12}$/);
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
      const response = await fetch(base + path, options);
      return { status: response.status, body: await response.json() };
    }
    const post = (body, token) => ({
      method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body),
    });
    const counts = async () => [await app.db.query('api::discussion.discussion').count(), await app.db.query('api::reply.reply').count()];
    const passwords = { DEMO_CAMILLE_PASSWORD: randomBytes(24).toString('hex'), DEMO_THOMAS_PASSWORD: randomBytes(24).toString('hex') };
    let events = 0;
    let finishEvents;
    const eventsFinished = new Promise(done => { finishEvents = done; });
    const unsubscribe = app.eventHub.on('entry.create', () => { if (++events === 16) finishEvents(); });
    let timer;
    let seeded;
    try {
      seeded = await seedDemo(app, passwords);
      await Promise.race([eventsFinished, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Seed events did not finish.')), 15_000); })]);
    } finally { clearTimeout(timer); unsubscribe(); }
    const ids = fixtures.demoDiscussions.map(row => row.documentId);
    const valid = { title: 'A discussion published by a member', content: 'Member content.', type: 'question', category: fixtures.demoCategories[0].documentId };
    let firstToken;
    let secondToken;
    let publishedId;

    await t.test('seed creates the demo data and preserves edits/passwords on rerun', async () => {
      assert.deepEqual(Object.values(seeded).map(value => value.created), [2, 4, 5, 5]);
      const users = app.db.query('plugin::users-permissions.user');
      const saved = await users.findOne({ where: { documentId: fixtures.demoUsers[0].documentId } });
      assert.equal(await app.plugin('users-permissions').service('user').validatePassword(passwords.DEMO_CAMILLE_PASSWORD, saved.password), true);
      await app.db.query('api::discussion.discussion').update({ where: { documentId: ids[0] }, data: { title: 'An edited demo discussion' } });
      const rerun = await seedDemo(app, {});
      assert.deepEqual(Object.values(rerun).map(value => value.created), [0, 0, 0, 0]);
      assert.deepEqual(Object.values(rerun).map(value => value.kept), [2, 4, 5, 5]);
      assert.equal((await app.documents('api::discussion.discussion').findOne({ documentId: ids[0] })).title, 'An edited demo discussion');
      assert.ok((await users.findOne({ where: { documentId: saved.documentId } })).password === saved.password);
    });

    await t.test('reads filter, sort and paginate safely with batched reply counts', async () => {
      for (const [index, day] of [1, 2, 3, 4, 1].entries()) {
        await app.db.query('api::discussion.discussion').update({ where: { documentId: ids[index] }, data: { createdAt: `2026-01-0${day}T00:00:00.000Z` } });
      }
      async function feed(pageSize) {
        const sql = [];
        const collect = query => { if (/select/i.test(query.sql)) sql.push(query.sql); };
        app.db.connection.on('query', collect);
        let result;
        try { result = await request(`/api/discussions?pageSize=${pageSize}`); }
        finally { app.db.connection.removeListener('query', collect); }
        assert.equal(result.status, 200);
        const replyQueries = sql.filter(query => query.includes('"replies"'));
        assert.equal(replyQueries.length, 1);
        assert.match(replyQueries[0], /count\(\*\).*group by/is);
        return { ...result, queries: sql.length };
      }
      const small = await feed(1);
      const full = await feed(5);
      assert.equal(small.queries, full.queries);
      assert.deepEqual(full.body.data.map(row => row.documentId), [ids[3], ids[2], ids[1], ids[0], ids[4]]);
      assert.deepEqual(full.body.data.map(row => row.replyCount), [1, 1, 1, 2, 0]);
      for (const row of full.body.data) {
        assert.deepEqual(Object.keys(row.author).sort(), ['documentId', 'username']);
        assert.equal('replies' in row || 'content' in row, false);
        assert.equal(typeof row.excerpt, 'string');
        assert.ok(row.excerpt.length <= 220);
        assert.ok(fixtures.demoDiscussions.find(item => item.documentId === row.documentId).content.replace(/\s+/g, ' ').startsWith(row.excerpt));
      }
      const filtered = await request('/api/discussions?category=bourse&sort=oldest&pageSize=1&page=2');
      assert.deepEqual(filtered.body.meta.pagination, { page: 2, pageSize: 1, pageCount: 2, total: 2 });
      assert.equal(filtered.body.data[0].documentId, ids[4]);
      assert.equal((await request('/api/categories')).body.data.length, 4);
      assert.deepEqual((await request(`/api/discussions/${ids[4]}/replies`)).body.data, []);
      assert.equal((await request(`/api/discussions/${'z'.repeat(24)}`)).status, 404);
      assert.equal((await request('/api/discussions?pageSize=101')).status, 400);
      assert.equal((await request('/api/discussions?populate=*')).status, 400);
    });

    await t.test('native login and publishing persist the authenticated authors and reply count', async () => {
      assert.equal((await request('/api/auth/local', post({ identifier: fixtures.demoUsers[0].username, password: 'wrong-password' }))).status, 400);
      const first = await request('/api/auth/local', post({ identifier: fixtures.demoUsers[0].username, password: passwords.DEMO_CAMILLE_PASSWORD }));
      const second = await request('/api/auth/local', post({ identifier: fixtures.demoUsers[1].email, password: passwords.DEMO_THOMAS_PASSWORD }));
      assert.equal(first.status, 200);
      assert.equal(second.status, 200);
      firstToken = first.body.jwt;
      secondToken = second.body.jwt;
      const payload = require('jsonwebtoken').decode(firstToken);
      assert.equal(payload.exp - payload.iat, 600);
      const created = await request('/api/discussions', post({ data: { ...valid, title: `  ${valid.title}  `, content: '  Stored content.  ' } }, firstToken));
      assert.equal(created.status, 201);
      publishedId = created.body.data.documentId;
      assert.equal(created.body.data.title, valid.title);
      assert.equal(created.body.data.author.documentId, fixtures.demoUsers[0].documentId);
      const reply = await request(`/api/discussions/${publishedId}/replies`, post({ data: { content: '  A member reply.  ' } }, secondToken));
      assert.equal(reply.status, 201);
      assert.equal(reply.body.data.content, 'A member reply.');
      assert.deepEqual(reply.body.data.author, { documentId: fixtures.demoUsers[1].documentId, username: fixtures.demoUsers[1].username });
      const detail = await request(`/api/discussions/${publishedId}`);
      assert.equal(detail.body.data.content, 'Stored content.');
      assert.equal(detail.body.data.replyCount, 1);
      assert.equal((await request(`/api/discussions/${publishedId}/replies`)).body.data[0].documentId, reply.body.data.documentId);
    });

    await t.test('anonymous/forged requests, invalid input and author spoofing cannot write', async () => {
      const before = await counts();
      for (const token of [undefined, 'forged-token']) {
        assert.equal((await request('/api/discussions', post({ data: valid }, token))).status, token ? 401 : 403);
        assert.equal((await request(`/api/discussions/${publishedId}/replies`, post({ data: { content: 'reply' } }, token))).status, token ? 401 : 403);
      }
      for (const changes of [{ title: '    123456789    ' }, { content: ' \n ' }, { type: 'poll' }, { category: null }, { content: 'x'.repeat(50_001) }, { author: fixtures.demoUsers[1].documentId }]) {
        assert.equal((await request('/api/discussions', post({ data: { ...valid, ...changes } }, firstToken))).status, 400);
      }
      assert.equal((await request('/api/discussions', post({}, firstToken))).status, 400);
      assert.equal((await request('/api/discussions', post({ data: { ...valid, category: 'z'.repeat(24) } }, firstToken))).status, 404);
      for (const data of [{ content: ' \n ' }, { content: 'reply', author: fixtures.demoUsers[0].documentId }]) {
        assert.equal((await request(`/api/discussions/${publishedId}/replies`, post({ data }, secondToken))).status, 400);
      }
      assert.equal((await request(`/api/discussions/${'z'.repeat(24)}/replies`, post({ data: { content: 'reply' } }, secondToken))).status, 404);
      assert.deepEqual(await counts(), before);
    });

    await t.test('expired, blocked, underprivileged and logged-out sessions cannot publish', async () => {
      const before = await counts();
      const jwt = require('jsonwebtoken');
      const expired = jwt.sign({ ...jwt.decode(firstToken), exp: Math.floor(Date.now() / 1000) - 1 }, app.config.get('plugin::users-permissions.jwtSecret'));
      assert.equal((await request('/api/discussions', post({ data: valid }, expired))).status, 401);
      const users = app.db.query('plugin::users-permissions.user');
      await users.update({ where: { documentId: fixtures.demoUsers[1].documentId }, data: { blocked: true } });
      assert.equal((await request('/api/discussions', post({ data: valid }, secondToken))).status, 401);
      await users.update({ where: { documentId: fixtures.demoUsers[1].documentId }, data: { blocked: false } });
      const role = await app.db.query('plugin::users-permissions.role').findOne({ where: { type: 'authenticated' } });
      await app.db.query('plugin::users-permissions.permission').delete({ where: { role: { id: role.id }, action: 'api::discussion.discussion.create' } });
      assert.equal((await request('/api/discussions', post({ data: valid }, secondToken))).status, 403);
      await configureForumPermissions(app);
      assert.equal((await request('/api/auth/logout', post({}, firstToken))).status, 200);
      assert.equal((await request('/api/users/me', { headers: { Authorization: `Bearer ${firstToken}` } })).status, 401);
      assert.equal((await request('/api/discussions', post({ data: valid }, firstToken))).status, 401);
      assert.equal((await request(`/api/discussions/${publishedId}/replies`, post({ data: { content: 'reply' } }, firstToken))).status, 401);
      assert.equal((await request('/api/users/me', { headers: { Authorization: `Bearer ${secondToken}` } })).status, 200);
      assert.deepEqual(await counts(), before);
    });
  } finally {
    try { await app.destroy(); }
    finally {
      try { if (schemaCreated) await client.query(`DROP SCHEMA "${schema}" CASCADE`); }
      finally { await client.end(); }
    }
  }
});
