# Communauté Le Revenu

Community forum built with Next.js, React, TypeScript, Tailwind CSS, Strapi v5 and PostgreSQL. Includes discussion search, category filters, replies, optimistic useful votes and best answers.

## Run the demo

Requires Node.js 24, npm and a running PostgreSQL server with a database owned by the configured application user.

```sh
npm run setup:env
```

Edit the database connection in `backend/.env`. Environment files are ignored by Git; existing files are preserved. Then run:

```sh
npm run demo
```

This installs dependencies, checks PostgreSQL, seeds sample data and starts both apps. No root `npm install` is needed. Keep the terminal open; Ctrl+C stops both apps. PostgreSQL must already be running. Stop any existing app instances before starting.

- Forum: http://localhost:3000
- Strapi admin: http://127.0.0.1:1337/admin (create a separate admin account on first visit)

On Windows PowerShell, use `npm.cmd` instead of `npm`.

## Demo accounts

| Username | Password |
| --- | --- |
| `camille_demo` | `CamilleDemo2026!` |
| `thomas_demo` | `ThomasDemo2026!` |

The seed includes two members, four categories, five discussions and five replies. These public demo passwords match a newly generated `backend/.env`; override them there before the first seed if needed. Reseeding preserves existing content and passwords.

## Development

After initial setup, start each app in a separate terminal:

```sh
npm run dev:backend
npm run dev:frontend
```

Next.js calls Strapi over HTTP; Strapi handles authentication, business rules and PostgreSQL access. Frontend code is in `frontend/src/`; backend APIs and seeds are in `backend/src/`.

For custom ports, update backend `PORT` and `FRONTEND_URL`, plus frontend `STRAPI_URL`.

## Checks

```sh
npm run lint:frontend
npm run typecheck:frontend
npm run typecheck:backend
npm run test:ui
npm run test:api
npm run test:frontend
```

API tests use an isolated PostgreSQL schema. Frontend HTTP tests require both apps running with demo data. UI tests run without servers.
