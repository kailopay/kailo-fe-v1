# Consumer and Developer UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn KailoPay into a colorful, action-first consumer exchange experience with a separate, restrained developer workspace, while wiring the FE to the current Week 2 on-ramp and off-ramp API contracts.

**Architecture:** Keep the existing Next.js App Router and feature ownership. Replace the generic authenticated dashboard role with a consumer transaction home, add shared route and quote components, and keep API-key-specific technical controls inside Developer Mode. Extend the typed API boundary for the current off-ramp response instead of putting transport assumptions into UI components.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, same-origin Next rewrites, current KailoPay REST API, QRCode renderer.

**Spec:** `PRODUCT.md`, `documentations/FRONTEND-GUIDE.md`, sibling `kailopay-be/documentations/PRD.md`, sibling `kailopay-be/documentations/PHASES.md`, and sibling `kailopay-be/openapi/openapi.yaml`.

## Global Constraints

- Keep IDR and XLM amounts as decimal strings; never use floating-point arithmetic.
- Every value-movement surface visibly shows `Sandbox` and `Stellar Testnet`.
- Use Plus Jakarta Sans for the UI; do not render UI copy in IBM Plex Mono or another monospace font.
- Do not use centered-dot separators in visible UI copy; use spacing, a label, or a divider.
- Use only documented JSON fields and same-origin rewrites for API calls.
- Reuse one idempotency key for retries of one intent and generate a new key for a new intent.
- The current API authenticates order endpoints with `pk_test_` keys. Do not pretend retail-session order creation or quote preview exists until the backend exposes it.
- Preserve the existing unrelated `lib/api/server.ts` working-tree change and never include it in feature commits.
- Do not delete existing routes or production files.

---

### Task 1: Establish the shared visual language and consumer-first shell

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`
- Modify: `components/sandbox-badges.tsx`
- Modify: `app/(session)/layout.tsx`
- Create: `components/network-selector.tsx`
- Create: `features/consumer/consumer-shell.tsx`

**Interfaces:**
- `NetworkSelector` renders Testnet as active and Mainnet as disabled with a truthful explanation.
- `ConsumerShell` renders Buy, Sell, Activity, and Profile navigation without exposing developer-only vocabulary.

- [x] **Step 1: Add the visual tokens and sans-serif rule**

Add named tokens for milk, coral, aqua, lilac, mango, and the existing navy and paper colors. Remove the IBM Plex Mono import and map all UI typography to the sans token. Keep numeric tabular figures through `font-feature-settings`, not a monospace font.

- [x] **Step 2: Add the network selector**

Render a compact selector with Testnet selected and Mainnet disabled. The disabled option explains that mainnet is not part of the sandbox release. Do not add a fake mainnet route.

- [x] **Step 3: Replace the desktop-only developer sidebar with a consumer shell**

Make the primary shell action-first and responsive. Developer links remain available from Profile or an explicit Developer Mode area. Add a mobile bottom navigation with single-line labels.

- [x] **Step 4: Remove centered-dot separators and monospace classes from the touched shell**

Use normal sans-serif text and separate environment badges. Keep technical values readable through spacing and contrast rather than a different font family.

- [x] **Step 5: Run the FE linter**

Run `npm run lint`. Expected result: exit code 0.

- [x] **Step 6: Commit the shell slice**

```powershell
git add app/globals.css app/layout.tsx components/sandbox-badges.tsx app/(session)/layout.tsx components/network-selector.tsx features/consumer/consumer-shell.tsx
git commit -m "feat(ui): add consumer-first application shell"
```

### Task 2: Build the consumer Buy and Sell workspace

**Files:**
- Create: `features/consumer/consumer-flow.tsx`
- Create: `features/consumer/live-rate-strip.tsx`
- Create: `features/consumer/route-visual.tsx`
- Create: `features/consumer/amount-field.tsx`
- Modify: `app/(session)/dashboard/page.tsx`
- Create: `app/(session)/buy/page.tsx`
- Create: `app/(session)/sell/page.tsx`

**Interfaces:**
- `ConsumerFlow` accepts `{ initialDirection: "buy" | "sell" }` and keeps Buy/Sell state in the URL-safe route.
- `LiveRateStrip` accepts a `Quote | null` and distinguishes the live-rate handoff from the locked quote returned by order creation.
- `RouteVisual` accepts `direction` and renders the consumer route rail without technical identifiers.

- [x] **Step 1: Add failing boundary-focused tests for direction and rate labels**

Because this repository has no test runner yet, first add a small test runner setup using Node 24's built-in `node:test` runner with TypeScript type stripping and test the pure rate-label and direction helpers before wiring components. The tests must cover buy direction, sell direction, locked quote expiry, and unavailable quote copy.

- [x] **Step 2: Run the focused tests and confirm RED**

Run `npm test -- --run features/consumer/consumer-flow.test.ts`. Expected result: failure because the helpers do not exist.

- [x] **Step 3: Implement the minimal pure helpers and test them GREEN**

Keep the helpers string-safe. A buy view says `IDR to XLM`; a sell view says `XLM to IDR`. A quote with an expiry says `Rate locked`; no quote says `Live rate at checkout` until the backend provides quote preview.

- [x] **Step 4: Build the consumer route composition**

Use a single large action surface rather than a dashboard grid. Buy uses coral, Sell uses aqua, Testnet uses lilac, and status colors remain semantic. The amount and direction are the main visual anchor. The approved follow-up visual direction is a soft pastel exchange ticket with a currency rail, progressive details, and one primary action.

- [x] **Step 5: Add the route pages and make `/dashboard` the consumer home**

The authenticated landing page opens on Buy. `/buy` and `/sell` preserve the same shell and flow. Keep the existing developer routes available but visually separate.

- [x] **Step 6: Run tests and lint**

Run `npm test -- --run features/consumer/consumer-flow.test.ts` and `npm run lint`. Expected result: focused tests pass and lint exits 0.

- [x] **Step 7: Commit the consumer workspace slice**

```powershell
git add app/(session)/dashboard/page.tsx app/(session)/buy/page.tsx app/(session)/sell/page.tsx features/consumer
git commit -m "feat(consumer): add colorful buy and sell workspace"
```

### Approved visual follow-up: pastel exchange pocket

- [x] Extend the consumer-first shell into a compact product header while
  keeping Developer Mode in its own navigation shell.
- [x] Replace the public compass/proof-sheet landing composition with the same
  consumer exchange language and an honest `Rate at checkout` presentation.
- [x] Keep the consumer route visually focused on `You pay`, `You receive`,
  destination, payment method, and sandbox/testnet context.

### Task 3: Extend the typed API boundary for Week 2 off-ramp data

**Files:**
- Modify: `lib/api/types.ts`
- Modify: `lib/api/orders.ts`
- Create: `features/orders/route-status.ts`
- Test: `lib/api/orders.test.ts`

**Interfaces:**
- `createOfframp({ apiKey, idempotencyKey, amount, destinationToken })` calls `POST /v1/offramps` with exactly the documented `asset` and `withdrawal` fields.
- `Order` supports on-ramp and off-ramp statuses, optional payment method, payout simulation, and deposit transaction hash.
- `routeStatus(order)` maps both state machines into consumer-safe labels and step positions.

- [x] **Step 1: Write parser and request tests first**

Cover the current Week 2 response fields: `asset_pending`, `asset_received`, `retirement_processing`, `withdrawal_processing`, `completed` with `payout`, and the on-ramp response with checkout. Assert that no numeric conversion occurs and that the off-ramp body contains no undocumented fields.

- [ ] **Step 2: Run the focused tests and confirm RED**

Run `npm test -- --run lib/api/orders.test.ts`. Expected result: failure because off-ramp types and request functions are missing.

- [x] **Step 3: Implement the minimal parser and API functions**

Parse optional `payment_method`, `payout`, and `deposit_transaction_hash` fields at the API boundary. Infer the direction only from explicit off-ramp statuses or payout/deposit fields because the current backend response does not yet include a direction field.

- [x] **Step 4: Run the focused tests and confirm GREEN**

Run `npm test -- --run lib/api/orders.test.ts`. Expected result: all parser and request tests pass.

- [x] **Step 5: Commit the API contract slice**

```powershell
git add lib/api/types.ts lib/api/orders.ts features/orders/route-status.ts lib/api/orders.test.ts package.json package-lock.json
git commit -m "feat(api): wire the Week 2 off-ramp contract"
```

### Task 4: Wire consumer payment and sell settlement states

**Files:**
- Modify: `features/orders/order-detail.tsx`
- Modify: `features/orders/payment-panel.tsx`
- Modify: `features/orders/order-history.tsx`
- Modify: `features/orders/status.ts`
- Create: `app/(session)/activity/page.tsx`

**Interfaces:**
- Buy uses the existing QRIS and BRI VA checkout response and polling behavior.
- Sell uses the Week 2 deposit instruction response and simulated payout disclosure.
- `OrderDetail` renders a route timeline for both directions without exposing API keys or request internals to consumers.

- [x] **Step 1: Add failing state-mapping tests**

Test that buy statuses show payment steps, sell statuses show deposit and payout steps, and terminal failures do not offer a second payment for the same order.

- [ ] **Step 2: Run focused tests and confirm RED**

Run `npm test -- --run features/orders/route-status.test.ts`. Expected result: failure because the shared route mapping is missing.

- [x] **Step 3: Implement the shared status mapping and order presentation**

Use the happy action colors only for direction. Use semantic state colors for success, waiting, and failure. Show live quote source time, locked expiry, spread, and payout simulation disclosure in the summary.

- [x] **Step 4: Wire on-ramp checkout and off-ramp deposit instructions**

Reuse the documented `GET /v1/orders/{id}` polling. QRIS and VA continue using their existing presentation fields. Off-ramp shows the deposit account and memo when the backend provides them; if the current response omits the deposit account, show an explicit unavailable-instructions state rather than inventing one.

- [x] **Step 5: Add activity navigation**

Render recent routes as a personal list, not KPI cards. Use the existing API-key-scoped list for Developer Mode and keep the consumer route ready for the future retail-session list endpoint.

- [x] **Step 6: Run tests, lint, and build**

Run the focused tests, `npm run lint`, and `npm run build`. Expected result: all pass with no TypeScript errors.

- [x] **Step 7: Commit the order experience slice**

```powershell
git add app/(session)/activity app/(session)/orders features/consumer features/orders
git commit -m "feat(consumer): add buy and sell settlement journeys"
```

### Task 5: Refine Developer Mode and technical UX

**Files:**
- Modify: `app/(session)/profile/page.tsx`
- Modify: `features/auth/profile-form.tsx`
- Modify: `app/(session)/developer/page.tsx`
- Modify: `features/developer/api-keys-panel.tsx`
- Modify: `features/orders/playground-flow.tsx`
- Modify: `features/orders/order-create-form.tsx`
- Modify: `app/(session)/developer/playground/page.tsx`

**Interfaces:**
- Developer Mode remains a capability switch, not a confusing persona switch.
- Developer UI can use denser layout and technical data, but uses the same sans-serif typography and no centered-dot separators.
- Developer playground is the fully working API-key integration surface for the current Week 2 backend.

- [ ] **Step 1: Add focused copy and mode-state tests**

Cover Developer Mode off, on, and key-revoked states. Assert that disabling the mode does not imply key revocation and that key values remain memory-only.

- [x] **Step 2: Replace technical typography and separators**

Remove `font-mono` from all touched developer copy. Present API identifiers in visually distinct regular-font panels with wrapping and copy affordances. Replace dot-separated context lines with labels and spacing.

- [x] **Step 3: Keep the developer shell visually secondary**

Add clear links from Profile to API keys, playground, and docs. Keep Buy, Sell, and Activity available when Developer Mode is on.

- [ ] **Step 4: Verify existing API-key order behavior**

Run the playground against the current backend when available. Confirm on-ramp creation, idempotent retry, QRIS or VA rendering, polling, and testnet explorer linking remain intact.

- [x] **Step 5: Run lint and build**

Run `npm run lint` and `npm run build`. Expected result: exit code 0.

- [ ] **Step 6: Commit the developer UX slice**

```powershell
git add app/(session)/profile/page.tsx app/(session)/developer features/auth/profile-form.tsx features/orders/playground-flow.tsx features/orders/order-create-form.tsx
git commit -m "feat(developer): align technical workspace with consumer shell"
```

### Task 6: Update handoff docs and verify the shipped experience

**Files:**
- Modify: `PRODUCT.md`
- Modify: `documentations/FRONTEND-GUIDE.md`
- Create: `docs/superpowers/plans/2026-08-28-consumer-developer-ui.md`

- [x] **Step 1: Document the new screen map**

Record Buy, Sell, Activity, Profile, Developer Mode, API keys, playground, and order detail ownership. State that current order APIs remain API-key-authenticated and that retail-session creation and quote preview are backend follow-ups.

- [ ] **Step 2: Run the complete verification baseline**

Run `npm run lint` and `npm run build`. Start the app with `npm run dev` and verify widths 320, 375, 414, and 768 with no horizontal scroll. Exercise the Buy, Sell, Profile, Developer Mode, API key, and playground routes.

- [ ] **Step 3: Inspect the final diff and preserve unrelated work**

Run `git diff --check`, `git status --short`, and `git diff --stat`. Confirm `lib/api/server.ts` is not staged and that every feature commit contains only its own files.

- [ ] **Step 4: Commit the documentation and final polish**

```powershell
git add PRODUCT.md documentations/FRONTEND-GUIDE.md
git commit -m "docs(ui): record consumer and developer journeys"
```

## Coverage Review

- SOW consumer buy and sell experience: Tasks 2 and 4.
- SOW quote, payment status, and history experience: Tasks 2 and 4.
- SOW developer section: Task 5.
- Sandbox and Stellar testnet honesty: Tasks 1 and 4.
- Week 2 off-ramp contract: Task 3 and Task 4.
- Live quote limitation: Tasks 2 and 6 explicitly avoid claiming an unavailable quote-preview endpoint.
- Typography and separator request from the screenshot: Tasks 1 and 5.
- Mainnet visibility without unsupported behavior: Task 1.
