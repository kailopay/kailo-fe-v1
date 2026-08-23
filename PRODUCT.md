# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary, today: developers integrating with or evaluating the KailoPay API
during the sandbox sprint. They sign in, opt into Developer Mode, manage
`pk_test_` API keys, and run the on-ramp flow in a playground (paste-your-own
key, create an order, watch it settle on Stellar testnet).

Later, unconfirmed: retail buyers once a retail-session order flow exists in
the backend (tracked in kailopay-be BACKLOG; does not exist yet).

## Product Purpose

KailoPay is an Indonesia-first fiat on-ramp/off-ramp for Stellar. Release
v0.1.0 (30-day sandbox sprint) proves one corridor end to end, in sandbox
form only: create an IDR to XLM order, pay via Xendit sandbox (QRIS or BRI
virtual account), receive testnet XLM at a Stellar testnet address. No real
money ever moves. Success for this frontend: a developer can complete that
corridor and see honest, legible status at every step.

## Positioning

The Indonesia-first IDR/XLM corridor with visible, locked quotes (rate,
adjusted rate, spread in basis points shown on every order) and radical
sandbox honesty: every value screen says Sandbox and Stellar Testnet, and the
UI never implies real settlement, KYC, or production readiness.

## Operating Context

- Auth is self-hosted email + password (backend ADR-002; Auth0 was removed),
  with optional Google sign-in while credentials are configured; the browser
  holds only an opaque `kailopay_session` cookie (HttpOnly, SameSite=Lax).
  Verification and reset links are logged to the backend console in sandbox.
- API keys follow `pk_test_<public_id>_<secret>` and are shown in full
  exactly once at creation.
- Orders are created with an `Idempotency-Key` and settle asynchronously:
  `created`, `payment_pending`, `stellar_processing`, `completed`, with
  terminal `expired` / `payment_failed` / `stellar_failed`. Webhooks do not
  exist; polling every 3-5 seconds is the intended integration.
- Payment methods: QRIS (render a QR string) and BRI VA (display a virtual
  account number with copy-to-clipboard).
- The backend sends no CORS headers by design; the frontend must be served
  same-origin (Next.js rewrites proxy, `API_ORIGIN`).

## Capabilities and Constraints

Implemented today (backend): session auth + profile + avatar, Developer Mode
opt-in, API key create/list/revoke, on-ramp create with inline quote, order
get/list (cursor pagination), health endpoints.

Not implemented; the UI must not pretend otherwise: retail-session orders,
off-ramp/sell flow, webhooks, SEP-24, federation, quote preview endpoint
(quotes only exist inline at order creation), rate limiting, cancel/refund,
order search.

Hard rules: money and XLM amounts are decimal strings end to end; JSON
bodies reject unknown fields; `pk_test_` keys live in memory only and are
wiped on logout; 401 means redirect to sign-in; two error envelope styles
(rich on order endpoints, simple on auth/key endpoints).

## Brand Commitments

- Name: KailoPay.
- Identity is greenfield: no logo, palette, or style guide exists yet.
- Pinned by the user: typeface is Plus Jakarta Sans (the font used on
  saaspo.com; identified from its stylesheet). To be wired via `next/font`.
- UI copy language: English (Indonesian payment terms stay as-is: QRIS,
  virtual account, rupiah).
- Pinned by the user (design round, seed 00a920e9 re-roll 1): the visual
  world is a monochrome proof-sheet system with a star compass signature
  figure, fused. Warm paper ground, ink scale, one brass accent, IBM Plex
  Mono annotations under Plus Jakarta Sans, light world only (no dark
  mode), claim-then-proof composition on persuasion surfaces.
- Revision pinned by the user (Calendly study, post-review): rounded
  surfaces everywhere (pill header control, ~12px buttons, 20px cards,
  28px section plates) and a colorful pastel state palette beside the kept
  gold signature: sky = created, sea = payment_pending, orchid =
  stellar_processing, gold = completed, sun = terminal states. Ground is
  near-white, ink is deep navy, navy CTA fills replace squared brass.
  The compass, fonts, and claim-then-proof structure carry over.

## Evidence on Hand

- `documentations/FRONTEND-GUIDE.md` — verified backend contracts, screen
  map, non-negotiable rules.
- `kailopay-be/openapi/openapi.yaml` (sibling repo) — contract authority.
- No logo, imagery, testimonials, metrics, or customer proof exists. Do not
  fabricate any; the product is a sandbox sprint.

## Product Principles

1. Sandbox honesty over polish that lies: badging and copy never imply real
   money, and missing backend capability is never masked by UI.
2. String money, always: amounts are formatted for humans and serialized as
   decimal strings; no floating-point ever touches a value.
3. Status is a story: every order state is named, explained, and bounded by
   the quote countdown; terminal failures always offer the order id and
   request id for support.
4. Developer-first craft: the API key reveal, idempotent retries, and error
   codes are first-class UI moments, not edge cases.
5. One origin, zero secrets in the client: same-origin proxying, session
   cookie owned by the backend, `pk_test_` keys memory-only.
