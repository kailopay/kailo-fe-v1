"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { listOrders } from "@/lib/api/orders";
import type { Order } from "@/lib/api/types";
import { formatDate } from "@/features/developer/format-date";
import { formatIdr } from "@/lib/format-money";
import { consumerErrorMessage, shouldSendConsumerToLogin } from "./consumer-errors";
import { statusStyle } from "@/features/orders/status";

const ACTIVITY_LIMIT = 20;

export function ConsumerActivity(): React.ReactElement {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [nextCursor, setNextCursor] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);

  const loadPage = useCallback(async (cursor: string | undefined, replace: boolean, signal?: AbortSignal): Promise<void> => {
    setLoading(true);
    setError(null);
    setRequestId(null);
    try {
      const page = await listOrders(undefined, { cursor, limit: ACTIVITY_LIMIT, signal });
      if (signal?.aborted) return;
      setOrders((current) => (replace ? page.orders : [...current, ...page.orders]));
      setNextCursor(page.nextCursor);
    } catch (caught: unknown) {
      if (signal?.aborted) return;
      if (shouldSendConsumerToLogin(caught)) {
        router.push("/login");
        return;
      }
      setError(caught instanceof ApiError ? activityErrorMessage(caught) : "We could not load your activity. Try again shortly.");
      setRequestId(caught instanceof ApiError ? caught.requestId : null);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => void loadPage(undefined, true, controller.signal), 0);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [loadPage]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-coral-deep">Your sandbox ledger</p>
          <h2 className="mt-2 text-2xl font-bold tracking-[-0.04em]">Recent exchanges</h2>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold text-ink-3">
          <span>Sandbox</span>
          <span>Stellar Testnet</span>
        </div>
      </div>

      {error !== null && (
        <p className="kp-notice mt-6" data-tone="warning" role="alert">
          {error}
          {requestId !== null && <span className="ml-1">Keep request id <span className="break-all font-semibold">{requestId}</span> for support.</span>}
          <button className="kp-quiet-button ml-4" onClick={() => void loadPage(undefined, true)} type="button">Try again</button>
        </p>
      )}

      {orders.length === 0 && error === null ? (
        <section aria-live="polite" className="kp-order-block mt-8">
          <p className="text-sm font-bold text-coral-deep">{loading ? "Loading activity" : "A quiet starting point"}</p>
          <h3 className="mt-2 text-2xl font-bold tracking-[-0.04em]">{loading ? "Finding your exchanges" : "Your first exchange starts here"}</h3>
          <p className="mt-3 max-w-lg text-sm leading-7 text-ink-2">
            {loading ? "Your session activity will appear here in a moment." : "Create a sandbox buy and we will keep its rate, payment, and delivery status together."}
          </p>
          {!loading && <Link className="kp-primary-button mt-6" href="/buy">Start a buy exchange</Link>}
        </section>
      ) : (
        <ul className="mt-8 flex flex-col gap-3" aria-label="Consumer activity">
          {orders.map((order) => <ActivityRow key={order.id} order={order} />)}
        </ul>
      )}

      {nextCursor !== "" && (
        <button
          className="kp-secondary-button mt-6 disabled:opacity-50"
          disabled={loading}
          onClick={() => void loadPage(nextCursor, false)}
          type="button"
        >
          {loading ? "Loading" : "Load more"}
        </button>
      )}
    </div>
  );
}

function ActivityRow({ order }: { order: Order }): React.ReactElement {
  const style = statusStyle(order.status);
  const summary = order.direction === "onramp"
    ? `${formatIdr(order.fiat.amount_minor)} IDR to ${order.asset.amount} XLM`
    : `${order.asset.amount} XLM to ${formatIdr(order.fiat.amount_minor)} IDR`;

  return (
    <li>
      <Link className="kp-order-block block transition-transform hover:-translate-y-0.5" href={`/orders/${encodeURIComponent(order.id)}`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${style.pill}`}>
              {activityStatusLabel(order.status)}
            </span>
            <h3 className="mt-4 text-lg font-bold tracking-[-0.025em] text-ink">{summary}</h3>
            <p className="mt-2 text-sm text-ink-3">Created {formatDate(order.created_at)}</p>
          </div>
          <span className="kp-action-link">View exchange</span>
        </div>
      </Link>
    </li>
  );
}

function activityStatusLabel(status: Order["status"]): string {
  return status.replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
}

function activityErrorMessage(error: ApiError): string {
  if (error.status === 403) return "Activity is unavailable right now.";
  if (error.status === 404) return "Activity is unavailable right now.";
  return consumerErrorMessage(error);
}
