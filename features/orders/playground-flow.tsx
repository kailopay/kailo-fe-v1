"use client";

import { useCallback, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { createOrder, type CreateOrderInput } from "@/lib/api/orders";
import type { Order } from "@/lib/api/types";
import { OrderCreateForm, type CreateOrderFormValue } from "./order-create-form";
import { OrderDetail } from "./order-detail";

const KEY_PATTERN = /^pk_test_/;

export function PlaygroundFlow() {
  const [apiKey, setApiKey] = useState("");
  const [keyAccepted, setKeyAccepted] = useState(false);
  const [creating, setCreating] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState<{ input: CreateOrderInput } | null>(null);

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
    try {
      const created = await createOrder(input);
      setOrder(created);
      setRetry(null);
    } catch (caught) {
      if (caught instanceof ApiError) {
        setError(
          caught.code !== null
            ? `${caught.code}: ${caught.message}`
            : caught.message,
        );
        // A rejected request is a finished intent; the next submit gets a new key.
        setRetry(null);
      } else if (caught instanceof Error) {
        // The outcome is unknown (network). Reuse the SAME idempotency key
        // so a retry can only replay this intent, never double-create.
        setRetry({ input });
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
    </div>
  );
}
