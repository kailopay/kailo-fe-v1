import type { Checkout } from "@/lib/api/types";

export const CONSUMER_ORDER_ID_STORAGE_KEY = "kailopay.consumer.order_id";
export const CONSUMER_PURCHASE_STORAGE_KEY = "kailopay.consumer.purchase";

export type ConsumerPurchase = {
  orderId: string | null;
  idempotencyKey: string;
  amountMinor: string;
  stellarAccount: string;
  memo: string | null;
};

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function saveConsumerPurchase(storage: StorageLike, purchase: ConsumerPurchase): void {
  try {
    storage.setItem(CONSUMER_PURCHASE_STORAGE_KEY, JSON.stringify(purchase));
    if (purchase.orderId === null) {
      storage.removeItem(CONSUMER_ORDER_ID_STORAGE_KEY);
    } else {
      storage.setItem(CONSUMER_ORDER_ID_STORAGE_KEY, purchase.orderId);
    }
  } catch {
    // Private browsing and storage quotas must not prevent a checkout request.
  }
}

export function readConsumerPurchase(storage: StorageLike): ConsumerPurchase | null {
  let serialized: string | null;
  try {
    serialized = storage.getItem(CONSUMER_PURCHASE_STORAGE_KEY);
  } catch {
    return null;
  }
  if (serialized === null) return null;

  try {
    const value: unknown = JSON.parse(serialized);
    if (!isRecord(value)) return null;
    const orderId = value.orderId;
    const memo = value.memo;
    if (
      (orderId !== null && typeof orderId !== "string") ||
      typeof value.idempotencyKey !== "string" ||
      typeof value.amountMinor !== "string" ||
      typeof value.stellarAccount !== "string" ||
      (memo !== null && typeof memo !== "string")
    ) {
      return null;
    }
    return {
      orderId,
      idempotencyKey: value.idempotencyKey,
      amountMinor: value.amountMinor,
      stellarAccount: value.stellarAccount,
      memo,
    };
  } catch {
    return null;
  }
}

export function readConsumerOrderId(storage: StorageLike): string | null {
  try {
    const orderId = storage.getItem(CONSUMER_ORDER_ID_STORAGE_KEY);
    return orderId === null || orderId.length === 0 ? null : orderId;
  } catch {
    return null;
  }
}

export function clearConsumerPurchase(storage: StorageLike): void {
  try {
    storage.removeItem(CONSUMER_PURCHASE_STORAGE_KEY);
    storage.removeItem(CONSUMER_ORDER_ID_STORAGE_KEY);
  } catch {
    // A stale browser storage entry is harmless when the user starts over.
  }
}

export function paymentLinkForCheckout(checkout: Checkout | null): string | null {
  if (checkout === null || checkout.presentation_type !== "PAYMENT_LINK") return null;
  if (checkout.payment_link_url !== undefined && checkout.payment_link_url.length > 0) {
    return checkout.payment_link_url;
  }
  if (checkout.presentation_value !== undefined && checkout.presentation_value.length > 0) {
    return checkout.presentation_value;
  }
  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
