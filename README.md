# Communauté Le Revenu

Community forum built with Next.js, React, TypeScript, Tailwind CSS, Strapi v5 and PostgreSQL. Includes discussion search, category filters, replies, optimistic useful votes and best answers.

## Run with Docker Compose

Requires Docker Desktop running with Linux containers; no local Node.js or PostgreSQL needed. Ports 3000 and 1337 must be free.

Generate the environment files (existing files are preserved):

```sh
docker run --rm -v "${PWD}:/app" -w /app node:24-bookworm-slim node scripts/setup-env.mjs
```

On Linux, add `--user "$(id -u):$(id -g)"` after `--rm` so the generated files belong to your user. If Node.js 24 is installed, `npm run setup:env` works too.

Then start everything:

```sh
docker compose --env-file backend/.env up --build
```

Compose builds both apps, starts PostgreSQL, seeds demo data and waits for backend readiness. The first build takes several minutes.

- Forum: http://localhost:3000
- Strapi admin: http://localhost:1337/admin (create a separate admin account on first visit)

Ctrl+C stops the stack. `docker compose --env-file backend/.env down` removes containers and preserves database/upload volumes. Docker uses a separate database with the generated credentials; no connection edits are needed. Keep those credentials unchanged when reusing its volume.

## Run without Docker

Requires Node.js 24, npm and a running PostgreSQL server with a database owned by the configured application user.

```sh
npm run setup:env
```

Edit the database connection in `backend/.env`, then run:

```sh
npm run demo
```

This installs dependencies, checks PostgreSQL, seeds data and starts both apps at the URLs above. No root `npm install` is needed. Ctrl+C stops both apps; PostgreSQL stays running. Stop existing app instances first.

Environment files are ignored by Git. On Windows PowerShell, use `npm.cmd` instead of `npm`.

## Demo accounts

| Username | Password |
| --- | --- |
| `camille_demo` | `CamilleDemo2026!` |
| `thomas_demo` | `ThomasDemo2026!` |

The seed includes two members, four categories, five discussions and five replies. These public demo passwords match a newly generated `backend/.env`; override them there before the first seed if needed. Reseeding preserves existing content and passwords.

## Development

After setup without Docker, start each app in a separate terminal:

```sh
npm run dev:backend
npm run dev:frontend
```

Next.js calls Strapi over HTTP; Strapi handles authentication, business rules and PostgreSQL access. Frontend code is in `frontend/src/`; backend APIs and seeds are in `backend/src/`.

For custom ports without Docker, update backend `PORT` and `FRONTEND_URL`, plus frontend `STRAPI_URL`.

## Architecture choices

Pages read Strapi REST data in Server Components through the typed `frontend/src/lib/forum/api.ts` functions and the server-only HTTP transport. Reads use `cache: "no-store"`; successful writes revalidate the affected routes before redirecting or refreshing the current view. Client Components handle forms, dialogs and optimistic voting. Loading, empty and service-error states are rendered explicitly.

Strapi owns validation, authorship and persistence. Controllers accept only the intended fields; services use the v5 Document Service, and policies enforce active member sessions alongside native Users & Permissions. The frontend stores the access token in a ten-minute HttpOnly, SameSite cookie and forwards it to Strapi. Queries paginate and sort on the backend, populate selected relation fields and batch reply/vote counts. PostgreSQL row locks serialize competing votes and best-answer changes.

The shared dialogs, selects and menus use Radix primitives adapted from shadcn/ui for keyboard and focus behavior; `tw-animate-css` supplies their transitions. `clsx` and `tailwind-merge` compose Tailwind classes. UI tests use jsdom and esbuild to exercise the voting component without a browser server; API and HTTP rendering tests use Node's built-in test runner.

## Checks

These commands require the local Node.js dependencies installed by `npm run demo` (or `npm ci --prefix frontend` and `npm ci --prefix backend`).

```sh
npm run lint:frontend
npm run typecheck:frontend
npm run typecheck:backend
npm run test:ui
npm run test:api
npm run test:frontend
```

API tests use the connection in `backend/.env` and create and remove an isolated PostgreSQL schema; the database user must have permission to create schemas. They start their own Strapi instance on a free port. Frontend HTTP tests require both apps running with demo data; use `TEST_FRONTEND_URL` and `TEST_STRAPI_URL` when testing custom ports. UI tests run without servers.
