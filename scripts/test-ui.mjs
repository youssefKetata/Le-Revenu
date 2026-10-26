import { createRequire } from 'node:module';
import { mkdir, mkdtemp, rm, rmdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const frontend = resolve(dirname(fileURLToPath(import.meta.url)), '../frontend');
const require = createRequire(resolve(frontend, 'package.json'));
const { build } = require('esbuild');
const scratch = resolve(frontend, '.local');
await mkdir(scratch, { recursive: true });
const directory = await mkdtemp(resolve(scratch, 'ui-test-'));
const output = resolve(directory, 'useful-vote.test.cjs');
try {
  await build({
    entryPoints: [resolve(frontend, 'tests/useful-vote.test.jsx')],
    outfile: output,
    bundle: true,
    platform: 'node',
    format: 'cjs',
    packages: 'external',
    tsconfig: resolve(frontend, 'tsconfig.json'),
    // These tests exercise DOM behavior; styles are checked in the live application.
    loader: { '.css': 'empty', '.module.css': 'empty' },
    logLevel: 'error',
  });
  const result = spawnSync(process.execPath, ['--test', '--test-concurrency=1', output], {
    cwd: frontend, stdio: 'inherit',
  });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
} finally {
  await rm(output, { force: true });
  await rmdir(directory);
}
