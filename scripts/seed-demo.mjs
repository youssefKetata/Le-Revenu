import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const backend = resolve(root, 'backend');
const require = createRequire(resolve(backend, 'package.json'));

// Load the backend's .env and compile its TypeScript without building the admin UI.
process.chdir(backend);
const { compileStrapi, createStrapi } = require('@strapi/strapi');
let app;
try {
  const context = await compileStrapi({ appDir: backend });
  app = createStrapi(context);
  await app.load();
  const { seedDemo } = require(resolve(context.distDir, 'src/seeds/demo.js'));
  // Strapi emits document events asynchronously after the transaction commits.
  // Let those database reads finish before closing its connection pool.
  let observed = 0;
  let expected = Infinity;
  let complete;
  let timer;
  const eventsFinished = new Promise((resolveEvents) => { complete = resolveEvents; });
  const unsubscribe = app.eventHub.subscribe((event) => {
    if (event === 'entry.create' && ++observed >= expected) complete();
  });
  let summary;
  try {
    summary = await seedDemo(app);
    expected = Object.values(summary).reduce((total, counts) => total + counts.created, 0);
    if (observed < expected) {
      await Promise.race([
        eventsFinished,
        new Promise((_, reject) => {
          timer = setTimeout(() => reject(new Error('Timed out waiting for Strapi seed events.')), 15_000);
        }),
      ]);
    }
  } finally {
    clearTimeout(timer);
    unsubscribe();
  }
  console.log('Demo seed complete (existing records and passwords are preserved):');
  for (const [name, counts] of Object.entries(summary)) {
    console.log(`${name}: ${counts.created} created, ${counts.kept} kept`);
  }
} catch (error) {
  console.error(`Demo seed failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  process.exitCode = 1;
} finally {
  if (app) await app.destroy();
}
