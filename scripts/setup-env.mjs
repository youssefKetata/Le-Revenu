import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const secret = () => randomBytes(32).toString('base64url');

for (const name of ['backend', 'frontend']) {
  const target = resolve(root, name, '.env');
  if (existsSync(target)) {
    console.log(`${name}/.env already exists; keeping it unchanged.`);
    continue;
  }

  let contents = readFileSync(resolve(root, name, '.env.example'), 'utf8');
  contents = contents.replaceAll('GENERATE_APP_KEYS', () => Array.from({ length: 4 }, secret).join(','));
  contents = contents.replaceAll('GENERATE_SECRET', secret);
  writeFileSync(target, contents, { flag: 'wx', mode: 0o600 });
  console.log(`Created ${name}/.env with local credentials (values hidden).`);
}
