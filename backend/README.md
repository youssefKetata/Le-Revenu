# Le Revenu backend

Strapi v5 with TypeScript, PostgreSQL and Users & Permissions.

See the [root README](../README.md) for the complete database, environment and startup instructions.

From the repository root:

```powershell
npm run dev:backend
```

The backend uses the existing local PostgreSQL service and a dedicated restricted application role. Category, Discussion and Reply schemas are in `src/api/`. The native Users & Permissions user is extended in `src/extensions/users-permissions/strapi-server.ts` with discussions and replies; its authentication fields are preserved.

The schemas are available in the Strapi Content Manager after startup. All three forum collections have Draft & Publish disabled. Run `npm run setup:env` and `npm run seed:demo` from the repository root to add demo members, categories, discussions and replies. The data and seed logic are in `src/seeds/`. Reruns keep existing records and passwords; the seed is transactional and is not run automatically at startup.

Forum REST routes and permissions are the next part of phase 2; secure publishing is phase 3. See the root README for demo credentials, field constraints, relationships and type generation.
