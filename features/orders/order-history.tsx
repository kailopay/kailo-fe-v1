"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { listOrders } from "@/lib/api/orders";
import type { Order } from "@/lib/api/types";
import { formatIdr } from "@/lib/format-money";
import { statusStyle } from "./status";
import { formatDate } from "@/features/developer/format-date";

type OrderHistoryProps = {
  apiKey: string;
  onOpenOrder: (order: Order) => void;
  /** Bump to reload after a new order is created. */
  refreshKey: number;
};

export function OrderHistory({ apiKey, onOpenOrder, refreshKey }: OrderHistoryProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [nextCursor, setNextCursor] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPage = useCallback(
    async (cursor: string, replace: boolean) => {
      setLoading(true);
      setError(null);
      try {
        const page = await listOrders(apiKey, { cursor: cursor === "" ? undefined : cursor });
        setOrders((current) => (replace ? page.orders : [...current, ...page.orders]));
        setNextCursor(page.nextCursor);
      } catch (caught) {
        setError(caught instanceof ApiError ? caught.message : "Could not reach the server.");
      } finally {
        setLoading(false);
      }
    },
    [apiKey],
  );

  useEffect(() => {
    // Load via a timer so no state is set synchronously inside the effect.
    const timer = setTimeout(() => void loadPage("", true), 0);
    return () => clearTimeout(timer);
  }, [loadPage, refreshKey]);

  return (
    <section className="max-w-4xl">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-semibold">Order history</h2>
        <p className="text-xs text-ink-3">Orders connected to this key</p>
      </div>

      {error !== null && (
        <p className="mt-4 rounded-xl bg-sun-tint px-4 py-3 text-sm text-sun-deep" role="alert">
          {error}
        </p>
      )}

      {orders.length === 0 && error === null ? (
        <p className="mt-4 rounded-[20px] border border-line bg-white px-5 py-6 text-sm leading-6 text-ink-3">
          {loading ? "Loading your orders." : "No orders for this key yet."}
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {orders.map((order) => {
            const style = statusStyle(order.status);
            return (
              <li key={order.id}>
                <button
                  className="flex w-full flex-wrap items-center justify-between gap-3 rounded-[20px] border border-line bg-white px-5 py-4 text-left transition-colors hover:border-ink"
                  onClick={() => onOpenOrder(order)}
                  type="button"
                >
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${style.pill}`}>
                      {historyStatusLabel(order.status)}
                    </span>
                    <span className="text-sm font-semibold tnum text-ink">
                      {order.direction === "onramp"
                        ? `${formatIdr(order.fiat.amount_minor)} IDR to ${order.asset.amount} XLM`
                        : `${order.asset.amount} XLM to ${formatIdr(order.fiat.amount_minor)} IDR`}
                    </span>
                  </div>
                  <span className="text-xs text-ink-3">
                    created {formatDate(order.created_at)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {nextCursor !== "" && (
        <button
          className="mt-4 h-11 rounded-xl border border-line-strong px-5 text-sm font-medium text-ink-2 transition-colors hover:border-ink hover:text-ink disabled:opacity-50"
          disabled={loading}
          onClick={() => void loadPage(nextCursor, false)}
          type="button"
        >
          {loading ? "Loading" : "Load more"}
        </button>
      )}
    </section>
  );
}

function historyStatusLabel(status: Order["status"]): string {
  return status.replaceAll("_", " ");
}
