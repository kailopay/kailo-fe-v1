import { apiRequest, isRecord, numberField, stringField } from "./client";
import { ApiError } from "./client";
import type { Checkout, Order, OrderStatus, PaymentMethod, Quote } from "./types";

const ORDER_STATUSES = [
  "created",
  "payment_pending",
  "payment_confirmed",
  "stellar_processing",
  "completed",
  "expired",
  "payment_failed",
  "stellar_failed",
] as const satisfies readonly OrderStatus[];

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
  if (presentation !== "QR_STRING" && presentation !== "VIRTUAL_ACCOUNT_NUMBER") {
    throw malformed("checkout presentation_type");
  }
  return {
    id: stringField(value, "id"),
    status: stringField(value, "status"),
    presentation_type: presentation,
    presentation_value: stringField(value, "presentation_value"),
    expires_at: stringField(value, "expires_at"),
  };
}

function parseOrderEnvelope(payload: unknown): Order {
  if (!isRecord(payload) || !isRecord(payload.order)) throw malformed("order");
  const order = payload.order;

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

  const paymentMethod = stringField(order, "payment_method");
  if (paymentMethod !== "qris" && paymentMethod !== "bri_va") {
    throw malformed("payment_method");
  }

  const parsed: Order = {
    id: stringField(order, "id"),
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
    payment_method: paymentMethod,
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
  const failureCode: unknown = order.failure_code;
  if (typeof failureCode === "string") parsed.failure_code = failureCode;

  return parsed;
}

function malformed(what: string): ApiError {
  return new ApiError(`Malformed payload: ${what}`, 0, "MALFORMED_RESPONSE", null);
}

export type CreateOrderInput = {
  apiKey: string;
  idempotencyKey: string;
  amountMinor: string;
  paymentMethod: PaymentMethod;
  destinationAccount: string;
  memo: string | null;
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
  return parseOrderEnvelope(payload);
}

export async function getOrder(id: string, apiKey: string): Promise<Order> {
  const payload: unknown = await apiRequest(`/v1/orders/${id}`, { apiKey });
  return parseOrderEnvelope(payload);
}
