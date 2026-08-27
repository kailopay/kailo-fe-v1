# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary, today: consumers exploring the IDR and XLM corridor through a
consumer-first Buy and Sell workspace in sandbox mode. They can see the
direction of money, the testnet boundary, the quote state, and the route that
will be created.

Secondary, today: developers who opt into Developer Mode, create `pk_test_`
keys, and run the API-backed on-ramp or off-ramp playground. The current order
API remains API-key scoped, so Developer Mode is the working bridge until the
backend exposes retail-session orders.

## Product Purpose

KailoPay is an Indonesia-first fiat on-ramp/off-ramp for Stellar. Release
v0.1.0 (30-day sandbox sprint) presents one corridor in sandbox form only:
buy XLM with IDR through QRIS or a BRI virtual account, or sell XLM through a
simulated bank payout. No real money moves. Success for this frontend is a
consumer route that feels clear and friendly, paired with a developer route
that can complete and inspect the documented backend flows.

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
- Off-ramp orders accept an XLM amount and sandbox payout reference, then
  expose deposit instructions and a simulated IDR payout when the backend
  provides those fields.
- The backend sends no CORS headers by design; the frontend must be served
  same-origin (Next.js rewrites proxy, `API_ORIGIN`).

## Capabilities and Constraints

Implemented today (backend): session auth + profile + avatar, Developer Mode
opt-in, API key create/list/revoke, on-ramp create with inline quote, Week 2
off-ramp create with simulated payout, order get/list (cursor pagination), and
health endpoints.

Not implemented; the UI must not pretend otherwise: retail-session orders,
quote preview endpoint (quotes only exist inline at order creation), webhooks,
SEP-24, federation, rate limiting, cancel/refund, order search, and a
production payout destination. The current off-ramp response may omit a
deposit account, so the UI shows an unavailable-instructions state instead of
inventing an address.

Hard rules: money and XLM amounts are decimal strings end to end; JSON
bodies reject unknown fields; `pk_test_` keys live in memory only and are
wiped on logout; 401 means redirect to sign-in; two error envelope styles
(rich on order endpoints, simple on auth/key endpoints).

## Brand Commitments

- Name: KailoPay.
- Identity is greenfield: no logo, palette, or style guide exists yet.
- Pinned by the user: typeface is Plus Jakarta Sans (the font used on
  saaspo.com; identified from its stylesheet). The app uses a sans-serif
  system stack so local builds remain offline-safe.
- UI copy language: English (Indonesian payment terms stay as-is: QRIS,
  virtual account, rupiah).
- Pinned by the user: rounded surfaces, a warm near-white ground, deep navy
  ink, and a colorful pastel palette. Coral marks Buy, aqua marks Sell, lilac
  marks Testnet, and mango marks rate information. The star compass remains
  the public signature figure.
- UI copy uses Plus Jakarta Sans and readable spacing. Technical identifiers
  use contrast and wrapping instead of a monospace font or dot-separated
  context lines.

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
4. Two clear modes: the consumer route is action-first, while Developer Mode
   contains API keys, idempotent retries, error codes, and technical order
   history.
5. One origin, zero secrets in the client: same-origin proxying, session
   cookie owned by the backend, `pk_test_` keys memory-only.
