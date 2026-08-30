import { apiRequest, isRecord, numberField, stringField } from "./client.ts";
import { ApiError } from "./client.ts";
import type { Checkout, Order, OrderDirection, OrderStatus, PaymentMethod, Payout, Quote } from "./types.ts";

const ORDER_STATUSES = [
  "created",
  "payment_pending",
  "payment_confirmed",
  "stellar_processing",
  "completed",
  "expired",
  "payment_failed",
  "stellar_failed",
  "cancelled",
  "asset_pending",
  "asset_received",
  "asset_invalid",
  "retirement_processing",
  "withdrawal_processing",
  "retirement_failed",
  "withdrawal_failed",
] as const satisfies readonly OrderStatus[];

const OFFRAMP_STATUSES: readonly OrderStatus[] = [
  "asset_pending",
  "asset_received",
  "asset_invalid",
  "retirement_processing",
  "withdrawal_processing",
  "retirement_failed",
  "withdrawal_failed",
];

function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}

function parseQuote(value: unknown): Quote {
  if (!isRecord(value)) throw malformed("quote");
  return {
    rate: stringField(value, "rate"),
    adjusted_rate: stringField(value, "adjusted_rate"),
    spread_bps: numberField(value, "spread_bps"),
    source_at: stringField(value, "source_at"),
    expires_at: stringField(value, "expires_at"),
  };
}

function parseCheckout(value: unknown): Checkout | null {
  if (value === null || value === undefined) return null;
  if (!isRecord(value)) throw malformed("checkout");
  const presentation = stringField(value, "presentation_type");
  if (
    presentation !== "PAYMENT_LINK" &&
    presentation !== "QR_STRING" &&
    presentation !== "VIRTUAL_ACCOUNT_NUMBER"
  ) {
    throw malformed("checkout presentation_type");
  }
  const presentationValue = optionalStringField(value, "presentation_value");
  const paymentLinkUrl = optionalStringField(value, "payment_link_url");
  if (presentation === "PAYMENT_LINK" && paymentLinkUrl === undefined && presentationValue === undefined) {
    throw malformed("checkout payment link");
  }
  if (presentation !== "PAYMENT_LINK" && presentationValue === undefined) {
    throw malformed("checkout presentation_value");
  }
  const expiresAt = value.expires_at;
  if (expiresAt !== null && expiresAt !== undefined && typeof expiresAt !== "string") {
    throw malformed("checkout expires_at");
  }
  return {
    id: stringField(value, "id"),
    status: stringField(value, "status"),
    presentation_type: presentation,
    presentation_value: presentationValue,
    payment_link_url: paymentLinkUrl,
    expires_at: expiresAt ?? null,
  };
}

function parsePayout(value: unknown): Payout | undefined {
  if (value === undefined) return undefined;
  if (!isRecord(value)) throw malformed("payout");
  const method = stringField(value, "method");
  const simulated = value.simulated;
  if (method !== "sandbox_bank_transfer" || typeof simulated !== "boolean") {
    throw malformed("payout fields");
  }
  return {
    reference: stringField(value, "reference"),
    method,
    amount_minor: stringField(value, "amount_minor"),
    state: stringField(value, "state"),
    simulated,
    disclosure: stringField(value, "disclosure"),
  };
}

function inferDirection(status: OrderStatus, payout: Payout | undefined, depositHash: string | undefined): OrderDirection {
  if (OFFRAMP_STATUSES.includes(status) || payout !== undefined || depositHash !== undefined) {
    return "offramp";
  }
  return "onramp";
}

function parseOrderBody(order: Record<string, unknown>): Order {
  const status = stringField(order, "status");
  if (!isOrderStatus(status)) throw malformed(`order status "${status}"`);

  const fiat: unknown = order.fiat;
  const asset: unknown = order.asset;
  const destination: unknown = order.stellar_destination;
  if (!isRecord(fiat) || !isRecord(asset) || !isRecord(destination)) {
    throw malformed("order fields");
  }

  const memo: unknown = destination.memo;
  if (memo !== null && typeof memo !== "string") throw malformed("destination memo");

  const rawPaymentMethod = order.payment_method;
  if (
    rawPaymentMethod !== null &&
    rawPaymentMethod !== "xendit" &&
    rawPaymentMethod !== "qris" &&
    rawPaymentMethod !== "bri_va"
  ) {
    throw malformed("payment_method");
  }

  const depositHash = optionalStringField(order, "deposit_transaction_hash");
  const payout = parsePayout(order.payout);

  const parsed: Order = {
    id: stringField(order, "id"),
    direction: inferDirection(status, payout, depositHash),
    status,
    environment: stringField(order, "environment") as Order["environment"],
    network: stringField(order, "network") as Order["network"],
    fiat: {
      currency: stringField(fiat, "currency") as Order["fiat"]["currency"],
      amount_minor: stringField(fiat, "amount_minor"),
    },
    asset: {
      code: stringField(asset, "code") as Order["asset"]["code"],
      amount: stringField(asset, "amount"),
    },
    quote: parseQuote(order.quote),
    payment_method: rawPaymentMethod,
    stellar_destination: {
      account: stringField(destination, "account"),
      memo,
    },
    checkout: parseCheckout(order.checkout),
    created_at: stringField(order, "created_at"),
    updated_at: stringField(order, "updated_at"),
  };

  const hash: unknown = order.stellar_transaction_hash;
  if (typeof hash === "string") parsed.stellar_transaction_hash = hash;
  if (depositHash !== undefined) parsed.deposit_transaction_hash = depositHash;
  if (payout !== undefined) parsed.payout = payout;
  const failureCode = optionalStringField(order, "failure_code");
  if (failureCode !== undefined) parsed.failure_code = failureCode;

  return parsed;
}

function parseOrderEnvelope(payload: unknown): Order {
  if (!isRecord(payload) || !isRecord(payload.order)) throw malformed("order");
  return parseOrderBody(payload.order);
}

function malformed(what: string): ApiError {
  return new ApiError(`Malformed payload: ${what}`, 0, "MALFORMED_RESPONSE", null);
}

function optionalStringField(record: Record<string, unknown>, key: string): string | undefined {
  const value: unknown = record[key];
  if (value === undefined) return undefined;
  if (typeof value !== "string") throw malformed(`field "${key}"`);
  return value;
}

export type CreateOrderInput = {
  apiKey?: string;
  idempotencyKey: string;
  amountMinor: string;
  paymentMethod: PaymentMethod;
  destinationAccount: string;
  memo: string | null;
};

export type CreateOfframpInput = {
  apiKey: string;
  idempotencyKey: string;
  assetAmount: string;
  destinationToken: string;
};

/** POST /v1/onramps. 201 (new) and 200 (idempotent replay) are both success. */
export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const payload: unknown = await apiRequest("/v1/onramps", {
    method: "POST",
    apiKey: input.apiKey,
    idempotencyKey: input.idempotencyKey,
    body: {
      fiat: { currency: "IDR", amount_minor: input.amountMinor },
      payment_method: input.paymentMethod,
      stellar_destination: {
        account: input.destinationAccount,
        memo: input.memo,
      },
    },
  });
  // 202 is an ok-status response whose body is the error envelope: the
  // checkout outcome is being reconciled. Surface it as a typed hold, not
  // a malformed payload.
  const hold = readOnrampError(payload);
  if (hold !== null) {
    throw new ApiError(
      "The checkout outcome is being confirmed with the payment provider.",
      202,
      hold.code,
      hold.requestId,
      hold.orderId,
    );
  }
  return parseOrderEnvelope(payload);
}

/** POST /v1/offramps. 201 (new) and 200 (idempotent replay) are both success. */
export async function createOfframp(input: CreateOfframpInput): Promise<Order> {
  const payload: unknown = await apiRequest("/v1/offramps", {
    method: "POST",
    apiKey: input.apiKey,
    idempotencyKey: input.idempotencyKey,
    body: {
      asset: { network: "stellar_testnet", code: "XLM", amount: input.assetAmount },
      withdrawal: {
        currency: "IDR",
        method: "sandbox_bank_transfer",
        destination_token: input.destinationToken,
      },
    },
  });
  return parseOrderEnvelope(payload);
}

/** Error code when an ok-status payload is actually an OnrampError body. */
function readOnrampError(payload: unknown): {
  code: string;
  requestId: string | null;
  orderId: string | null;
} | null {
  if (!isRecord(payload) || !isRecord(payload.error)) return null;
  const code: unknown = payload.error.code;
  if (typeof code !== "string") return null;
  const requestId: unknown = payload.request_id;
  const orderId: unknown = payload.order_id;
  return {
    code,
    requestId: typeof requestId === "string" ? requestId : null,
    orderId: typeof orderId === "string" ? orderId : null,
  };
}

export async function getOrder(
  id: string,
  apiKey?: string,
  options: { signal?: AbortSignal } = {},
): Promise<Order> {
  const payload: unknown = await apiRequest(`/v1/orders/${encodeURIComponent(id)}`, { apiKey, signal: options.signal });
  return parseOrderEnvelope(payload);
}

export type OrdersPage = {
  orders: Order[];
  /** Empty string means there are no more pages. Opaque; never parse it. */
  nextCursor: string;
};

/** GET /v1/orders with cursor pagination. */
export async function listOrders(
  apiKey?: string,
  options: { cursor?: string; limit?: number; signal?: AbortSignal } = {},
): Promise<OrdersPage> {
  const limit = Math.min(Math.max(options.limit ?? 20, 1), 100);
  const params = new URLSearchParams({ limit: String(limit) });
  if (options.cursor !== undefined && options.cursor !== "") {
    params.set("cursor", options.cursor);
  }
  const payload: unknown = await apiRequest(`/v1/orders?${params.toString()}`, {
    apiKey,
    signal: options.signal,
  });
  if (!isRecord(payload) || !Array.isArray(payload.orders)) throw malformed("orders page");
  const nextCursor: unknown = payload.next_cursor;
  if (typeof nextCursor !== "string") throw malformed("next_cursor");
  return {
    orders: payload.orders.map((entry) => {
      if (!isRecord(entry)) throw malformed("orders page entry");
      return parseOrderBody(entry);
    }),
    nextCursor,
  };
}
