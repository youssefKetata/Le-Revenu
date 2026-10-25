# Le Revenu frontend

Next.js App Router, React, TypeScript and Tailwind CSS.

See the [root README](../README.md) for the complete installation, environment and startup instructions.

From the repository root:

```powershell
npm run dev:frontend
```

The application uses the server-side `STRAPI_URL` environment variable to reach Strapi. It has no database connection or PostgreSQL dependency.

`/` renders the live community feed, category filters, date sorting and pagination. `/discussions/[documentId]` renders a discussion and its paginated replies. `/discussions/nouvelle` provides the authenticated publishing form. Data fetching and session checks stay in Server Components; the forms use Client Components with Server Actions and pending/error feedback.

`/connexion` provides demo-member login through a Server Action and native Strapi authentication. `src/lib/session.ts` stores the ten-minute access token in an HttpOnly cookie and verifies the member through Strapi's current-user endpoint. The shared header displays login/logout controls. Login returns to an allowlisted local forum destination.

The cookie uses `SameSite=Lax`, a host-only scope and `Secure` in production. Logout calls native Strapi logout and always clears the local cookie. Expired sessions require login again; refresh tokens are never forwarded to the browser or stored by Next.js. `src/lib/strapi.ts` centralizes server-side API transport with no caching and an eight-second timeout.

`src/lib/forum/api.ts` provides typed reads; `src/lib/forum/query.ts` handles URL state and pagination bounds; `src/lib/forum/types.ts` defines the public response shapes. `src/app/actions/publish.ts` forwards only intended fields with the member's token. Strapi owns business validation, author assignment and persistence. Successful publications redirect and invalidate affected routes. Plain-text rendering escapes HTML and preserves line breaks.

## Structure and styling

```text
src/app/                 Routes, Server Actions and route-specific interactive forms
src/components/layout/  Shared header and page container
src/components/ui/      Shared buttons, cards, fields and notices
src/components/forum/   Forum navigation, discussion cards, bylines and reply lists
src/lib/forum/          Typed API reads, public types and URL helpers
src/lib/session.ts      Server-only member cookie and identity checks
src/lib/strapi.ts       Server-only HTTP transport
```

Use Tailwind utilities for ordinary component styling. `app/globals.css` contains only font loading, shared theme tokens and base element rules. The hero's layered background is a small colocated CSS Module; its layout and responsive styling remain in the component. Buttons and form controls use shared components/styles so screens do not drift apart. These conventions also live in `AGENTS.md` for future changes.

Pages compose components and fetch data; the forum components do not fetch or mutate data. Normal discussion requests load the discussion and replies in parallel. Opening the final reply page first obtains the reply count, then fetches the appropriate bounded page. Expected Strapi errors get service feedback; unexpected exceptions reach the route error boundary.

The forms keep text in memory after errors, with a separate login tab offered on expired sessions; reloads do not preserve drafts. Playfair Display is bundled locally with its Open Font License, so builds have no font-network dependency.

Run `npm run test:frontend` from the root with seeded Strapi and Next.js servers running. Two read-only scenarios cover feed/detail rendering, URL filters/order, metadata, empty/invalid/missing states and anonymous publishing navigation. The local HTTP form journey also passed login, validation, create, reply, reload and logout; its temporary records were removed. Browser visual/hydration checks remain pending. See the root README for all verification commands.
