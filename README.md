# Communauté Le Revenu

Technical assignment: a community forum built with Next.js App Router, React, TypeScript, Tailwind CSS, Strapi v5 and PostgreSQL.

## Current scope

Phase 1 is complete: applications, database connection and local startup are verified. The frontend currently shows a small French placeholder page. Discussion schemas, demo members, publishing and forum screens are planned in the [implementation plan](IMPLEMENTATION_PLAN.md).

```text
frontend/                 Next.js application
backend/                  Strapi v5 application and database configuration
scripts/setup-env.mjs     Creates local environment files and random secrets
scripts/check-database.mjs Verifies the configured application database connection
```

Next.js communicates with Strapi over HTTP. Strapi owns all content, business rules and database access. The database-check script is a developer diagnostic, outside the Next.js application.

## Prerequisites

- Node.js 24 LTS and npm.
- A running PostgreSQL server. This machine uses the existing PostgreSQL 18.1 Windows service on port 5432.
- PostgreSQL administrator access for the initial creation of a dedicated database and restricted application role.

No Docker, separate database server, cloud account, Redis or additional runtime is required.

## Installation on a fresh checkout

Run from the repository root:

```powershell
npm --prefix frontend ci
npm --prefix backend ci
npm run setup:env
```

`setup:env` copies the committed environment examples and generates random local passwords and signing secrets. It preserves existing `.env` files and never prints secret values. Real environment files are ignored by Git.

Create an application role and database in your existing PostgreSQL installation. For example, open SQL Shell / psql as the local PostgreSQL administrator:

```powershell
& 'C:\Program Files\PostgreSQL\18\bin\psql.exe' -h 127.0.0.1 -U postgres -d postgres
```

Then run in psql:

```sql
CREATE ROLE le_revenu LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE;
\password le_revenu
CREATE DATABASE le_revenu OWNER le_revenu;
\q
```

At the password prompt, use the generated `DATABASE_PASSWORD` from `backend/.env`. Alternatively, choose a password and update `backend/.env` to match. The administrator password is only used by psql during setup; the application uses the restricted `le_revenu` role.

For an existing project database, skip creation and update `backend/.env` with its connection settings. The script does not reset passwords or modify existing databases.

Verify connectivity after installing backend dependencies:

```powershell
npm run db:check
```

The output includes the database name, application role and PostgreSQL version, without passwords.

## Development

Ensure your existing PostgreSQL service is running. On this machine, `le_revenu` and its restricted role have already been created; no database initialization command is needed on subsequent runs.

Open two terminals in the repository root.

Terminal 1:

```powershell
npm run dev:backend
```

Terminal 2:

```powershell
npm run dev:frontend
```

- Frontend: http://localhost:3000
- Strapi admin: http://127.0.0.1:1337/admin
- Strapi health: http://127.0.0.1:1337/_health (HTTP 204)
- Frontend connection check: http://localhost:3000/api/health

On the first Strapi admin visit, create a local administrator account. This is distinct from the forum demo-member accounts, which will be introduced in a later phase. Do not commit admin credentials.

The frontend connection check returns HTTP 200 when Next.js can reach Strapi, or HTTP 503 when Strapi is unavailable. It does not perform an independent database query; Strapi initializes its database connection at startup. Use `db:check` for the direct database diagnostic.

Stop application processes with Ctrl+C. Your existing PostgreSQL Windows service stays under its normal Windows service management.

## Checks and production-mode startup

Run checks and builds sequentially on an 8 GB machine:

```powershell
npm run lint:frontend
npm run typecheck:frontend
npm run typecheck:backend
npm run build:backend
npm run build:frontend
```

After successful builds, the applications can be run in separate terminals:

```powershell
$env:NODE_ENV = 'production'
npm run start:backend
```

```powershell
npm run start:frontend
```

Stop development processes before running production builds. The Strapi database pool is limited to three connections for local development. Production mode avoids keeping development watchers active when only a demonstration is needed. Automated feature tests will be added alongside the forum behavior in subsequent phases.

Use a new terminal for `dev:backend`, or set `$env:NODE_ENV = 'development'` when switching that terminal back to development.

## Configuration and boundaries

- Backend environment template: `backend/.env.example`.
- Frontend environment template: `frontend/.env.example`.
- Backend database configuration: `backend/config/database.ts`, PostgreSQL only.
- `STRAPI_URL` is server-side configuration. Never place database credentials or privileged Strapi tokens in `NEXT_PUBLIC_*` variables.
- The placeholder page uses system fonts so startup/build does not require an external font download. Typography will be refined during the design phase.
- Dependencies for the two applications are installed separately, with their own lockfiles; Strapi's admin React version is independent from the Next.js frontend.
- Strapi content-type schemas will be committed to Git. Its application database tables are initialized through Strapi; no hand-written forum SQL schema is used.

## Phase 1 verification

Verified locally with Node.js 24.21.0, npm 11.19.0, Next.js 16.4.3, React 19.3.0, Strapi 5.59.0 and PostgreSQL 18.1:

- Frontend lint and frontend/backend TypeScript checks pass.
- Both production builds pass.
- Strapi starts, initializes its PostgreSQL system tables, serves the admin page (HTTP 200), and responds to `/_health` (HTTP 204).
- Next.js serves the home page (HTTP 200), missing routes (HTTP 404), and `/api/health` (HTTP 200 with both services healthy).
- `/api/health` returns HTTP 503 when Strapi is stopped and uses `Cache-Control: no-store`.
- Environment generation preserves existing files; real secrets remain excluded from Git.

## Source material

- `Test_technique_Developpeur_Full_Stack_Le_Revenu.pdf`
- `maquette-communaute-le-revenu.html`
- `IMPLEMENTATION_PLAN.md`
