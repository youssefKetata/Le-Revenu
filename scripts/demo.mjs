import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseEnv } from 'node:util';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const children = new Set();
const npmCli = process.env.npm_execpath;
const childEnv = { ...process.env, NODE_ENV: 'development' };
let stopping = false;

function start(args) {
  const child = spawn(process.execPath, [npmCli, ...args], {
    cwd: root, env: childEnv, stdio: 'inherit', windowsHide: true,
    detached: process.platform !== 'win32',
  });
  children.add(child);
  const finished = new Promise((done, reject) => {
    child.once('error', reject);
    child.once('exit', (code) => {
      children.delete(child);
      if (code === 0 || stopping) done();
      else reject(new Error(`npm ${args.join(' ')} exited with code ${code}.`));
    });
  });
  return { child, finished };
}

async function stop() {
  if (stopping) return;
  stopping = true;
  await Promise.all([...children].map(async (child) => {
    if (!child.pid) return;
    if (process.platform === 'win32') {
      await new Promise((done) => {
        // Kill only process trees created by this command, including npm's servers.
        const killer = spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], {
          stdio: 'ignore', windowsHide: true,
        });
        killer.once('error', done);
        killer.once('exit', done);
      });
    } else {
      try { process.kill(-child.pid, 'SIGTERM'); }
      catch (error) { if (error.code !== 'ESRCH') throw error; }
    }
  }));
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => { void stop(); });
}

function environment(name) {
  let contents;
  try { contents = readFileSync(resolve(root, name, '.env'), 'utf8'); }
  catch { throw new Error(`Missing ${name}/.env. Run npm run setup:env, then configure PostgreSQL in backend/.env.`); }
  if (/GENERATE_(SECRET|APP_KEYS)/.test(contents)) {
    throw new Error(`${name}/.env still contains placeholders. Use npm run setup:env to generate a new file, or replace the placeholders.`);
  }
  return parseEnv(contents);
}

function available(port, host) {
  return new Promise((done, reject) => {
    const server = createServer();
    server.once('error', () => reject(new Error(`Port ${port} on ${host} is unavailable. Stop the other server before running the demo.`)));
    server.listen(port, host, () => server.close(done));
  });
}

async function ready(url, ...servers) {
  const polling = async () => {
    const deadline = Date.now() + 180_000;
    while (!stopping && Date.now() < deadline) {
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(5_000) });
        await response.body?.cancel();
        if (response.ok) return;
      } catch { /* A cold server may still be compiling. */ }
      await new Promise((done) => setTimeout(done, 500));
    }
    if (!stopping) throw new Error(`Timed out waiting for ${url}. Check the server output above.`);
  };
  await Promise.race([
    polling(),
    ...servers.map((server) => server.finished.then(() => {
      if (!stopping) throw new Error(`Server stopped before ${url} was ready.`);
    })),
  ]);
}

try {
  if (Number(process.versions.node.split('.')[0]) !== 24) throw new Error('Use Node.js 24 LTS to run this project.');
  if (!npmCli) throw new Error('Run this script with npm run demo.');
  const backend = environment('backend');
  const frontend = environment('frontend');
  const backendUrl = new URL(frontend.STRAPI_URL);
  const frontendUrl = new URL(backend.FRONTEND_URL ?? 'http://localhost:3000');
  const backendPort = Number(backend.PORT ?? 1337);
  const frontendPort = Number(frontendUrl.port || 80);
  if (backendUrl.protocol !== 'http:' || frontendUrl.protocol !== 'http:' ||
      Number(backendUrl.port || 80) !== backendPort) {
    throw new Error('For the local demo, use matching HTTP URLs and ports in FRONTEND_URL, STRAPI_URL and PORT.');
  }
  await Promise.all([
    available(backendPort, backend.HOST ?? '127.0.0.1'),
    available(frontendPort, frontendUrl.hostname),
  ]);
  const steps = [
    ['Installing frontend dependencies', ['--prefix', 'frontend', 'ci', '--no-audit', '--no-fund']],
    ['Installing backend dependencies', ['--prefix', 'backend', 'ci', '--no-audit', '--no-fund']],
    ['Checking PostgreSQL', ['run', 'db:check']],
    ['Initializing schemas and demo data', ['run', 'seed:demo']],
  ];
  for (const [label, args] of steps) {
    if (stopping) break;
    console.log(`\n${label}…`);
    await start(args).finished;
  }
  if (!stopping) {
    console.log('\nStarting Strapi…');
    const api = start(['run', 'dev:backend']);
    await ready(new URL('/_health', backendUrl), api);
    if (!stopping) {
      console.log('\nStarting Next.js…');
      const web = start(['--prefix', 'frontend', 'run', 'dev', '--', '--hostname', frontendUrl.hostname, '--port', String(frontendPort)]);
      await ready(new URL('/api/health', frontendUrl), web, api);
      await ready(frontendUrl, web, api);
      if (!stopping) console.log(`\nDemo ready: ${frontendUrl.origin}\nStrapi admin: ${backendUrl.origin}/admin\nPress Ctrl+C to stop both applications.\n`);
      await Promise.race([api.finished, web.finished]);
      if (!stopping) throw new Error('An application stopped. Check the server output above.');
    }
  }
} catch (error) {
  if (!stopping) {
    console.error(`\nDemo startup failed: ${error.message}`);
    process.exitCode = 1;
  }
} finally {
  await stop();
}
