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
    <section className="rounded-2xl bg-aqua-tint p-5" aria-label="Sell instructions">
      <p className="text-xs font-bold tracking-[0.1em] text-aqua-deep">SEND YOUR XLM</p>
      <h3 className="mt-2 text-xl font-bold tracking-[-0.03em] text-ink">Deposit to the sandbox route</h3>
      <p className="mt-2 text-sm leading-6 text-aqua-deep">Send the exact quoted amount before the route expires. The sandbox watches this address and memo.</p>
      {account.length === 0 ? (
        <p className="mt-4 rounded-xl bg-sun-tint px-4 py-3 text-sm leading-6 text-sun-deep" role="alert">
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
          <p className="mt-1 text-sm leading-6 text-aqua-deep">{formatIdr(order.payout.amount_minor)} IDR recorded through {order.payout.method.replaceAll("_", " ")}.</p>
          <p className="mt-1 text-xs leading-5 text-aqua-deep">{order.payout.disclosure}</p>
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
    <div className="rounded-xl border border-aqua-deep/20 bg-white p-3">
      <p className="text-xs font-semibold text-ink-2">{label}</p>
      <div className="mt-1 flex items-center gap-3">
        <p className="min-w-0 flex-1 break-all text-sm font-semibold text-ink">{value}</p>
        <button className="shrink-0 rounded-lg border border-line-strong px-3 py-1.5 text-xs font-bold text-ink-2 hover:border-ink" onClick={() => void copy()} type="button">
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
