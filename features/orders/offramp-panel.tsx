"use client";

import { useState } from "react";
import { formatIdr } from "@/lib/format-money";
import type { Order } from "@/lib/api/types";

type OfframpPanelProps = {
  order: Order;
};

export function OfframpPanel({ order }: OfframpPanelProps): React.ReactElement {
  const account = order.stellar_destination.account;
  const memo = order.stellar_destination.memo;

  return (
    <section className="kp-order-block" aria-label="Sell instructions">
      <p className="text-sm font-bold text-aqua-deep">Send your XLM</p>
      <h3 className="mt-2 text-xl font-bold tracking-[-0.03em] text-ink">Deposit to the sandbox route</h3>
      <p className="mt-2 text-sm leading-6 text-ink-2">Send the exact quoted amount before the route expires. The sandbox watches this address and memo.</p>
      {account.length === 0 ? (
        <p className="kp-notice mt-4" data-tone="warning" role="alert">
          The current backend did not return a deposit address for this order. Do not send XLM until the address is available.
        </p>
      ) : (
        <div className="mt-5 flex flex-col gap-3">
          <CopyValue label="Deposit address" value={account} />
          {memo !== null && <CopyValue label="Memo" value={memo} />}
        </div>
      )}
      {order.payout !== undefined && (
        <div className="mt-5 border-t border-aqua-deep/20 pt-4">
          <p className="text-sm font-bold text-ink">Sandbox payout</p>
          <p className="mt-1 text-sm leading-6 text-ink-2">{formatIdr(order.payout.amount_minor)} IDR recorded through {order.payout.method.replaceAll("_", " ")}.</p>
          <p className="mt-1 text-xs leading-5 text-ink-3">{order.payout.disclosure}</p>
        </div>
      )}
    </section>
  );
}

function CopyValue({ label, value }: { label: string; value: string }): React.ReactElement {
  const [copied, setCopied] = useState(false);

  async function copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="kp-order-value">
      <p className="text-xs font-semibold text-ink-2">{label}</p>
      <div className="mt-1 flex items-center gap-3">
        <p className="min-w-0 flex-1 break-all text-sm font-semibold text-ink">{value}</p>
        <button className="kp-secondary-button shrink-0 px-3 py-2 text-xs" onClick={() => void copy()} type="button">
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
