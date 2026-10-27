# Backend

Strapi v5, TypeScript and PostgreSQL. APIs, policies and demo seeds live in `src/`.

See the [root README](../README.md) for setup, demo accounts and commands.

`package.json` overrides four pinned transitive dependencies with security fixes in the same major version: DOMPurify 3.4.17, markdown-it 14.3.3, undici 8.12.2 and Zod 4.6.6. Remove these overrides when Strapi's dependency pins include the fixes. Zod 3 consumers retain their own major version.

The dependency audit still reports upstream advisories in Strapi's dependency tree. Recheck with `npm audit --omit=dev` in this directory before a shared deployment. The suggested `npm audit fix --force` would downgrade Strapi to v4 and break this application's required v5 APIs; resolving the remaining major-version dependencies needs an upstream-compatible upgrade. Docker Compose exposes the apps only on localhost.
