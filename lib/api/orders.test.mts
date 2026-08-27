import assert from "node:assert/strict";
import test from "node:test";
import { createOfframp } from "./orders.ts";

const baseOrder = {
  id: "00000000-0000-4000-8000-000000000001",
  status: "asset_pending",
  environment: "sandbox",
  network: "stellar_testnet",
  fiat: { currency: "IDR", amount_minor: "100000" },
  asset: { code: "XLM", amount: "40.0000000" },
  quote: {
    rate: "2500.125",
    adjusted_rate: "2525.12625",
    spread_bps: 100,
    source_at: "2026-08-28T10:00:00.000Z",
    expires_at: "2026-08-28T10:05:00.000Z",
  },
  payment_method: null,
  stellar_destination: { account: "", memo: "offrampmemo" },
  created_at: "2026-08-28T10:00:00.000Z",
  updated_at: "2026-08-28T10:00:00.000Z",
};

test("createOfframp sends the documented Week 2 request and parses deposit instructions", async (t) => {
  const originalFetch = globalThis.fetch;
  let captured: { input: RequestInfo | URL; init: RequestInit | undefined } | undefined;
  globalThis.fetch = async (input, init) => {
    captured = { input, init };
    return new Response(JSON.stringify({ order: baseOrder }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  };
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const order = await createOfframp({
    apiKey: "pk_test_example",
    idempotencyKey: "offramp-intent-1",
    assetAmount: "40.0000000",
    destinationToken: "sandbox-bank-reference",
  });

  assert.equal(order.direction, "offramp");
  assert.equal(order.status, "asset_pending");
  assert.equal(order.payment_method, null);
  assert.equal(order.stellar_destination.memo, "offrampmemo");
  const request = requireCapture(captured);
  assert.equal(request.input, "/v1/offramps");
  const requestHeaders = new Headers(request.init?.headers);
  assert.equal(requestHeaders.get("Authorization"), "Bearer pk_test_example");
  assert.equal(requestHeaders.get("Idempotency-Key"), "offramp-intent-1");
  assert.deepEqual(JSON.parse(String(request.init?.body)), {
    asset: { network: "stellar_testnet", code: "XLM", amount: "40.0000000" },
    withdrawal: {
      currency: "IDR",
      method: "sandbox_bank_transfer",
      destination_token: "sandbox-bank-reference",
    },
  });
});

function requireCapture(
  captured: { input: RequestInfo | URL; init: RequestInit | undefined } | undefined,
): { input: RequestInfo | URL; init: RequestInit | undefined } {
  if (captured === undefined) throw new Error("fetch request was not captured");
  return captured;
}

test("createOfframp parses payout proof without converting amount strings", async (t) => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({
    order: {
      ...baseOrder,
      status: "completed",
      deposit_transaction_hash: "deposit-hash-1",
      payout: {
        reference: "payout_order-1",
        method: "sandbox_bank_transfer",
        amount_minor: "100000",
        state: "completed",
        simulated: true,
        disclosure: "sandbox simulation; no IDR was transferred",
      },
    },
    payout_simulation: true,
  }), { status: 200, headers: { "Content-Type": "application/json" } });
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const order = await createOfframp({
    apiKey: "pk_test_example",
    idempotencyKey: "offramp-intent-2",
    assetAmount: "40.0000000",
    destinationToken: "sandbox-bank-reference",
  });

  assert.equal(order.direction, "offramp");
  assert.equal(order.deposit_transaction_hash, "deposit-hash-1");
  assert.equal(order.payout?.amount_minor, "100000");
  assert.equal(order.payout?.simulated, true);
});
