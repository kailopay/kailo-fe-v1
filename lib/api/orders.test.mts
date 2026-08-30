import assert from "node:assert/strict";
import test from "node:test";
import { ApiError } from "./client.ts";
import { createOfframp, createOrder, getOrder, listOrders } from "./orders.ts";

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

const hostedOrder = {
  id: "00000000-0000-4000-8000-000000000002",
  status: "payment_pending",
  environment: "sandbox",
  network: "stellar_testnet",
  fiat: { currency: "IDR", amount_minor: "100000" },
  asset: { code: "XLM", amount: "40.0000000" },
  quote: {
    rate: "2500",
    adjusted_rate: "2500",
    spread_bps: 0,
    source_at: "2026-08-30T10:00:00.000Z",
    expires_at: "2026-08-30T10:05:00.000Z",
  },
  payment_method: "xendit",
  stellar_destination: {
    account: "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    memo: null,
  },
  checkout: {
    id: "ps-2",
    status: "ACTIVE",
    presentation_type: "PAYMENT_LINK",
    presentation_value: "https://checkout.xendit.co/sessions/ps-2",
    payment_link_url: "https://checkout.xendit.co/sessions/ps-2",
    expires_at: "2026-08-30T10:05:00.000Z",
  },
  created_at: "2026-08-30T10:00:00.000Z",
  updated_at: "2026-08-30T10:00:00.000Z",
};

test("createOrder sends a cookie-only hosted checkout request for a consumer", async (t) => {
  const originalFetch = globalThis.fetch;
  let captured: { input: RequestInfo | URL; init: RequestInit | undefined } | undefined;
  globalThis.fetch = async (input, init) => {
    captured = { input, init };
    return new Response(JSON.stringify({ order: hostedOrder }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  };
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const order = await createOrder({
    idempotencyKey: "consumer-intent-1",
    amountMinor: "100000",
    paymentMethod: "xendit",
    destinationAccount: hostedOrder.stellar_destination.account,
    memo: null,
  });

  assert.equal(order.payment_method, "xendit");
  assert.equal(order.checkout?.presentation_type, "PAYMENT_LINK");
  assert.equal(order.checkout?.payment_link_url, "https://checkout.xendit.co/sessions/ps-2");
  const request = requireCapture(captured);
  const headers = new Headers(request.init?.headers);
  assert.equal(request.input, "/v1/onramps");
  assert.equal(request.init?.credentials, "include");
  assert.equal(headers.get("Authorization"), null);
  assert.equal(headers.get("Idempotency-Key"), "consumer-intent-1");
  assert.deepEqual(JSON.parse(String(request.init?.body)), {
    fiat: { currency: "IDR", amount_minor: "100000" },
    payment_method: "xendit",
    stellar_destination: {
      account: hostedOrder.stellar_destination.account,
      memo: null,
    },
  });
});

test("consumer order reads include the session cookie without an API key", async (t) => {
  const originalFetch = globalThis.fetch;
  const requests: Array<{ input: RequestInfo | URL; init: RequestInit | undefined }> = [];
  globalThis.fetch = async (input, init) => {
    requests.push({ input, init });
    const body = String(input).includes("?")
      ? JSON.stringify({ orders: [hostedOrder], next_cursor: "" })
      : JSON.stringify({ order: hostedOrder });
    return new Response(body, { status: 200, headers: { "Content-Type": "application/json" } });
  };
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  await getOrder(hostedOrder.id);
  await listOrders(undefined, { limit: 20 });

  assert.equal(requests.length, 2);
  for (const request of requests) {
    const headers = new Headers(request.init?.headers);
    assert.equal(request.init?.credentials, "include");
    assert.equal(headers.get("Authorization"), null);
  }
});

test("createOrder preserves a reconciliation order id and request id", async (t) => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({
    error: {
      code: "CHECKOUT_PENDING_RECONCILIATION",
      message: "The checkout outcome is being reconciled with the payment provider.",
    },
    request_id: "req-reconcile-1",
    order_id: hostedOrder.id,
  }), { status: 202, headers: { "Content-Type": "application/json" } });
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  await assert.rejects(
    createOrder({
      idempotencyKey: "consumer-intent-2",
      amountMinor: "100000",
      paymentMethod: "xendit",
      destinationAccount: hostedOrder.stellar_destination.account,
      memo: null,
    }),
    (error: unknown) => {
      assert.ok(error instanceof ApiError);
      assert.equal(error.status, 202);
      assert.equal(error.code, "CHECKOUT_PENDING_RECONCILIATION");
      assert.equal(error.requestId, "req-reconcile-1");
      assert.equal(error.orderId, hostedOrder.id);
      return true;
    },
  );
});

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
