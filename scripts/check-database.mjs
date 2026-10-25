import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseEnv } from 'node:util';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(resolve(root, 'backend', 'package.json'));
const { Client } = require('pg');
const env = parseEnv(readFileSync(resolve(root, 'backend', '.env'), 'utf8'));
const client = new Client({
  host: env.DATABASE_HOST,
  port: Number(env.DATABASE_PORT),
  database: env.DATABASE_NAME,
  user: env.DATABASE_USERNAME,
  password: env.DATABASE_PASSWORD,
  ssl: env.DATABASE_SSL === 'true' ? { rejectUnauthorized: true } : false,
  connectionTimeoutMillis: 5_000,
});

try {
  await client.connect();
  const { rows } = await client.query('SELECT current_database() AS database, current_user AS role, version() AS version');
  console.log(rows[0]);
} catch (error) {
  console.error(`Database connection failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await client.end();
}
