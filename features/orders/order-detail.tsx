"use client";

import { useEffect, useState } from "react";
import { formatIdr } from "@/lib/format-money";
import type { Order } from "@/lib/api/types";
import { getOrder } from "@/lib/api/orders";
import { isActiveStatus, statusStyle } from "./status";
import { PaymentPanel } from "./payment-panel";

const POLL_INTERVAL_MS = 4000;

function secondsRemaining(expiresAt: string): number {
  const expiry = new Date(expiresAt).getTime();
  if (Number.isNaN(expiry)) return 0;
  return Math.max(0, Math.floor((expiry - Date.now()) / 1000));
}

type OrderDetailProps = {
  order: Order;
  apiKey: string;
  onPollError: (message: string) => void;
};

/**
 * The order page as a three-step checkout story, in the Xendit payment-page
 * spirit: what you buy (1), pay (2), and what happens after (3).
 */
export function OrderDetail({ order: initialOrder, apiKey, onPollError }: OrderDetailProps) {
  const [order, setOrder] = useState(initialOrder);
  const [remaining, setRemaining] = useState(() => secondsRemaining(initialOrder.quote.expires_at));

  // Poll while the order is in an active state; stop on anything terminal.
  useEffect(() => {
    if (!isActiveStatus(initialOrder.status)) return;
    const timer = setInterval(async () => {
      try {
        const fresh = await getOrder(initialOrder.id, apiKey);
        setOrder(fresh);
        setRemaining(secondsRemaining(fresh.quote.expires_at));
        onPollError("");
      } catch {
        // A missed poll is not an error state; the next tick retries.
        onPollError("Last poll failed. Retrying.");
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [initialOrder.id, initialOrder.status, apiKey, onPollError]);

  const style = statusStyle(order.status);
  const settled =
    order.status === "completed" ||
    order.status === "expired" ||
    order.status === "payment_failed" ||
    order.status === "stellar_failed";

  return (
    <div className="flex flex-col gap-6">
      {/* Step 1 · what this order is */}
      <section aria-label="Order summary" className="rounded-xl border border-line bg-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-xs text-ink-3">step 1 of 3 · your order</p>
            <p className="mt-1 text-lg font-semibold tracking-tight">
              Buy {order.asset.amount} XLM for {formatIdr(order.fiat.amount_minor)} idr
            </p>
          </div>
          <span className={`rounded-full px-3 py-1 font-mono text-xs ${style.pill}`}>
            {order.status}
          </span>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-line pt-4 font-mono text-sm tnum sm:grid-cols-4">
          <div>
            <dt className="text-xs text-ink-3">you pay</dt>
            <dd>{formatIdr(order.fiat.amount_minor)} idr</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-3">you receive</dt>
            <dd>{order.asset.amount} xlm</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-3">rate</dt>
            <dd>{order.quote.adjusted_rate}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-3">spread</dt>
            <dd>{order.quote.spread_bps} bps</dd>
          </div>
        </dl>
        {settled && (
          <p className="mt-4 border-t border-line pt-3 text-sm leading-6 text-ink-2">{style.note}</p>
        )}
      </section>

      {/* Step 2 · pay (only while the checkout is alive) */}
      {(order.status === "created" || order.status === "payment_pending") && (
        <section
          aria-label="Payment"
          className="rounded-xl border border-line bg-paper-recess p-5"
        >
          <p className="font-mono text-xs text-ink-3">step 2 of 3 · payment</p>
          <div className="mt-4 rounded-lg bg-surface p-5 shadow-card">
            <PaymentPanelHeaderNote status={order.status} />
            <div className="mt-4">
              <PaymentPanel order={order} remainingSeconds={remaining} />
            </div>
          </div>
        </section>
      )}

      {/* Step 3 · settlement */}
      <section aria-label="Settlement" className="rounded-xl border border-line bg-surface p-5">
        <p className="font-mono text-xs text-ink-3">step 3 of 3 · settlement on stellar testnet</p>

        {order.status === "stellar_processing" && (
          <p className="mt-3 flex items-center gap-2 text-sm leading-6 text-ink-2" role="status">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orchid-deep opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-orchid-deep" />
            </span>
            Sending your XLM. This is usually brief.
          </p>
        )}
        {order.status !== "stellar_processing" && (
          <p className="mt-3 text-sm leading-6 text-ink-2">{style.note}</p>
        )}

        {order.status === "completed" && order.stellar_transaction_hash !== undefined && (
          <a
            className="card-rise mt-4 inline-block break-all rounded-lg border border-gold/40 bg-sun-tint px-4 py-3 text-sm font-medium text-brass-text hover:border-gold"
            href={`https://stellar.expert/lumen/testnet/tx/${order.stellar_transaction_hash}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            View the transfer on the testnet explorer
          </a>
        )}

        {order.status === "stellar_failed" && (
          <p className="mt-4 rounded-lg bg-sun-tint px-4 py-3 text-sm leading-6 text-sun-deep" role="alert">
            Your payment arrived and will not be lost. Keep the order id{" "}
            <span className="font-mono text-xs">{order.id}</span> for support; do not
            pay again.
          </p>
        )}
      </section>

      <p className="font-mono text-xs leading-5 text-ink-3">
        order {order.id} · sandbox environment · stellar testnet network · created{" "}
        {order.created_at}
      </p>
    </div>
  );
}

function PaymentPanelHeaderNote({ status }: { status: Order["status"] }): React.ReactElement {
  if (status === "created") {
    return (
      <p className="text-sm leading-6 text-ink-2" role="status">
        Preparing your checkout...
      </p>
    );
  }
  return <></>;
}
