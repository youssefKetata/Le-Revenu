# Le Revenu frontend

Next.js App Router, React, TypeScript and Tailwind CSS.

See the [root README](../README.md) for the complete installation, environment and startup instructions.

From the repository root:

```powershell
npm run dev:frontend
```

The application uses the server-side `STRAPI_URL` environment variable to reach Strapi. It has no database connection or PostgreSQL dependency.

`/connexion` provides demo-member login through a Server Action and native Strapi authentication. `src/lib/session.ts` stores the ten-minute access token in an HttpOnly cookie and verifies the member through Strapi's current-user endpoint. The home page displays login/logout controls; it remains a placeholder for the phase 4 forum UI.

The cookie uses `SameSite=Lax`, a host-only scope and `Secure` in production. Logout calls native Strapi logout and always clears the local cookie. Expired sessions require login again; refresh tokens are never forwarded to the browser or stored by Next.js. `src/lib/strapi.ts` centralizes server-side API transport with no caching and an eight-second timeout.

Frontend type checking, lint and the production build pass; browser login/logout verification is pending because the local browser origin was not approved. See the root README for the implemented API tests and current verification status.
