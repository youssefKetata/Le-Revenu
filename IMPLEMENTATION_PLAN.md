# Le Revenu technical test: scope and implementation plan

Status: phases 1–4 implemented, with the v2 design and approved discussion-search bonus. Six focused backend scenarios cover seeding, reads, search, bounded excerpts, sessions, publishing, validation and author protection. Three frontend HTTP rendering scenarios cover feeds, search and details. A local HTTP form journey passed login → create → reply → reload → logout with temporary records cleaned up. Desktop/mobile browser verification is accessible for the app; the local-file mockup remains unavailable to the browser tool. Strapi uses the dedicated database on the existing PostgreSQL Windows service (port 5432).

## 1. Source of truth

- `Test_technique_Developpeur_Full_Stack_Le_Revenu.pdf`: mandatory requirements and deliverables.
- `maquette-communaute-le-revenu-v2.html`: current design and interaction reference, approved within the assignment's existing feature scope. The original HTML remains preserved.
- The PDF explicitly permits a focused implementation rather than a complete reproduction.
- When the prototype and brief disagree, follow the PDF. In particular, discussion content is required even though the prototype labels it optional.
- AI assistance is allowed. The candidate must understand and justify the implementation in a 30-minute technical review.

## 2. What we are building

A French-language community forum where visitors can read and filter discussions, and authenticated demo members can create discussions and post replies. Content is managed and persisted through Strapi v5 with PostgreSQL.

### Required feature checklist

| Area | Required behavior | Acceptance check |
| --- | --- | --- |
| Community home | Load discussions from Strapi; show title, author, category, reply count, publication date | Editing a record in Strapi changes what the frontend displays |
| Filtering and sorting | Filter by category and sort by publication date on the backend | URL filter/sort changes produce the correct API results, including across pages |
| Discussion detail | Unique, reloadable URL; show content, author, date, category, replies | Direct navigation and browser reload both work; missing discussion returns a useful 404 |
| Create discussion | Title of at least 10 characters after trimming; nonblank content; valid category; type limited to question or discussion | Valid submission persists and redirects; invalid submission shows useful errors |
| Reply | Authenticated member can submit nonblank content to an existing discussion | Reply survives reload and server restart; counts refresh |
| Authentication | Simple login/logout using Strapi Users & Permissions and seeded demo users | Visitors can read; only authenticated members can publish |
| Author protection | Strapi obtains the author from the authenticated user | Supplying another user's author identifier cannot impersonate them |
| Backend architecture | Content types, relations, permissions, appropriate controllers/services/policies, consistent HTTP errors | Calling Strapi directly cannot bypass validation or permissions |
| API efficiency | Bounded pagination and sorting; explicit fields and populated relations | Feed does not download all replies or expose private user fields |
| Frontend architecture | Reusable components, centralized typed API client, deliberate server/client boundaries | Pages handle loading, empty results, errors, expired sessions and unavailable API |
| Responsive design | Preserve the prototype's overall visual identity | Home, detail, login and publishing work on mobile and desktop |
| Automated tests | Meaningful validation, unauthorized publication, impersonation and discussion rendering tests | Documented test commands pass |

Backend pagination is an explicit architecture requirement. Visible pagination controls are also listed as a bonus; implement bounded backend responses from the start and add simple controls after the core flow works.

### Out of the first delivery

- Polls and voting, useful votes, best-answer selection.
- Points, badges, streaks, leaderboards and member blogs.
- Notifications, email digests, following and live events.
- Mentions, avatar uploads, full profiles and personalized feeds.
- Existing lerevenu.com account integration, registration, password reset and email verification.
- Custom moderation workflows, selective indexing and external-link reputation rules.
- Docker Compose and deployment.

Keep the application coherent: omit unsupported actions instead of leaving simulated success messages or nonfunctional controls. The prototype's visitor/member switch, editorial view and design annotations are prototype tools, not product requirements.

## 3. Stack and local execution

| Concern | Choice | Reason |
| --- | --- | --- |
| Frontend | Next.js App Router, React, TypeScript | Required by the brief |
| Styling | Tailwind CSS plus a small set of CSS design tokens | Required Tailwind; preserve supplied colors, typography and spacing |
| Backend | Strapi v5 with TypeScript | Required; owns business rules and persistence |
| API | Strapi REST API | Required; no need for GraphQL |
| Database | Local PostgreSQL | Required; native Windows service avoids adding Docker Desktop |
| Identity | Strapi Users & Permissions | Native user model and two demo accounts |
| Runtime/package manager | Node.js 24 LTS and npm | Already available; commit lockfiles and record tested versions |
| Tests | Small API integration suite plus frontend rendering tests | Covers the brief without requiring a large end-to-end suite |

Version policy: choose stable compatible releases at scaffolding, keep Strapi on major v5, and record the exact tested versions. No experimental releases.

This is a new project: use the current stack and data model directly. Do not add backward-compatibility layers, legacy identifier fallbacks or upgrades for older configuration formats. Input validation and repeatable, non-destructive seeding remain required.

Observed on this machine during requirements review:

- Node.js `v24.21.0` and npm `11.19.0` are available.
- Windows service `postgresql-x64-18` is running; local psql reports PostgreSQL `18.1`.
- Phase 1 verified the dedicated `le_revenu` database, restricted application role and Strapi connectivity on this PostgreSQL service.

Plan to reuse the existing PostgreSQL service with a dedicated project database and a project-specific role. Do not modify unrelated databases. Verify compatibility with the selected Strapi release during the setup smoke test.

No Docker for the core delivery: Compose is optional in the brief and adds an unnecessary service layer on this 8 GB Windows machine. Run Next.js, Strapi and PostgreSQL natively. RAM usage must be observed during setup; do not promise that all development/build workloads fit simultaneously.

Practical resource choices:

- Keep the database connection pool small for local development.
- Run production builds and browser test workers sequentially.
- Use a single test worker initially; close unused browser tabs and admin sessions.
- If necessary after schema work, build Strapi's admin once and use its normal start mode for frontend development. Return to develop mode when changing content types.
- Avoid adding Redis, queues, microservices or an additional database access layer.

## 4. Data model

| Entity | Fields and relationships |
| --- | --- |
| User | Native Users & Permissions user; username used for public display; one user has many discussions and replies |
| Category | Required name; unique slug; description; one category has many discussions; optional icon key and color for the reference design |
| Discussion | Required title, content, type enum; required author and category; many replies; native timestamps and document identifier |
| Reply | Required content, author and discussion; native timestamps and document identifier |

Use an identifier-based discussion route initially, for example `/discussions/[documentId]`. A readable slug is optional; stable unique URLs are mandatory. Category slugs belong in URL query parameters.

For immediately visible forum contributions, plan to disable Draft & Publish on discussions and replies and consistently use `createdAt` as the displayed publication date. Document this choice; do not accidentally mix draft and published document variants.

Do not persist redundant reply counts initially. Compute them on the backend with a bounded, efficient query strategy, avoiding one database query per feed card. Fetch replies separately for the detail view, with bounded pagination.

## 5. Responsibility boundaries

Request flow: browser -> Next.js presentation/session transport -> Strapi REST -> PostgreSQL.

- Next.js never queries PostgreSQL directly.
- Server Components fetch and render the feed and detail data using a centralized typed Strapi client.
- Client Components handle interactive forms and controls where needed.
- Filters, sort order and page state use URL query parameters so they survive reload and sharing.
- A thin Next.js Server Action or Route Handler may forward a user's authenticated request. All domain validation, author assignment and authorization remain enforced independently in Strapi.
- Simple demo login delegates credential checking to Strapi. Store its token in an HttpOnly session cookie, with secure production settings and appropriate expiry. Do not expose a shared privileged API token to the browser.
- Phase 3 deliberately uses fixed ten-minute access tokens and sessions. Next.js stores only the access token in its own HttpOnly cookie; it discards the native server-side refresh token and requires login again after expiry. No refresh-cookie forwarding or token rotation is implemented. Native session revocation is checked by a Strapi policy on publishing and current-user requests.
- Strapi assigns `author` from `ctx.state.user`; reject a client-supplied author field. Apply this to both discussions and replies.
- Allow only intended input fields. Validate related category/discussion identifiers and return coherent 400/401/403/404 errors as appropriate.
- Grant Public read access only to intended content. Grant authenticated members intended create access. Leave unnecessary update/delete and category-management actions disabled.
- Return only public author information; never expose emails, password hashes or tokens through populated relations.
- Start with uncached discussion reads and refresh affected views after writes. Explain freshness explicitly in the README; optimize caching only if justified later.
- Render submitted content safely as text with paragraph/line-break support; rich HTML editing is unnecessary for the core scope.

Strapi admin remains the content-management interface. Building a second admin dashboard would duplicate functionality and is outside scope.

## 6. Design scope

Preserve the supplied red branding, Playfair Display headings, neutral surfaces, rounded cards, category markers and discussion/reply layout. Carry the desktop column structure into a compact mobile layout with accessible navigation.

Implement the community header, category navigation, feed cards, discussion body/replies and publishing form. A small relevant sidebar may use real discussion/category data. Remove unsupported gamification, polls and other widgets from the first version rather than displaying invented metrics.

Keep the interface in French. Simplify the publishing form to the two required types and change the content label to required. Add keyboard focus, associated form labels, pending submission states and useful error messages.

## 7. Build phases and completion gates

### Phase 1: Foundation and database smoke test

- Create a single Git repository with `frontend/` and `backend/`; keep the original source files.
- Scaffold the required stack and commit lockfiles.
- Configure a dedicated local PostgreSQL database and role through environment variables.
- Verify Strapi starts, connects to PostgreSQL, and Next.js starts.
- Add `.env.example` files without real secrets and begin the README.

Completion gate: both applications start independently and Strapi uses PostgreSQL.

### Phase 2: Data model, demo data and read API

- Define the native user relations and Category, Discussion and Reply content types. Implemented; runtime verification is recorded in the README.
- Create a repeatable, non-destructive demo seed with two member accounts, reference categories, discussions and replies, including a discussion without replies. Implemented as `npm run seed:demo` and verified with `npm run test:api` against an isolated PostgreSQL schema; credential setup and rerun behavior are documented in the README.
- Configure public read permissions; implement bounded pagination, category filtering, date sorting and safe author projections. Implemented and verified by `npm run test:api`.
- Make demo permissions reproducible rather than relying on undocumented admin clicks. Implemented in `backend/src/permissions/forum.ts`, called by startup bootstrap.

Completion gate passed: direct HTTP requests return the correct seeded content, relations, counts and pagination. See the README for the endpoint contract and integration-test commands.

### Phase 3: Secure publishing, with API tests

- Add minimal demo login/logout. Implemented with native Strapi auth, Next.js Server Actions and an HttpOnly cookie; native login verified in the browser.
- Implement authenticated discussion/reply creation in Strapi. Implemented as two POST endpoints with permission and active-session checks.
- Enforce title/content/type/relation validation and reject author spoofing or unwanted fields. Implemented in Strapi's publishing input parser and services.
- Add API integration tests using an isolated PostgreSQL test schema. Implemented in `scripts/forum-api.test.mjs`; tests call the actual Strapi HTTP surface, including native login/logout.

API completion gate passed: valid writes persist; invalid, unauthenticated and impersonation attempts fail independently of Next.js. Phase 3 is committed and pushed as `1bc273c`. The PDF permits demo authentication, so fixed ten-minute sessions remain intentional and token rotation is out of scope.

### Phase 4: Complete the core Next.js journey

- Implement typed API access, home feed, category filter, date sorting and discussion detail route. Implemented with Server Components and URL-backed filters/sort/pages.
- Build the new-discussion form and reply form with pending/error/success states. Implemented with controlled Client Components and thin authenticated Server Actions; Strapi retains all business rules.
- Redirect to the created discussion; refresh replies and counts after publishing. Implemented with route invalidation and a redirect to the final reply page/new reply anchor.
- Add loading, empty, not-found and API-error states, plus frontend rendering tests. Implemented; two read-only HTTP rendering scenarios pass. Locally bundled typography and responsive layouts follow the reference design.
- Structure review: forum components and API helpers are grouped by responsibility; shared controls own button/form styling; global CSS contains only fonts, Tailwind aliases and base rules, with palette tokens in `styles/theme.css`. Tailwind handles ordinary component styles, with small CSS Modules for gradients and a shared shadcn/ui Dialog using Radix and `tw-animate-css`. Normal detail/reply reads run in parallel, and unexpected exceptions reach the error boundary. The native Strapi backend organization is retained.

HTTP journey gate passed against real PostgreSQL data, including native validation and safe text rendering. Desktop/mobile browser checks cover the live layout, native login, route dialogs and navigation. The v2 source is compared through HTML/CSS values because the browser tool rejects local-file URLs; direct screenshot comparison remains unavailable.

### Phase 5: Responsive fidelity and delivery verification

- Refine the supplied design across desktop and mobile, including keyboard behavior. V2 layout, theme, cards, compact feed, mobile navigation, spaces/charter pages and shadcn/ui route dialogs are implemented within the existing feature scope. Feed excerpts use one bounded batched Strapi projection; no schema or compatibility layer is added.
- Review permissions, safe response fields and invalid session behavior.
- Run automated tests, type checks, lint checks and production builds sequentially.
- Verify startup and seeding against a fresh dedicated database using only README instructions.
- Finish architecture notes, demo-account setup, API/test commands and known limitations.

Completion gate: a reviewer can reproduce the project locally from the repository and follow the main user journey.

### Phase 6: Optional extras and review preparation

- Visible discussion/reply pagination controls are implemented.
- Discussion search is implemented as an approved bonus: bounded `q` input, native Strapi title/content filtering, URL state and existing category/sort/pagination. No external search service or compatibility layer.
- Add a small Playwright journey if useful and affordable on the machine.
- Add votes/best answer only if there is enough time to implement and test their authorization rules.
- Prepare a concise walkthrough explaining the model, Strapi boundaries, permissions, data fetching, freshness and tradeoffs.

Docker remains optional and is deliberately excluded from this plan.

## 8. Submission checklist

- Git repository containing frontend and Strapi v5 backend.
- PostgreSQL configuration and versioned content-type schemas.
- Repeatable demo initialization, including clear demo credential setup.
- `.env.example` files, with all real secrets excluded from Git.
- README covering installation without Docker, startup, data seeding, tests and architecture decisions.
- Automated tests for the four areas explicitly requested by the brief.
- Local PostgreSQL reproduction instructions; provide a sanitized database dump only if needed, as seed plus schemas should be the primary reproducible setup.
- Updated CV and source-code delivery prepared when implementation is complete. Sending an application is a separate action.

## 9. Technical references checked during planning

- Strapi installation prerequisites: https://docs.strapi.io/cms/installation/cli
- Next.js App Router installation: https://nextjs.org/docs/app/getting-started/installation

Node 24 is listed by Strapi's installation documentation checked during planning and exceeds Next.js's documented Node 20.9 minimum. Strapi lists PostgreSQL 14 minimum and recommends 17; the existing PostgreSQL 18 installation passed the project-specific connection and runtime smoke test in phase 1.
