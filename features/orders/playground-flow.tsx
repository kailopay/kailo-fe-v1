"use client";

import { useEffect, useCallback, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { createOfframp, createOrder, getOrder, type CreateOfframpInput, type CreateOrderInput } from "@/lib/api/orders";
import type { Order, OrderDirection } from "@/lib/api/types";
import { OrderCreateForm, type CreateOrderFormValue } from "./order-create-form";
import { OfframpCreateForm, type CreateOfframpFormValue } from "./offramp-create-form";
import { OrderDetail } from "./order-detail";
import { OrderHistory } from "./order-history";

const KEY_PATTERN = /^pk_test_/;
type CreateRequest =
  | { direction: "onramp"; input: CreateOrderInput }
  | { direction: "offramp"; input: CreateOfframpInput };

export function PlaygroundFlow({ initialOrderId }: { initialOrderId?: string }) {
  const [apiKey, setApiKey] = useState("");
  const [keyAccepted, setKeyAccepted] = useState(false);
  const [direction, setDirection] = useState<OrderDirection>("onramp");
  const [creating, setCreating] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [retry, setRetry] = useState<CreateRequest | null>(null);
  const [hold, setHold] = useState<CreateRequest | null>(null);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  // Deep link (?order=<id>): fetch that order once the key is accepted.
  useEffect(() => {
    if (!keyAccepted || initialOrderId === undefined) return;
    let cancelled = false;
    getOrder(initialOrderId, apiKey)
      .then((found) => {
        if (cancelled) return;
        setOrder(found);
        setDirection(found.direction);
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

  async function submitRequest(request: CreateRequest): Promise<void> {
    setCreating(true);
    setError(null);
    setRequestId(null);
    try {
      const created = request.direction === "onramp"
        ? await createOrder(request.input)
        : await createOfframp(request.input);
      setOrder(created);
      setDirection(created.direction);
      setRetry(null);
      setHold(null);
      setHistoryRefreshKey((current) => current + 1);
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 202) {
        // CHECKOUT_PENDING_RECONCILIATION: the order exists and is held
        // while the provider outcome settles. Never re-create it; the same
        // key+body replay returns the order once reconciliation finishes.
        setHold(request);
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
        setRetry(request);
        setHold(null);
        setError("The request may or may not have reached the server. Retry safely with the same idempotency key.");
      }
    } finally {
      setCreating(false);
    }
  }

  function handleOnrampCreate(value: CreateOrderFormValue): void {
    const input: CreateOrderInput = {
      ...value,
      apiKey,
      idempotencyKey: crypto.randomUUID(),
    };
    void submitRequest({ direction: "onramp", input });
  }

  function handleOfframpCreate(value: CreateOfframpFormValue): void {
    const input: CreateOfframpInput = {
      ...value,
      apiKey,
      idempotencyKey: crypto.randomUUID(),
    };
    void submitRequest({ direction: "offramp", input });
  }

  function handleRetry(): void {
    if (retry === null) return;
    void submitRequest(retry);
  }

  function handleHoldCheck(): void {
    if (hold === null) return;
    void submitRequest(hold);
  }

  const handlePollError = useCallback((message: string) => {
    setError((current) => (current === message ? current : message));
  }, []);

  if (!keyAccepted) {
    return (
      <div className="max-w-xl">
        <form className="flex flex-col gap-4" onSubmit={acceptKey}>
          <label className="kp-field-label" htmlFor="api-key">
            Your test API key
          </label>
          <input
            autoComplete="off"
            className="kp-input"
            id="api-key"
            onChange={(event) => setApiKey(event.target.value)}
            placeholder="pk_test_"
            type="password"
            value={apiKey}
          />
          <p className="text-xs leading-5 text-ink-3">
            The key stays in this page&apos;s memory only. It is never sent
            anywhere except the order API, is wiped when you leave or sign
            out, and is never logged.
          </p>
          {error !== null && (
            <p className="kp-notice" data-tone="warning" role="alert">
              {error}
            </p>
          )}
          <button
            className="kp-primary-button w-full"
            type="submit"
          >
            Use this key
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="kp-dev-playground-grid max-w-4xl">
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="kp-dev-section-title">New route</h2>
          <div aria-label="Route direction" className="kp-dev-tabs" role="group">
            {(
              [
                { value: "onramp", label: "Buy XLM" },
                { value: "offramp", label: "Sell XLM" },
              ] as const
            ).map((option) => (
              <button
                aria-pressed={direction === option.value}
                className="kp-dev-tab"
                data-active={direction === option.value}
                data-tone={option.value === "onramp" ? "buy" : "sell"}
                key={option.value}
                onClick={() => {
                  setDirection(option.value);
                  setError(null);
                }}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4">
          {direction === "onramp" ? (
            <OrderCreateForm busy={creating} onSubmit={handleOnrampCreate} />
          ) : (
            <OfframpCreateForm busy={creating} onSubmit={handleOfframpCreate} />
          )}
        </div>
        {hold !== null && (
          <div className="kp-notice mt-4" data-tone="success" role="status">
            <p className="text-sm font-bold text-ink">
              {hold.direction === "onramp" ? "Processing the checkout with the payment provider." : "Processing the sell route."}
            </p>
            <p className="mt-1 text-sm leading-6 text-ink-2">
              Your order exists and its outcome is being reconciled. Do not
              create it again. Check back with the same request.
            </p>
            <button
              className="kp-secondary-button mt-3"
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
            className="kp-primary-button mt-4 w-full"
            disabled={creating}
            onClick={handleRetry}
            type="button"
          >
            {creating ? "Retrying" : "Retry same request"}
          </button>
        )}
        {error !== null && (
          <p className="kp-notice mt-4" data-tone="warning" role="alert">
            {error}
            {requestId !== null && (
              <>
                {" "}
                <span className="underline underline-offset-2">request id</span>{" "}
                <span className="break-all text-xs">{requestId}</span>; keep it
                if you contact support.
              </>
            )}
          </p>
        )}
      </section>

      <section>
        <h2 className="kp-dev-section-title">Order</h2>
        <div className="mt-4">
          {order === null ? (
            <p className="kp-dev-empty">
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
    case "INVALID_ASSET_AMOUNT":
    case "ASSET_AMOUNT_OUT_OF_RANGE":
      return "The XLM amount is outside the supported range.";
    case "INVALID_DESTINATION_TOKEN":
      return "The sandbox payout reference is not valid.";
    case "QUOTE_UNAVAILABLE":
    case "EXTERNAL_SERVICE_UNAVAILABLE":
      return `${error.message} This is usually temporary; retry in a moment.`;
    default:
      return error.code !== null ? `${error.code}: ${error.message}` : error.message;
  }
}
