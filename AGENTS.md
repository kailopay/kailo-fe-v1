<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# kailopay-fe conventions

## Folder structure

```
app/                  # Routing ONLY — layouts, pages, route handlers; pages stay thin
  (auth)/             # Route group: public auth screens (own bare layout)
    login/            # /login: email + password sign-in
    register/         # /register: create an account, then verify prompt
    forgot-password/  # /forgot-password: request a reset link
    auth/
      verify-email/   # /auth/verify-email: consumes the console-link token
      reset-password/ # /auth/reset-password: consumes the reset-link token
  (session)/          # Route group: session app shell (nav + sandbox badges)
    dashboard/        # /dashboard: post-login landing, user summary + links
    profile/          # /profile: display name, password, Developer Mode, avatar
    developer/        # /developer: API keys; playground/ + orders/[id]/; _components/ colocated
  session-expired/    # Public 401 explainer
components/           # Shared UI across routes/features (ui/ = primitives)
features/             # Feature modules (auth, developer, orders): components + hooks + utils + types colocated
hooks/                # React hooks shared across features
lib/                  # Non-UI shared logic; api/ = typed client, dual error envelopes, wire types
public/               # Static assets
```

## Rules

- `app/` is for routing only. Pages compose components and fetch data; implementation lives in `features/` (domain-specific) or `components/` + `lib/` (shared).
- Organize by feature, not by file type: a component used by one feature lives in `features/<domain>/`, not in a global type-folder.
- Route-specific components colocate under the route in a private `_components/` folder (underscore = opted out of routing).
- Route groups `(name)` never appear in the URL — use them to give sections different layouts (e.g. `(session)` app shell vs bare public pages).
- New sections follow the same pattern: add a route group with its own `layout.tsx`.
- Import with the `@/` alias (e.g. `@/components/ui/button`, `@/lib/api/client`), never long relative paths.
- Prefer Server Components by default; add `"use client"` only where interactivity requires it.
- Next.js 16 (installed here): `params`/`searchParams` are Promises — await them. Type layouts/pages with the globally available `LayoutProps<'/route'>` / `PageProps<'/route'>` helpers.

## Backend integration

Contract authority: `kailopay-be/openapi/openapi.yaml` (sibling repo). Frontend guide: `documentations/FRONTEND-GUIDE.md`. Wire types live in `lib/api/types.ts`.

- `/auth` is split: the enumerated backend API paths (`/auth/register`, `/auth/login`, `/auth/logout`, `/auth/email/*`, `/auth/password/*`, `/auth/google/*`, `/auth/me`, `/auth/me/avatar`), plus `/v1`, `/livez`, `/readyz`, `/startupz`, are proxied to the backend via `rewrites` in `next.config.ts` (origin: `API_ORIGIN`, default `http://localhost:8081`). The backend sends no CORS headers by design. The frontend owns pages at `/auth/verify-email` and `/auth/reset-password`; never add other pages under `/auth` without updating the rewrite list.
- Auth is self-hosted email + password with opaque server sessions (backend ADR-002; Auth0 was removed). The frontend owns the forms: `/login`, `/register`, and the token pages above. Login (`POST /auth/login`) sets an HttpOnly cookie; nothing auth-related is stored in app state; hydrate from `GET /auth/me`. Treat 401 as "redirect to sign-in" (`/login`, or `/session-expired` mid-session).
- Google sign-in is a full-window navigation to `/auth/google/login` (plain `<a>`, never `next/link`). It 503s while unconfigured: probe it before rendering the button, and show a reserved non-button slot otherwise.
- Verification and reset links are logged to the backend console in sandbox, never emailed. UI copy says "delivered via the sandbox console", never "check your email". Login 403 "email is not verified" routes to the verify prompt, never to a password error. 401 "invalid email or password" also covers lockout: never hint which part failed.
- Money and XLM amounts are decimal strings end to end. Never convert to JS numbers for arithmetic.
- JSON bodies must contain only documented fields: the backend rejects unknown keys with 400.
- The backend has two error envelope styles; `ApiError` (lib/api) normalizes both. Surface `code`, keep `request_id` for support copy.
- `pk_test_` API keys live in memory only (never bundled, stored, or logged) and are wiped on logout.
- `POST /v1/onramps` requires an `Idempotency-Key` per user intent; reuse the same key on retry of that intent.
- Every value-movement screen shows the Sandbox + Stellar Testnet badges (`components/sandbox-badges.tsx`, product rule FR-053).

## UI style preferences

- Never use em-dashes (—) in UI copy. Use a period, colon, or comma instead.
- Never render uppercase text in monospace fonts. No `uppercase` styling on `font-mono`/`<code>` elements, and no ALL-CAPS strings displayed in mono. Mono text stays as-written (typically lowercase identifiers like `features/auth`).

## Code style

- Top-level functions use `function` declarations. Arrow functions only for inline callbacks (e.g. `.map((tx) => ...)`) and short lambdas.
- Components: PascalCase named-function declarations. Utilities and helpers: camelCase. Hooks: camelCase with a `use` prefix.
- `export default` only in files where Next.js requires it: `page`, `layout`, `loading`, `error`, `global-error`, `not-found`, `template`, `route`. All other exports are named exports.
- Exported functions have explicit return types; internal functions rely on inference.
- Server Actions (`"use server"`) are always `async`.

## TypeScript

- No `any`. External data (API responses, `JSON.parse`, `localStorage`, environment variables) is `unknown` until narrowed.
- No `as` casts on unvalidated data. Cast only after full validation at a parse boundary (an earned cast). Use `satisfies` instead of `as` to check a value against a type without widening it.
- Validate at boundaries: parse once where data enters (API client, `lib/`), into a named domain type. Trust types inside the boundary; no re-validation deep in call chains.
- Model variants as discriminated unions with a literal `kind` field. No boolean + optional-field bags that allow contradictory states (not `{ loading: boolean; data?: T; error?: string }`).
- Make exhaustive switches compile-checked: default arms end with `const _exhaustive: never = value;`.
- Make illegal states unconstructable: `[T, ...T[]]` for non-empty lists, `{ start, durationMs }` instead of `{ start, end }`. Strengthen types only when the loose type forces a `!`, a cast, or a "should never happen" throw; keep `T[]` while every operation stays total.
- Brand primitives that must not be mixed up (`type AccountId = string & { readonly __brand: "AccountId" }`), validated once at creation. Don't brand by reflex.
- Narrowing preference order: discriminant switch > `in` operator > `typeof`/`instanceof` > type guard > `as`. Type guards must actually verify their claim and are named `isX`/`hasX`.
- Derive types from existing shapes (`Pick`, `Omit`, `Parameters`, `ReturnType`, `Awaited`, `typeof`) before declaring new interfaces; never hand-duplicate API/schema types.
- Prefer a single object argument over positional args for 3+ parameters; skip on hot paths.
- No `console.log` in shipped code. Use structured logging with enough context to debug from an id.
- Don't mock what you can run: prefer real test primitives and a running build; mock only external services you can't run locally.



