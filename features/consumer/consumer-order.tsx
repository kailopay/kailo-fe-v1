"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { getOrder } from "@/lib/api/orders";
import type { Order } from "@/lib/api/types";
import { OrderDetail } from "@/features/orders/order-detail";
import { isTerminalStatus } from "@/features/orders/status";
import { consumerErrorMessage, shouldSendConsumerToLogin } from "./consumer-errors";
import { clearConsumerPurchase } from "./purchase";

type ConsumerOrderViewProps = {
  orderId: string;
  notice?: string;
  requestId?: string | null;
  onStartNewPurchase?: () => void;
};

export function ConsumerOrderView({
  orderId,
  notice,
  requestId: initialRequestId = null,
  onStartNewPurchase,
}: ConsumerOrderViewProps): React.ReactElement {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(initialRequestId);
  const [pollMessage, setPollMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      void getOrder(orderId, undefined, { signal: controller.signal })
        .then((found) => {
          if (controller.signal.aborted) return;
          setOrder(found);
          setError(null);
          setLoading(false);
        })
        .catch((caught: unknown) => {
          if (controller.signal.aborted) return;
          if (shouldSendConsumerToLogin(caught)) {
            router.push("/login");
            return;
          }
          setError(caught instanceof ApiError ? consumerErrorMessage(caught) : "We could not load this order. Try again shortly.");
          setRequestId(caught instanceof ApiError ? caught.requestId : null);
          setLoading(false);
        });
    }, 0);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [orderId, router]);

  const handlePollError = useCallback((message: string): void => {
    setPollMessage(message);
  }, []);

  const handleOrderChange = useCallback((fresh: Order): void => {
    setOrder(fresh);
    setPollMessage("");
  }, []);

  const handleSessionExpired = useCallback((): void => {
    router.push("/login");
  }, [router]);

  function startNewPurchase(): void {
    clearConsumerPurchase(sessionStorage);
    if (onStartNewPurchase !== undefined) {
      onStartNewPurchase();
      return;
    }
    router.push("/buy");
  }

  if (loading) {
    return (
      <section aria-live="polite" className="kp-order-block">
        <p className="text-sm font-bold text-coral-deep">Finding your exchange</p>
        <p className="mt-2 text-sm leading-6 text-ink-2">Loading the latest order status.</p>
      </section>
    );
  }

  if (order === null) {
    return (
      <section aria-labelledby="consumer-order-error-title" className="kp-order-block">
        <p className="text-sm font-bold text-coral-deep">Order unavailable</p>
        <h2 className="mt-2 text-2xl font-bold tracking-[-0.04em]" id="consumer-order-error-title">
          We could not find that exchange
        </h2>
        <p className="mt-2 text-sm leading-6 text-ink-2">{error ?? "Try again shortly or open Activity to choose another order."}</p>
        {requestId !== null && <SupportRequestId requestId={requestId} />}
        <div className="mt-5 flex flex-wrap gap-3">
          <Link className="kp-primary-button" href="/activity">Open activity</Link>
          <button className="kp-secondary-button" onClick={startNewPurchase} type="button">Start a new purchase</button>
        </div>
      </section>
    );
  }

  const terminal = isTerminalStatus(order.status);
  return (
    <div className="flex flex-col gap-6">
      {notice !== undefined && (
        <p className="kp-notice" data-tone="success" role="status">
          {notice}
          {initialRequestId !== null && <span className="ml-1">We are checking order {order.id} for you.</span>}
        </p>
      )}
      <OrderDetail
        apiKey={undefined}
        onOrderChange={handleOrderChange}
        onPollError={handlePollError}
        onSessionExpired={handleSessionExpired}
        order={order}
      />
      {pollMessage !== "" && <p className="kp-notice" data-tone="warning" role="status">{pollMessage}</p>}
      {terminal && (
        <section aria-label="Next action" className="kp-order-block">
          <p className="text-sm font-bold text-coral-deep">Ready for another exchange?</p>
          <p className="mt-2 text-sm leading-6 text-ink-2">Start a fresh purchase when you want to use another amount or destination.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="kp-primary-button" onClick={startNewPurchase} type="button">Start a new purchase</button>
            <Link className="kp-secondary-button" href="/activity">View activity</Link>
          </div>
        </section>
      )}
    </div>
  );
}

function SupportRequestId({ requestId }: { requestId: string }): React.ReactElement {
  return (
    <p className="mt-4 text-xs leading-5 text-ink-3">
      Keep request id <span className="break-all font-semibold text-ink-2">{requestId}</span> if you contact support.
    </p>
  );
}
