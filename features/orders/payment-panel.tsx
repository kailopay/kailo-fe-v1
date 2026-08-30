"use client";

import { paymentLinkForCheckout } from "@/features/consumer/purchase";
import type { Order } from "@/lib/api/types";
import { formatIdr } from "@/lib/format-money";

export function PaymentPanel({
  order,
  remainingSeconds,
}: {
  order: Order;
  remainingSeconds: number;
}): React.ReactElement {
  const checkout = order.checkout;
  if (checkout === null || !isActivePaymentState(order.status)) return <></>;

  const paymentLink = paymentLinkForCheckout(checkout);
  const minutes = String(Math.floor(remainingSeconds / 60)).padStart(2, "0");
  const seconds = String(remainingSeconds % 60).padStart(2, "0");
  const urgent = remainingSeconds <= 60;

  return (
    <section aria-label="Payment instructions" className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-ink-3">Step 2 of 3: complete your payment</p>
          <p className="mt-1 text-2xl font-semibold tnum tracking-tight">
            {formatIdr(order.fiat.amount_minor)}{" "}
            <span className="text-base font-medium text-ink-2">idr</span>
          </p>
        </div>
        <p className={`kp-status-tag tnum ${urgent ? "text-mango-deep" : "text-ink-2"}`}>
          Expires in {minutes}:{seconds}
        </p>
      </header>

      {paymentLink === null ? (
        <p className="kp-notice" data-tone="warning" role="alert">
          The secure payment page is not available for this order. Do not pay
          through another page; keep the order for support.
        </p>
      ) : (
        <div className="kp-reveal">
          <p className="text-sm font-bold text-ink">Continue on Xendit&apos;s secure payment page</p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-ink-2">
            Xendit shows the available payment channels and confirms the exact
            rupiah amount. Come back here after payment to watch the transfer.
          </p>
          <a
            className="kp-primary-button mt-5"
            href={paymentLink}
            rel="noopener noreferrer"
            target="_blank"
          >
            Open Xendit payment page
          </a>
        </div>
      )}

      <p className="flex items-center gap-2 text-sm text-ink-2" role="status">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sea-deep opacity-50" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-sea-deep" />
        </span>
        Waiting for your payment. This page updates itself; keep it open.
      </p>
    </section>
  );
}

function isActivePaymentState(status: Order["status"]): boolean {
  return status === "created" || status === "payment_pending";
}
