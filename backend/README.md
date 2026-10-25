# Le Revenu backend

Strapi v5 with TypeScript, PostgreSQL and Users & Permissions.

See the [root README](../README.md) for the complete database, environment and startup instructions.

From the repository root:

```powershell
npm run dev:backend
```

The backend uses the existing local PostgreSQL service and a dedicated restricted application role. Category, Discussion and Reply schemas are in `src/api/`. The native Users & Permissions user is extended in `src/extensions/users-permissions/strapi-server.ts` with discussions and replies; its authentication fields are preserved.

The schemas are available in the Strapi Content Manager after startup. All three forum collections have Draft & Publish disabled. Run `npm run setup:env` and `npm run seed:demo` from the repository root to add demo members, categories, discussions and replies. The data and seed logic are in `src/seeds/`. Reruns keep existing records and passwords; the seed is transactional and is not run automatically at startup.

The public read API provides categories, discussion summaries/detail and paginated discussion replies. Controllers validate the small query contract; services select safe fields and compute reply counts with native batched relation counts. `src/permissions/forum.ts` configures Public read and Authenticated read/create permissions at every startup.

Authenticated POST requests can create discussions and replies. `src/utils/publish-input.ts` validates a strict field allowlist, trimmed text, types and relation identifiers. Services verify relation existence and assign the authenticated author. `src/policies/member-session.ts` checks native session revocation on writes and current-user/logout routes. Native Users & Permissions login/logout is retained; sessions last ten minutes with no frontend refresh-token handling.

Run `npm run test:api` from the repository root for HTTP integration tests in an isolated PostgreSQL schema. See the root README for the endpoint contract, demo credentials, field constraints, relationships and type generation.
