"use client";

import { useEffect, useState } from "react";
import { formatIdr } from "@/lib/format-money";
import type { Order } from "@/lib/api/types";
import { getOrder } from "@/lib/api/orders";
import { isActiveStatus, statusStyle } from "./status";
import { PaymentPanel } from "./payment-panel";
import { OfframpPanel } from "./offramp-panel";
import { RouteTimeline } from "./route-timeline";
import { routeStatus } from "./route-status";

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
    if (!isActiveStatus(order.status)) return;
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
  }, [initialOrder.id, order.status, apiKey, onPollError]);

  const style = statusStyle(order.status);
  const route = routeStatus({ direction: order.direction, status: order.status });
  const isBuy = order.direction === "onramp";

  return (
    <div className="flex flex-col gap-6">
      <section aria-label="Order summary" className="rounded-[28px] border border-line bg-surface p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold tracking-[0.1em] text-ink-3">YOUR ROUTE</p>
            <p className="mt-2 text-2xl font-bold tracking-[-0.04em]">{isBuy ? "Buy XLM" : "Sell XLM"}</p>
            <p className="mt-1 text-sm leading-6 text-ink-2">
              {isBuy
                ? `${formatIdr(order.fiat.amount_minor)} IDR to ${order.asset.amount} XLM`
                : `${order.asset.amount} XLM to ${formatIdr(order.fiat.amount_minor)} IDR`}
            </p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${style.pill}`}>
            {presentStatus(order.status)}
          </span>
        </div>
        <RouteTimeline view={route} />
        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-5 text-sm tnum sm:grid-cols-4">
          <div>
            <dt className="text-xs font-semibold text-ink-3">{isBuy ? "You pay" : "You receive"}</dt>
            <dd className="mt-1 font-semibold">{formatIdr(order.fiat.amount_minor)} IDR</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-ink-3">{isBuy ? "You receive" : "You send"}</dt>
            <dd className="mt-1 font-semibold">{order.asset.amount} XLM</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-ink-3">Locked rate</dt>
            <dd className="mt-1 font-semibold">{order.quote.adjusted_rate} IDR</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-ink-3">Spread</dt>
            <dd className="mt-1 font-semibold">{order.quote.spread_bps} bps</dd>
          </div>
        </dl>
        <p className="mt-5 border-t border-line pt-4 text-sm leading-6 text-ink-2">{route.detail}</p>
      </section>

      {isBuy && (order.status === "created" || order.status === "payment_pending") && (
        <section aria-label="Payment" className="rounded-[28px] border border-line bg-paper-recess p-5 sm:p-6">
          <p className="text-xs font-bold tracking-[0.1em] text-ink-3">PAY IN RUPIAH</p>
          <div className="mt-4">
            <PaymentPanelHeaderNote status={order.status} />
            <PaymentPanel order={order} remainingSeconds={remaining} />
          </div>
        </section>
      )}

      {!isBuy && <OfframpPanel order={order} />}

      <section aria-label="Settlement" className="rounded-[28px] border border-line bg-surface p-5 sm:p-6">
        <p className="text-xs font-bold tracking-[0.1em] text-ink-3">WHAT HAPPENS NEXT</p>
        <div className="mt-3 flex items-start gap-3" role="status">
          {isActiveStatus(order.status) && <span aria-hidden className="mt-2 h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-lilac-deep" />}
          <div>
            <h3 className="text-xl font-bold tracking-[-0.03em]">{route.title}</h3>
            <p className="mt-1 text-sm leading-6 text-ink-2">{route.detail}</p>
          </div>
        </div>

        {order.status === "completed" && order.stellar_transaction_hash !== undefined && (
          <a
            className="card-rise mt-5 inline-flex rounded-xl border border-gold/40 bg-sun-tint px-4 py-3 text-sm font-bold text-brass-text hover:border-gold"
            href={`https://stellar.expert/lumen/testnet/tx/${order.stellar_transaction_hash}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            View the transfer on the testnet explorer
          </a>
        )}

        {order.deposit_transaction_hash !== undefined && (
          <a
            className="card-rise mt-5 inline-flex rounded-xl border border-aqua-deep/25 bg-aqua-tint px-4 py-3 text-sm font-bold text-aqua-deep hover:border-aqua-deep"
            href={`https://stellar.expert/lumen/testnet/tx/${order.deposit_transaction_hash}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            View the deposit on the testnet explorer
          </a>
        )}

        {order.status === "stellar_failed" && (
          <p className="mt-4 rounded-xl bg-sun-tint px-4 py-3 text-sm leading-6 text-sun-deep" role="alert">
            Your payment arrived and will not be lost. Keep order {order.id} for support. Do not pay again.
          </p>
        )}
      </section>

      <p className="text-xs leading-5 text-ink-3">Order {order.id} <span aria-hidden className="mx-2 text-line-strong">|</span> Sandbox environment <span aria-hidden className="mx-2 text-line-strong">|</span> Stellar Testnet <span aria-hidden className="mx-2 text-line-strong">|</span> Created {order.created_at}</p>
    </div>
  );
}

function PaymentPanelHeaderNote({ status }: { status: Order["status"] }): React.ReactElement | null {
  if (status === "created") {
    return (
      <p className="text-sm leading-6 text-ink-2" role="status">
        Preparing your checkout...
      </p>
    );
  }
  return null;
}

function presentStatus(status: Order["status"]): string {
  return status.replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
}
