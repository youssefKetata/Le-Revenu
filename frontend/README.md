# Le Revenu frontend

Next.js App Router, React, TypeScript and Tailwind CSS.

See the [root README](../README.md) for the complete installation, environment and startup instructions.

From the repository root:

```powershell
npm run dev:frontend
```

The application uses the server-side `STRAPI_URL` environment variable to reach Strapi. It has no database connection or PostgreSQL dependency.

`/` renders the live community feed, discussion search, category filters, date sorting, detailed/compact views and pagination. Search uses an explicit Next.js GET Form with `q` in the URL, custom inline length validation and a clear-search link. It preserves category/sort/view and starts at page one. Strapi matches title/content and computes the filtered total; the browser never filters a downloaded feed. `/espaces` lists real categories; `/charte` presents community guidelines. `/discussions/[documentId]` renders a discussion and its paginated replies. `/discussions/nouvelle` provides the authenticated publishing form. Data fetching and session checks stay in Server Components; publishing forms use Client Components with Server Actions and pending/error feedback.

`/connexion` provides demo-member login through a Server Action and native Strapi authentication. `src/lib/session.ts` stores the ten-minute access token in an HttpOnly cookie and verifies the member through Strapi's current-user endpoint. The shared header displays login/logout controls. Login returns to an allowlisted local forum destination.

The cookie uses `SameSite=Lax`, a host-only scope and `Secure` in production. Logout calls native Strapi logout and always clears the local cookie. Expired sessions require login again; refresh tokens are never forwarded to the browser or stored by Next.js. `src/lib/strapi.ts` centralizes server-side API transport with no caching and an eight-second timeout.

`src/lib/forum/api.ts` provides typed reads; `src/lib/forum/query.ts` handles URL state and pagination bounds; `src/lib/forum/types.ts` defines the public response shapes. `src/app/actions/publish.ts` forwards only intended fields with the member's token. Strapi owns business validation, author assignment and persistence. Successful publications redirect and invalidate affected routes. Plain-text rendering escapes HTML and preserves line breaks.

## Structure and styling

```text
src/app/                 Routes, Server Actions and route-specific interactive forms
src/components/layout/  Header, account/mobile navigation, page container and route dialogs
src/components/ui/      Shared buttons, cards, fields and notices
src/components/forum/   Forum navigation, discussion cards, bylines and reply lists
src/lib/forum/          Typed API reads, public types and URL helpers
src/lib/session.ts      Server-only member cookie and identity checks
src/lib/strapi.ts       Server-only HTTP transport
src/styles/theme.css   Shared light/dark design tokens
```

Use Tailwind utilities for ordinary component styling. `styles/theme.css` holds the v2 light/dark palette; `app/globals.css` contains font loading, Tailwind aliases, the `tw-animate-css` import and base element rules. Small colocated CSS Modules handle the hero/button gradients. The Tailwind loader applies only to `globals.css`, preserving native CSS Module exports. Buttons and form controls use shared components/styles so screens do not drift apart. These conventions also live in `AGENTS.md` for future changes.

The current visual reference is `maquette-communaute-le-revenu-v2.html`, within the assignment's feature scope. Colors follow the system light/dark preference. Login and publishing use the shared shadcn/ui Radix Dialog through Next.js intercepting/parallel routes on client navigation; direct URLs and reloads render standalone pages. The backdrop fades over 150ms and the panel fades, rises 12px and scales from 95% over 200ms. Escape, close and backdrop dismissal finish the exit animation before returning through browser history. Reduced-motion preferences disable the animations. Radix manages focus containment, outside interaction and scroll locking; a successful form redirect does not navigate backward. New-publication links can preselect the required type/category; the login return destination remains allowlisted. Component attribution is recorded in `THIRD_PARTY_NOTICES.md`.

All product dropdowns use shared shadcn/ui components: Dropdown Menu for account actions and Select for the publishing category. The Select trigger reuses the existing input dimensions, theme and focus ring; its popup provides keyboard navigation, typeahead, a selected-item indicator and viewport-aware positioning. The category remains required and submits through the existing Server Action. Account logout remains a form action with pending feedback.

Pages compose components and fetch data; interactive forum controls invoke thin Server Actions, with business rules enforced in Strapi. Normal discussion requests load the discussion and replies in parallel. Opening the final reply page first obtains the reply count, then fetches the appropriate bounded page. Expected Strapi errors get service feedback; unexpected exceptions reach the route error boundary.

Reply actions support removable “Utile” votes and best-answer selection for question authors. Vote counts and resolved badges are public; current-member vote state is fetched with the verified session token. `UsefulVote` uses React `useOptimistic` inside a transition to update the count and selected state immediately. The Server Action refreshes route data without redirecting; the optimistic reducer rebases on the confirmed count without adding the same vote twice. Duplicate submissions are blocked per reply while saving, and errors roll back and offer reconnection when needed. The native form action remains a fallback without JavaScript. Best-answer changes retain their page-preserving redirects. The selected answer is shown above the paginated list, with an author-only clear control. Self-votes and self-acceptance are hidden in the UI and independently rejected by Strapi.

Run `npm run test:ui` from the repository root without servers for three DOM interaction scenarios covering optimistic vote/unvote, confirmation/rebasing, duplicate submissions, rollback, reconnection and retry. The Node runner uses esbuild to compile the JSX and jsdom to exercise React against a DOM; temporary compiled files are removed after each run.

On its reply page, the best answer is moved to the top and rendered once as the green reply card, retaining its vote and selection controls. Other pages show its pinned summary only when the full reply is absent. Reply counts and pagination remain unchanged. Useful-vote controls keep green text on hover, with a soft green fill distinguishing an active vote.

Login, publishing and reply forms use custom validation with `noValidate`, without browser constraint popups or native length caps. Shared validators check trimmed text limits and the login password's UTF-8 byte limit. The shared hook validates on submit, focuses the first invalid control and revalidates edited fields after submission. `FormField` renders client and field-specific server errors as small red text beneath each control with accessible descriptions; authentication/service failures retain form-level feedback. Submission reads the real form values, including browser autofill. Strapi still enforces publishing rules independently.

The forms keep text in memory after errors, with a separate login tab offered on expired sessions; reloads or closing the form do not preserve drafts. Ctrl/Cmd+Enter uses the same custom validation as the submit button. Playfair Display and Inter are bundled locally with their Open Font Licenses, so builds have no font-network dependency.

Run `npm run test:frontend` from the root with seeded Strapi and Next.js servers running. Three read-only scenarios cover feed/search/detail rendering and excerpts, URL search/filters/order/views, category/charter pages, metadata, empty/invalid/missing states and anonymous publishing navigation. The local HTTP form journey also passed login, validation, create, reply, reload and logout; its temporary records were removed. Desktop/mobile browser checks cover the rendered design, native login, publishing dialog and navigation. See the root README for verification details and limits.
