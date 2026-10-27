<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project conventions

- Use Tailwind utilities for component layout, spacing, typography, responsive states and colors. Shared light/dark design tokens live in `styles/theme.css`, with Tailwind aliases in `app/globals.css`.
- Keep `globals.css` limited to Tailwind setup, fonts, tokens and base element rules. Component selectors belong in colocated CSS Modules only when custom CSS is clearer than utilities, such as a layered background.
- Put shared controls in `components/ui`, the site shell in `components/layout`, and forum presentation in `components/forum`. Keep route-specific forms next to their pages. Do not add barrel exports or compatibility shims.
- Reuse the existing buttons, cards and form fields instead of introducing competing styles. Extract components for a distinct responsibility or actual reuse; avoid splitting every small fragment.
- Forms use `noValidate` and the shared custom-validation hook. Render small red errors through `FormField`/`FieldError`, connect them with `aria-describedby`, and focus the first invalid field. Use `aria-required` for accessibility instead of browser validation constraints. Strapi remains authoritative for publishing rules.
- Use the shared shadcn/ui Select for form dropdowns and Dropdown Menu for action menus. Preserve the shared input styling and form submission and required-field validation, with keyboard support and reduced-motion animations.
- Keep Strapi reads in `lib/forum/api.ts`, public types in `lib/forum/types.ts`, and URL parsing/building in `lib/forum/query.ts`. `lib/strapi.ts` is the server-only HTTP transport.
- Pages orchestrate server reads. Client Components are limited to interaction. Server Actions forward intended fields with the member token; business validation, authorship and persistence stay in Strapi.
- Handle expected service failures explicitly and let unexpected errors reach the error boundary. Preserve uncached reads, bounded pagination, request-scoped identity checks and the agreed ten-minute sessions.
- Keep tests focused on observable behavior. Rendering checks must not depend on CSS class names.
- Login and publishing use intercepted route dialogs on client navigation and standalone pages on direct navigation. Keep both paths working. Use the shared shadcn/ui Radix Dialog with `tw-animate-css`; route dismissal must wait for its exit animation and respect reduced motion. Apply the Tailwind loader only to `globals.css`; CSS Modules use Next.js's native processing.
