"use client";

import { useEffect, useCallback, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { createOrder, getOrder, type CreateOrderInput } from "@/lib/api/orders";
import type { Order } from "@/lib/api/types";
import { OrderCreateForm, type CreateOrderFormValue } from "./order-create-form";
import { OrderDetail } from "./order-detail";
import { OrderHistory } from "./order-history";

const KEY_PATTERN = /^pk_test_/;

export function PlaygroundFlow({ initialOrderId }: { initialOrderId?: string }) {
  const [apiKey, setApiKey] = useState("");
  const [keyAccepted, setKeyAccepted] = useState(false);
  const [creating, setCreating] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [retry, setRetry] = useState<{ input: CreateOrderInput } | null>(null);
  const [hold, setHold] = useState<{ input: CreateOrderInput } | null>(null);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  // Deep link (?order=<id>): fetch that order once the key is accepted.
  useEffect(() => {
    if (!keyAccepted || initialOrderId === undefined) return;
    let cancelled = false;
    getOrder(initialOrderId, apiKey)
      .then((found) => {
        if (!cancelled) setOrder(found);
      })
      .catch((caught) => {
        if (cancelled) return;
        setError(
          caught instanceof ApiError && caught.code === "ORDER_NOT_FOUND"
            ? "That order was not found for this key. It may belong to another key."
            : "Could not load the linked order.",
        );
      });
    return () => {
      cancelled = true;
    };
  }, [keyAccepted, initialOrderId, apiKey]);

  function acceptKey(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const trimmed = apiKey.trim();
    if (!KEY_PATTERN.test(trimmed)) {
      setError("The key must start with pk_test_. Create one on the Developer page.");
      return;
    }
    setError(null);
    setApiKey(trimmed);
    setKeyAccepted(true);
  }

  async function submitOrder(input: CreateOrderInput): Promise<void> {
    setCreating(true);
    setError(null);
    setRequestId(null);
    try {
      const created = await createOrder(input);
      setOrder(created);
      setRetry(null);
      setHold(null);
      setHistoryRefreshKey((current) => current + 1);
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 202) {
        // CHECKOUT_PENDING_RECONCILIATION: the order exists and is held
        // while the provider outcome settles. Never re-create it; the same
        // key+body replay returns the order once reconciliation finishes.
        setHold({ input });
        setRetry(null);
      } else if (caught instanceof ApiError) {
        setError(explainCreateError(caught));
        setRequestId(caught.requestId);
        // A rejected request is a finished intent; the next submit gets a new key.
        setRetry(null);
        setHold(null);
      } else if (caught instanceof Error) {
        // The outcome is unknown (network). Reuse the SAME idempotency key
        // so a retry can only replay this intent, never double-create.
        setRetry({ input });
        setHold(null);
        setError("The request may or may not have reached the server. Retry safely with the same idempotency key.");
      }
    } finally {
      setCreating(false);
    }
  }

  function handleCreate(value: CreateOrderFormValue): void {
    const input: CreateOrderInput = {
      ...value,
      apiKey,
      idempotencyKey: crypto.randomUUID(),
    };
    void submitOrder(input);
  }

  function handleRetry(): void {
    if (retry === null) return;
    void submitOrder(retry.input);
  }

  function handleHoldCheck(): void {
    if (hold === null) return;
    void submitOrder(hold.input);
  }

  const handlePollError = useCallback((message: string) => {
    setError((current) => (current === message ? current : message));
  }, []);

  if (!keyAccepted) {
    return (
      <div className="max-w-xl">
        <form className="flex flex-col gap-4" onSubmit={acceptKey}>
          <label className="text-sm font-medium text-ink-2" htmlFor="api-key">
            Your test API key
          </label>
          <input
            autoComplete="off"
            className="h-11 rounded-xl border border-line-strong bg-white px-4 font-mono text-sm outline-none transition-colors focus:border-sky-deep"
            id="api-key"
            onChange={(event) => setApiKey(event.target.value)}
            placeholder="pk_test_…"
            type="password"
            value={apiKey}
          />
          <p className="text-xs leading-5 text-ink-3">
            The key stays in this page&apos;s memory only. It is never sent
            anywhere except the order API, is wiped when you leave or sign
            out, and is never logged.
          </p>
          {error !== null && (
            <p className="rounded-xl bg-sun-tint px-4 py-3 text-sm text-sun-deep" role="alert">
              {error}
            </p>
          )}
          <button
            className="h-12 rounded-xl bg-ink text-sm font-medium text-paper transition-colors hover:bg-ink-deep"
            type="submit"
          >
            Use this key
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="grid max-w-4xl gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-start">
      <section>
        <h2 className="text-lg font-semibold">New order</h2>
        <div className="mt-4">
          <OrderCreateForm busy={creating} onSubmit={handleCreate} />
        </div>
        {hold !== null && (
          <div className="mt-4 rounded-[20px] border border-line bg-sky-tint px-5 py-4" role="status">
            <p className="text-sm font-medium text-sky-deep">
              Processing the checkout with the payment provider.
            </p>
            <p className="mt-1 text-sm leading-6 text-sky-deep/80">
              Your order exists and its outcome is being reconciled. Do not
              create it again; check back with the same request.
            </p>
            <button
              className="mt-3 h-11 rounded-xl border border-sky-deep/40 px-4 text-sm font-medium text-sky-deep transition-colors hover:border-sky-deep disabled:opacity-50"
              disabled={creating}
              onClick={handleHoldCheck}
              type="button"
            >
              {creating ? "Checking" : "Check this order"}
            </button>
          </div>
        )}
        {retry !== null && (
          <button
            className="mt-4 h-12 w-full rounded-xl bg-ink text-sm font-medium text-paper transition-colors hover:bg-ink-deep disabled:opacity-50"
            disabled={creating}
            onClick={handleRetry}
            type="button"
          >
            {creating ? "Retrying" : "Retry same request"}
          </button>
        )}
        {error !== null && (
          <p className="mt-4 rounded-xl bg-sun-tint px-4 py-3 text-sm text-sun-deep" role="alert">
            {error}
            {requestId !== null && (
              <>
                {" "}
                <span className="underline underline-offset-2">request id</span>{" "}
                <span className="font-mono text-xs">{requestId}</span>; keep it
                if you contact support.
              </>
            )}
          </p>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold">Order</h2>
        <div className="mt-4">
          {order === null ? (
            <p className="rounded-[20px] border border-line bg-white px-5 py-6 text-sm leading-6 text-ink-3">
              No order yet in this session. Create one and its checkout,
              quote, and status timeline appear here.
            </p>
          ) : (
            <OrderDetail
              apiKey={apiKey}
              key={order.id}
              onPollError={handlePollError}
              order={order}
            />
          )}
        </div>
      </section>

      <div className="mt-12 border-t border-line pt-8 lg:col-span-2">
        <OrderHistory
          apiKey={apiKey}
          onOpenOrder={setOrder}
          refreshKey={historyRefreshKey}
        />
      </div>
    </div>
  );
}

/** Per-code guidance for POST /v1/onramps failures, per the response matrix. */
function explainCreateError(error: ApiError): string {
  switch (error.code) {
    case "IDEMPOTENCY_KEY_REUSED":
      return "This request was already sent with different values. Start a fresh order below.";
    case "INSUFFICIENT_LIQUIDITY":
      return "Testnet inventory is temporarily low. Try again later.";
    case "AMOUNT_OUT_OF_RANGE":
      return "The amount is outside the supported range. Typical bounds are 10.000 to 10.000.000 idr.";
    case "INVALID_STELLAR_ACCOUNT":
      return "The destination is not a valid Stellar testnet address.";
    case "QUOTE_UNAVAILABLE":
    case "EXTERNAL_SERVICE_UNAVAILABLE":
      return `${error.message} This is usually temporary; retry in a moment.`;
    default:
      return error.code !== null ? `${error.code}: ${error.message}` : error.message;
  }
}
