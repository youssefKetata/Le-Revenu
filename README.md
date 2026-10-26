# Communauté Le Revenu

Technical assignment: a community forum built with Next.js App Router, React, TypeScript, Tailwind CSS, Strapi v5 and PostgreSQL.

## Current scope

Phases 1–4 are implemented, with the v2 UI and discussion-search, useful-vote and best-answer bonuses: live feeds, category filters, date sorting, detailed/compact views, discussion/reply pages, and shadcn/ui login/publishing dialogs with standalone URLs. See the [implementation plan](IMPLEMENTATION_PLAN.md).

```text
frontend/                 Next.js application
backend/                  Strapi v5 application and database configuration
scripts/setup-env.mjs     Creates local environment files and random secrets
scripts/check-database.mjs Verifies the configured application database connection
scripts/seed-demo.mjs     Loads Strapi and runs its demo seed
scripts/demo.mjs          Installs dependencies, seeds and starts both applications
```

Next.js communicates with Strapi over HTTP. Strapi owns all content, business rules and database access. The database-check script is a developer diagnostic, outside the Next.js application.

## Prerequisites

- Node.js 24 LTS and npm.
- A running PostgreSQL server (verified with PostgreSQL 18.1).
- An empty PostgreSQL database and a user that owns it, configured in `backend/.env`. Administrator access is needed only if you must create that database/user first.

No Docker, Redis or cloud account is required; the applications use your PostgreSQL installation.

## Installation on a fresh checkout

Run from the repository root:

In Windows PowerShell, use `npm.cmd` wherever these examples show `npm`.

```powershell
npm run setup:env
```

This creates `backend/.env` and `frontend/.env` from the examples, generates signing secrets and a local database password, and keeps the public demo-member passwords listed below. Existing environment files are preserved. Real environment files are ignored by Git.

Edit the PostgreSQL connection settings in `backend/.env` to match your database. The defaults use database/user `le_revenu` on `127.0.0.1:5432`; set `DATABASE_PASSWORD` to that user's actual password. Keep `DATABASE_SCHEMA=public` for the normal installation. If needed, create the database/user using the instructions below.

Then start the complete demo with one command:

```powershell
npm run demo
```

No root `npm install` is needed. This command installs both applications from their lockfiles using `npm ci --no-audit --no-fund`, checks the database connection, initializes Strapi's tables and demo data, and starts Strapi and Next.js in development mode. The first dependency installation may take several minutes. It waits for both applications to respond before printing `Demo ready: http://localhost:3000`. Open that URL and log in with either [demo member](#demo-data) below. Strapi admin is at `http://127.0.0.1:1337/admin`.

Keep this terminal open; Ctrl+C stops both applications and their child processes. PostgreSQL remains running. Rerunning the command reinstalls dependencies and fills in missing demo records while preserving existing content and passwords. It refuses to start if either configured application port is occupied. A failed startup stops the other application and prints the failing step.

For different local ports, update backend `PORT`, `FRONTEND_URL`, and frontend `STRAPI_URL` together. For example, `PORT=1437`, `FRONTEND_URL=http://localhost:3100`, and `STRAPI_URL=http://127.0.0.1:1437`. The demo command uses those values. `DATABASE_SCHEMA` optionally selects an existing PostgreSQL schema; the default is `public`.

### Creating the PostgreSQL database/user, if needed

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

The demo command checks connectivity automatically. After dependencies have been installed, you can also check it independently:

```powershell
npm run db:check
```

The output includes the database name, application role and PostgreSQL version, without passwords.

## Development

`npm run demo` is the recommended first-run path. After installation and seeding, you can also start the applications separately to avoid reinstalling dependencies during development. Ensure PostgreSQL is running first.

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

On the first Strapi admin visit, create a local administrator account. This is distinct from the forum demo-member accounts described below. Do not commit admin credentials.

The frontend connection check returns HTTP 200 when Next.js can reach Strapi, or HTTP 503 when Strapi is unavailable. It does not perform an independent database query; Strapi initializes its database connection at startup. Use `db:check` for the direct database diagnostic.

Stop application processes with Ctrl+C. Your existing PostgreSQL Windows service stays under its normal Windows service management.

## Demo data

`npm run demo` seeds automatically. To reseed an installed checkout independently, stop the backend and run from the repository root:

```powershell
npm run seed:demo
```

The seed compiles the backend TypeScript, loads Strapi and writes through its native user service and Document Service API. It does not start an HTTP server or build the admin UI. Individual `dev`/`start` commands do not seed; `npm run demo` invokes this step before starting either server.

It creates two confirmed members with the Authenticated role, four French categories (Bourse, Immobilier, Épargne and Fiscalité), five discussions and five replies. The final discussion has no replies. Sample text is fictional and contains no real member information.

| Username | Email | Default demo password |
| --- | --- | --- |
| `camille_demo` | `camille.demo@example.test` | `CamilleDemo2026!` |
| `thomas_demo` | `thomas.demo@example.test` | `ThomasDemo2026!` |

These are public credentials for fictional local demo members, not database or dashboard administrator credentials. They match `DEMO_CAMILLE_PASSWORD` and `DEMO_THOMAS_PASSWORD` in a newly generated `backend/.env`. Strapi hashes them when creating the accounts. You can override them before the first seed (at least 12 characters and at most 72 UTF-8 bytes); use your configured values if you do. Existing databases keep their original passwords when the seed is rerun. Use the accounts on `/connexion` once both applications are running.

The seed creates missing records and keeps existing ones, including edited content, relations, roles and password hashes. Stable document IDs are the only seed identifiers, including after titles, usernames or slugs change. Username/email collisions with a different user cause an error; category slug collisions are rejected by the schema. All seed writes run in one transaction and roll back together on failure.

Rerun the same command to fill in missing demo records. It does not reset the database, restore edited values or reset existing passwords when environment values change. Forum API permissions are configured separately by Strapi's startup bootstrap. After seeding, start Strapi and inspect the entries in Content Manager.

## Forum content model

The versioned schemas live under `backend/src/api/<name>/content-types/<name>/schema.json`:

| Collection | Fields and relationships |
| --- | --- |
| Category | Required name and unique slug (generated from the name); optional description, icon key and six-digit hex color; many discussions |
| Discussion | Required title (10-255 characters), plain-text content and type (`question` or `discussion`); one author, one category, many replies and an optional best-answer relation |
| Reply | Required plain-text content; one author, one discussion and a many-to-many useful-voters relation |
| User | Native Users & Permissions user, extended with many discussions and replies |

`backend/src/extensions/users-permissions/strapi-server.ts` adds the inverse author relationships while preserving the plugin's native authentication fields. Forum members are distinct from Strapi administrators.

Draft & Publish is disabled on all three forum collections. Contributions have a single immediately visible version; `createdAt` is the publication date used by the forum. Strapi supplies timestamps and `documentId` values.

Start Strapi and open its Content Manager to see Category, Discussion, Reply and User. Strapi synchronizes their tables and relations to the configured project database at startup. The schemas define storage; controllers, services and policies implement the read API and publishing rules below.

After changing schemas or the user extension, regenerate the checked-in backend types:

```powershell
npm --prefix backend run strapi -- ts:generate-types
```

## Public read API

Start Strapi with `npm run dev:backend`. The API base URL is `http://127.0.0.1:1337/api`.

| Method and path | Purpose | Query parameters |
| --- | --- | --- |
| `GET /categories` | Categories with names, slugs, descriptions, icon keys and colors | `page`, `pageSize` |
| `GET /discussions` | Discussion summaries with author, category, date and reply count | `q` (search), `category` (slug), `sort` (`newest` or `oldest`), `page`, `pageSize` |
| `GET /discussions/:documentId` | Discussion content and summary fields | None |
| `GET /discussions/:documentId/replies` | Replies for one discussion, oldest first | `page`, `pageSize` |

Example: `http://127.0.0.1:1337/api/discussions?category=bourse&sort=newest&page=1&pageSize=10`.

Lists return `{ data: [...], meta: { pagination: { page, pageSize, pageCount, total } } }`. Detail returns `{ data: { ... }, meta: {} }`. Pagination defaults to page 1 and 25 records, allows at most 100 records per page, and rejects offsets above 100,000. Valid pages beyond the last page return an empty list with the matching total; unknown category slugs return an empty list. Dates use `createdAt`, with `documentId` as a stable tie-breaker. Categories are sorted by name.

The feed returns `documentId`, `title`, `excerpt`, `type`, `createdAt`, `author`, `category`, `replyCount` and `bestAnswerId`. The plain-text excerpt is at most 220 UTF-16 code units, with whitespace collapsed. Strapi projects bounded text previews in one additional batched database query for the current page; it does not transfer full bodies or issue a query per card. Only detail includes discussion `content` and the selected `bestAnswer` with its public content/byline. Replies return `documentId`, `content`, `createdAt`, `author`, `usefulCount` and `hasVoted`. Author projections contain only `documentId` and `username`; user emails, credentials, roles, tokens and voter identities are never included. Deleted authors or categories are represented by `null`. Numeric database IDs are not part of this API contract.

Queries fetch explicit fields and relations through Strapi's Document Service. Reply counts use Strapi's count-only relation population, which runs one grouped count for the page instead of fetching reply bodies or counting each discussion separately. Replies are fetched and paginated independently. Reads send `Cache-Control: no-store` so dashboard edits appear on the next request.

Search uses `q`, for example `/api/discussions?q=PDF&category=bourse&sort=oldest`. It matches a literal, case-insensitive phrase in the title or discussion content through Strapi's Document Service `$containsi` filters. Accents remain significant; replies and author names are not searched. Input is limited to 200 characters before trimming; blank input removes the search. Category filtering, date sorting and pagination apply to the same matching set, including its total count. Native Strapi escapes SQL wildcard characters. The frontend submits explicitly through a Next.js GET Form, resets the page, preserves category/sort/view and offers a clear-search link. Overlong input shows a small inline error.

This is substring search for the assignment's dataset. It adds no per-result queries and retains bounded previews/responses, but matching text and counting results can scan the table. A large forum would need measured query plans and an indexed search strategy; ordinary B-tree indexes do not accelerate arbitrary substring matching.

Invalid numbers, malformed document IDs, repeated/structured or overlong search values and unsupported query options return HTTP 400. Missing discussions return HTTP 404, including on the replies route. Arbitrary `fields`, `populate` and `filters` are not accepted by this focused API.

`backend/src/permissions/forum.ts` runs at startup and reproducibly grants these four read actions to Public and Authenticated members. Authenticated members also receive discussion/reply creation, useful-vote, best-answer, current-user and logout permissions. Other forum actions and user-directory/management endpoints remain forbidden; dashboard administrator permissions are separate. Self-registration is disabled because this project uses seeded members. Code owns these settings, so changing forum permissions only in the dashboard is not a persistent configuration change.

## Login, logout and secure publishing

Open `http://localhost:3000/connexion` and use one of the demo members above. Next.js Server Actions forward credentials to Strapi's native `POST /api/auth/local`. The frontend keeps only the access JWT in a host-only HttpOnly cookie with `SameSite=Lax`, `Path=/` and a ten-minute lifetime; `Secure` is enabled in production. Tokens are never returned in action state or stored in browser JavaScript storage. Server Actions provide Next.js's same-origin CSRF checks, and the login form has pending and error states.

This is an intentionally fixed ten-minute session. Strapi uses its current refresh-session mode, with both access-token and session lifetimes set to 600 seconds. In the Next.js login flow, the native refresh token stays in the server-side response and is discarded; the frontend does not forward refresh cookies, persist refresh tokens or rotate them. After expiry, log in again. There is no legacy JWT mode or compatibility path.

The home page checks the cookie through native `GET /api/users/me`, which also runs `global::member-session`. That policy checks Strapi's active session record as well as native JWT authentication, so a revoked token cannot authenticate the current-user request or publish. The native router factory is extended only to attach this policy to current-user/logout routes; native credential checking and logout handlers are retained. The home page displays only the username and handles an unavailable identity service separately from an unauthenticated visitor.

Logout calls native `POST /api/auth/logout` to revoke the current session, then deletes the frontend cookie. Cookie deletion still succeeds if Strapi is unavailable or the token has expired. Remote revocation is best effort during an outage; native access tokens and sessions expire after ten minutes. Logging out of one session does not log out the other member.

The Strapi write endpoints require `Authorization: Bearer <access token>`:

| Method and path | Required JSON body |
| --- | --- |
| `POST /discussions` | `{ "data": { "title": "A title of at least 10 characters", "content": "Discussion content", "type": "question", "category": "<category documentId>" } }` |
| `POST /discussions/:documentId/replies` | `{ "data": { "content": "Reply content" } }` |

Both return HTTP 201 with `{ data: { ... }, meta: {} }` and the same safe public fields used by reads. The Next.js forms forward the member's access token through Server Actions; Strapi independently enforces authorization and validation.

Strapi trims title/content before validation and storage. Titles must contain 10-255 characters after trimming; discussion content 1-50,000 and reply content 1-10,000. Type must be `question` or `discussion`. Category and discussion relations must identify existing documents. Strapi assigns the author from `ctx.state.user`; any client-supplied author, document identifier, timestamp, relation override or other unexpected field is rejected rather than silently stripped. Query options are not accepted on writes. Content is plain text and will be rendered as text by the forum UI.

Anonymous writes are rejected with HTTP 403; forged/expired/revoked sessions with HTTP 401; invalid input with HTTP 400 and field details; missing related documents with HTTP 404. Members without the relevant create permission cannot publish. Category management, discussion updates and deletion are not exposed as member operations. Each publication uses a Strapi database transaction; replies and reply counts are available on the next uncached read.

## Useful votes and best answers

Members can mark another member's reply as useful and remove their own vote. Counts are public; voter identities are never returned. The reply list includes `usefulCount` and `hasVoted` (false for anonymous visitors). Authenticated reads require an active session and resolve only the current member's votes in one additional batched query for the page. Count-only relation population avoids loading the voter list.

Only a question's author can choose, replace or clear its best answer. The selected reply must belong to that question and be authored by another member. Ordinary discussions cannot have best answers. Detail returns the selected reply's public content/byline in `bestAnswer`, independently of reply pagination; feeds expose only `bestAnswerId` and show a resolved badge. The author can clear the selection from the pinned answer even if its original reply is on another page.

| Method and path | Required JSON body |
| --- | --- |
| `POST /discussions/:documentId/replies/:replyId/useful` | `{ "data": { "useful": true } }` (use `false` to remove) |
| `POST /discussions/:documentId/best-answer` | `{ "data": { "reply": "<reply documentId>" } }` (use `null` to clear) |

Both endpoints require the member's access token and return HTTP 200 with `{ data: { ... }, meta: {} }`. Input allowlists reject author overrides and unknown fields. The useful response contains the safe updated reply, count and current member's state; the best-answer response contains `bestAnswerId`. Permissions and active-session checks apply independently of the UI. Self-votes, self-acceptance and non-owner selections return 403; invalid input/non-question selection returns 400; missing or cross-question replies return 404.

Votes use a native Strapi many-to-many relation; best answers use a single optional one-to-one relation. Writes use the Document Service inside Strapi transactions. A row lock serializes writes to the same reply/question, and explicit add/remove or select/clear operations make retries idempotent. There are no separate stored counters or external services. These additive schema changes synchronize on Strapi startup; regenerate backend types after schema edits. Existing seed data and existing member accounts are preserved.

Next.js Server Actions forward only the intended state. With JavaScript, votes use React `useOptimistic`: the button state and count update immediately, stay pending during the request, and reconcile with fresh Strapi data without navigation or moving focus. Failed requests roll back to the confirmed state and show feedback; expired sessions offer reconnection. A per-reply guard blocks duplicate submissions while saving. Without JavaScript, the same vote form uses the native Server Action and redirects to the reply after success. Best-answer changes revalidate the feed/thread and redirect to the same reply page's reply section. Reloads read persisted counts and selections. The integration suite covers duplicate/concurrent votes, independent member votes, removal, invalid and cross-question input, replacement/clearing, public field privacy and revoked/underprivileged sessions.

## Checks and production-mode startup

The one-command demo was verified on Windows from a clean source copy with no installed dependencies or build output, using an empty, separate PostgreSQL schema on the existing service. The check confirmed the initial 2 members / 4 categories / 5 discussions / 5 replies; both README logins through Next.js; question/reply creation; voting; best-answer selection; reload; and all three frontend rendering scenarios. Reseeding preserved the additional contributions, vote and selected answer. Ctrl+C stopped both test servers, and the disposable schema was removed without changing the original forum data. Custom ports 3100/1437 were used to keep the existing demo running.

Run checks and builds sequentially on an 8 GB machine:

```powershell
npm run lint:frontend
npm run typecheck:frontend
npm run typecheck:backend
npm run test:ui
npm run test:api
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

Stop development processes before running production builds. The Strapi database pool is limited to three connections for local development. Production mode avoids keeping development watchers active when only a demonstration is needed. For production login, serve Next.js over HTTPS: its production session cookie is deliberately `Secure`.

Use a new terminal for `dev:backend`, or set `$env:NODE_ENV = 'development'` when switching that terminal back to development.

## Configuration and boundaries

- Backend environment template: `backend/.env.example`.
- Frontend environment template: `frontend/.env.example`.
- Backend database configuration: `backend/config/database.ts`, PostgreSQL only.
- `STRAPI_URL` is server-side configuration. Never place database credentials or privileged Strapi tokens in `NEXT_PUBLIC_*` variables.
- Playfair Display bold and Inter are served locally from `frontend/public/fonts/`, with their Open Font Licenses included. Startup and builds do not download fonts. Body text follows the mockup's system-font/Inter stack.
- Dependencies for the two applications are installed separately, with their own lockfiles; Strapi's admin React version is independent from the Next.js frontend.
- Frontend test-only dependencies: esbuild compiles JSX for the existing Node test runner; jsdom provides a DOM for optimistic interaction tests. They add no application runtime dependency.
- Strapi content-type schemas will be committed to Git. Its application database tables are initialized through Strapi; no hand-written forum SQL schema is used.

## Phase 1 verification

Verified locally with Node.js 24.21.0, npm 11.19.0, Next.js 16.4.3, React 19.3.0, Strapi 5.59.0 and PostgreSQL 18.1:

- Frontend lint and frontend/backend TypeScript checks pass.
- Both production builds pass.
- Strapi starts, initializes its PostgreSQL system tables, serves the admin page (HTTP 200), and responds to `/_health` (HTTP 204).
- Next.js serves the home page (HTTP 200), missing routes (HTTP 404), and `/api/health` (HTTP 200 with both services healthy).
- `/api/health` returns HTTP 503 when Strapi is stopped and uses `Cache-Control: no-store`.
- Environment generation preserves existing files; real secrets remain excluded from Git.

## Phase 2 schema verification

Verified against the configured local PostgreSQL database:

- Backend type checking, schema type generation and the production admin build pass.
- Strapi starts with the new schemas; `/_health` returns HTTP 204 and `/admin` returns HTTP 200.
- Content Manager lists Category, Discussion, Reply and the native User collection.
- Temporary records verify both directions of user/discussion, user/reply, category/discussion and discussion/reply relationships.
- Eleven invalid-input checks reject short/long titles, empty content, unsupported discussion types, missing required relations, an invalid category color and a duplicate category slug.
- Native user authentication attributes remain intact. All temporary schema-check records were rolled back; demo content is created separately by `seed:demo`.

## Verification

Stop the backend development server before running the integration suite: both compile into `backend/dist`.

```powershell
npm run test:api
```

The suite starts real Strapi HTTP endpoints in an isolated PostgreSQL schema and removes that schema in cleanup. The configured database role must be able to create schemas. Eight focused scenarios cover:

- Fresh demo seeding and reruns that preserve edited content and password hashes.
- Safe feed fields, filtering, sorting, pagination and one grouped reply-count query per page.
- Title/content search, literal wildcard handling, input bounds and combined category/sort/pagination.
- Useful votes: self-vote rejection, idempotent retries/concurrency, independent member votes, removal and private voter state.
- Best answers: question ownership, reply membership, replacement/clearing, concurrency and pagination-independent detail.
- Native login and persistent discussion/reply creation with authenticated authors.
- Validation, missing relations, anonymous/forged requests and author-spoofing protection.
- Expired, blocked, underprivileged and logged-out sessions being unable to publish.

With both development servers running and demo data seeded, run three read-only frontend rendering scenarios:

```powershell
npm run test:frontend
```

These compare rendered discussions and replies with live Strapi data, verify search/filter/order and metadata, and exercise empty/invalid/missing pages and anonymous publishing navigation. They require `http://localhost:3000` and `http://127.0.0.1:1337` by default; override with `TEST_FRONTEND_URL` and `TEST_STRAPI_URL`. No database records are changed.

A separate local HTTP form check also passed Next.js login, native validation feedback, discussion creation, reply publication, reload, content escaping and logout. Its temporary discussion/reply were removed. Desktop/mobile browser checks now cover the rendered v2 layout, native login, publishing dialog and navigation. The tool cannot open the local-file mockup, so reference comparisons use its HTML/CSS values; this is not a claim of screenshot-perfect comparison. Drafts remain in memory after validation errors and are lost on reload or closing the form.

For the v2 changes, the five backend scenarios, two frontend rendering scenarios, frontend lint/TypeScript and both production builds pass. Browser checks used the normal desktop viewport and a 390 × 844 mobile viewport, including account-menu logout and Escape dismissal of dialogs.

After adding discussion search, all six backend scenarios and three frontend rendering scenarios pass, along with frontend/backend TypeScript, frontend lint and the frontend production build. Browser checks cover Enter submission, category/date-order preservation, inline length errors, empty results, clearing, browser Back and reload. Desktop and 390 × 844 mobile layouts were checked; no browser console warnings/errors were reported.

After adding useful votes and best answers, all eight backend scenarios and three frontend rendering scenarios pass, together with lint, frontend/backend TypeScript and both production builds. Authenticated native HTTP form checks against the production frontend verify voting, reload, selection, clearing the pinned answer from another reply page, and page-preserving success redirects. Original demo votes/selections are restored and the test session revoked afterward. Desktop/mobile browser checks verify the public count and pinned-answer layout; no browser console warnings/errors were reported.

The three component scenarios in `npm run test:ui` run without application servers. They verify immediate vote/unvote feedback before a deferred request completes, duplicate-submission protection, rebasing on a changed server count without double-counting, session-error rollback/reconnection, and network-error rollback/retry. Enhanced Server Action HTTP checks against the production frontend also verify vote/unvote completion without redirects, invalid input, revoked sessions and the native-form fallback. Temporary demo vote changes are restored afterward.

## Frontend journey and rendering

- `/` renders live, paginated discussions through Server Components. `q`, `category`, `sort`, `page` and compact `view` stay in the URL; searching/filtering/sorting reset to page one. Search and filter/sort/view navigation also work without client JavaScript.
- `/discussions/[documentId]` renders the discussion, public author/date/category and paginated replies. Content is rendered as React text with preserved line breaks, never interpreted as HTML. Missing discussions use the not-found page; service failures show a retry state.
- `/discussions/nouvelle` requires a verified member. Login, publishing and reply forms use custom validation with small red field errors, first-error focus and live correction after submission. Browser constraint popups and native length caps are disabled; Strapi remains responsible for authoritative publishing validation. Only intended fields are forwarded, and Strapi assigns the author.
- Successful creation redirects to the new discussion. Reply publication redirects to the final reply page and the new reply's anchor. Both invalidate affected Next.js routes; API reads remain uncached.
- Controlled forms keep typed text in memory on failed submissions. Expired-session feedback opens login in another tab so the original draft stays open; drafts are not persisted across reloads. Login return destinations are limited to known local forum routes.
- A shared session-aware header, responsive category navigation, loading/empty/error states and reusable discussion/byline/pagination components preserve the supplied mockup's main visual identity. Unsupported prototype controls are omitted.

Frontend structure is organized by responsibility: `components/ui/` contains shared controls, `components/layout/` contains the site shell, and `components/forum/` contains forum presentation. Route-specific forms stay next to their pages. `lib/forum/` groups API reads, public types and URL helpers; server-only transport and sessions remain in `lib/strapi.ts` and `lib/session.ts`. See [frontend/README.md](frontend/README.md) for the directory map and [frontend/AGENTS.md](frontend/AGENTS.md) for implementation conventions.

Ordinary component styles use Tailwind utilities and shared controls. Light/dark tokens live in `frontend/src/styles/theme.css`; global CSS is limited to font loading, Tailwind aliases and base rules. Small colocated CSS Modules handle layered gradients. The shared shadcn/ui Dialog uses Radix and `tw-animate-css` for accessible animated overlays. Login/publishing use Next.js intercepted routes on client navigation and standalone pages on direct visits. Expected service failures have explicit feedback; unexpected code errors reach the route error boundary. Backend structure stays within Strapi's native controllers/services/policies conventions, with no extra repository layer or parallel Next.js business backend.

The current visual reference is `maquette-communaute-le-revenu-v2.html`. Discussion search, useful reply votes and best answers are implemented PDF bonuses. Polls, notifications, profiles/points, blogs, events and editorial tools remain excluded. Metrics and content come from Strapi. Authentication uses community demo accounts rather than lerevenu.com SSO, and discussion content remains mandatory as required by the PDF. The spaces and charter links have real pages; the top external editorial links retain the mockup's lerevenu.com destination.

## Source material

- `Test_technique_Developpeur_Full_Stack_Le_Revenu.pdf`
- `maquette-communaute-le-revenu.html`
- `maquette-communaute-le-revenu-v2.html`
- `IMPLEMENTATION_PLAN.md`
