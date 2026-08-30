import assert from "node:assert/strict";
import test from "node:test";
import {
  clearConsumerPurchase,
  paymentLinkForCheckout,
  readConsumerOrderId,
  readConsumerPurchase,
  saveConsumerPurchase,
  type ConsumerPurchase,
} from "./purchase.ts";

class MemoryStorage {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}

const purchase: ConsumerPurchase = {
  orderId: null,
  idempotencyKey: "consumer-intent-1",
  amountMinor: "100000",
  stellarAccount: "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  memo: "hello",
};

test("consumer purchase storage keeps the same retry intent and order id", () => {
  const storage = new MemoryStorage();

  saveConsumerPurchase(storage, purchase);
  assert.deepEqual(readConsumerPurchase(storage), purchase);
  assert.equal(readConsumerOrderId(storage), null);

  const withOrder: ConsumerPurchase = { ...purchase, orderId: "order-1" };
  saveConsumerPurchase(storage, withOrder);
  assert.deepEqual(readConsumerPurchase(storage), withOrder);
  assert.equal(readConsumerOrderId(storage), "order-1");

  clearConsumerPurchase(storage);
  assert.equal(readConsumerPurchase(storage), null);
  assert.equal(readConsumerOrderId(storage), null);
});

test("consumer purchase storage rejects malformed session data", () => {
  const storage = new MemoryStorage();
  storage.setItem("kailopay.consumer.purchase", JSON.stringify({ amountMinor: 100000 }));
  storage.setItem("kailopay.consumer.order_id", "not-an-order-id");

  assert.equal(readConsumerPurchase(storage), null);
  assert.equal(readConsumerOrderId(storage), "not-an-order-id");
});

test("hosted checkout uses payment_link_url and only falls back for PAYMENT_LINK", () => {
  assert.equal(
    paymentLinkForCheckout({
      id: "checkout-1",
      status: "ACTIVE",
      presentation_type: "PAYMENT_LINK",
      presentation_value: "https://checkout.xendit.co/fallback",
      payment_link_url: "https://checkout.xendit.co/primary",
      expires_at: null,
    }),
    "https://checkout.xendit.co/primary",
  );
  assert.equal(
    paymentLinkForCheckout({
      id: "checkout-2",
      status: "ACTIVE",
      presentation_type: "PAYMENT_LINK",
      presentation_value: "https://checkout.xendit.co/fallback",
      expires_at: null,
    }),
    "https://checkout.xendit.co/fallback",
  );
  assert.equal(
    paymentLinkForCheckout({
      id: "checkout-3",
      status: "ACTIVE",
      presentation_type: "QR_STRING",
      presentation_value: "not-a-link-for-this-flow",
      expires_at: null,
    }),
    null,
  );
});
