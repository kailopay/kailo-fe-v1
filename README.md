# kailopay-fe

The web app for [KailoPay](https://github.com/), an Indonesia-first sandbox
on-ramp that converts IDR into Stellar testnet XLM. Sandbox only: no real
money moves, and every value screen says so.

## Stack

Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4. Chosen for
the 30-day sandbox window: the App Router gives Server Components for
session-hydrated pages, and `rewrites` provide the same-origin API proxy the
backend requires (it sends no CORS headers by design).

## Running

```bash
npm install
npm run dev
```

The dev server runs on http://localhost:3001, the origin the backend's
`AUTH_EMAIL_LINK_BASE_URL` and `AUTH_SUCCESS_REDIRECT_URL` point at.

Requirements:

- The KailoPay backend (sibling repo `kailopay-be`) running on
  `http://localhost:8081`, or set `API_ORIGIN` to its address.
- Verification and password-reset links are logged to the backend console in
  sandbox, not emailed: copy the token from the backend terminal into the
  `/auth/verify-email` or `/auth/reset-password` page.

## Auth model

Self-hosted email + password with opaque server sessions (backend ADR-002;
Auth0 was removed). The frontend owns the forms:

- `/register` creates an unverified account, then shows the verify prompt
  with a resend action.
- `/auth/verify-email?token=...` consumes the single-use token.
- `/login` signs in with email + password; 403 routes to the verify prompt,
  401 never reveals whether the email or the password was wrong.
- `/auth/reset-password?token=...` sets a new password (revokes all
  sessions); the profile page offers an in-session change that signs out
  every device.
- Google sign-in is a redirect flow that appears only when the backend has
  credentials configured; otherwise its slot on the auth card stays reserved.

## Layout

See `AGENTS.md` for the full conventions. In short: `app/` is routing only,
feature modules live in `features/`, shared non-UI logic in `lib/` (the typed
API client lives in `lib/api/`). Contract authority is
`../kailopay-be/openapi/openapi.yaml`; the frontend-facing guide is
`documentations/FRONTEND-GUIDE.md`.
