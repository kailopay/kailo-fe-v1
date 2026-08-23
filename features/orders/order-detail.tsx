"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { formatIdr } from "@/lib/format-money";
import type { Order } from "@/lib/api/types";
import { getOrder } from "@/lib/api/orders";
import { isActiveStatus, statusStyle } from "./status";

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

export function OrderDetail({ order: initialOrder, apiKey, onPollError }: OrderDetailProps) {
  const [order, setOrder] = useState(initialOrder);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
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

  // Render the QRIS string as a QR code. A given order's presentation never
  // changes type, and the parent remounts this component per order id.
  useEffect(() => {
    if (initialOrder.checkout?.presentation_type !== "QR_STRING") return;
    let cancelled = false;
    QRCode.toDataURL(initialOrder.checkout.presentation_value, { width: 240, margin: 1 })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        // Leave the placeholder copy; the raw string still exists below.
      });
    return () => {
      cancelled = true;
    };
  }, [initialOrder.checkout?.presentation_type, initialOrder.checkout?.presentation_value]);

  // Quote-window countdown, one tick per second.
  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining(secondsRemaining(order.quote.expires_at));
    }, 1000);
    return () => clearInterval(timer);
  }, [order.quote.expires_at]);

  const style = statusStyle(order.status);
  const minutes = String(Math.floor(remaining / 60)).padStart(2, "0");
  const seconds = String(remaining % 60).padStart(2, "0");

  async function copyVa(): Promise<void> {
    if (order.checkout === null) return;
    try {
      await navigator.clipboard.writeText(order.checkout.presentation_value);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className={`rounded-full px-3 py-1 font-mono text-xs ${style.pill}`}>
          {order.status}
        </span>
        <p className="font-mono text-xs text-ink-3">
          {isActiveStatus(order.status) && order.status !== "stellar_processing"
            ? `quote window ${minutes}:${seconds}`
            : `updated ${order.updated_at}`}
        </p>
      </div>
      <p className="text-sm leading-6 text-ink-2">{style.note}</p>

      {order.checkout !== null && isActiveStatus(order.status) && (
        <div className="rounded-[20px] border border-line bg-white p-6">
          {order.checkout.presentation_type === "QR_STRING" ? (
            qrDataUrl !== null ? (
              <div className="flex flex-col items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="QRIS code" className="h-60 w-60" src={qrDataUrl} />
                <p className="text-sm text-ink-3">
                  Scan with any QRIS app. Sandbox: no real money moves.
                </p>
              </div>
            ) : (
              <p className="text-sm text-ink-3">Rendering the QR code…</p>
            )
          ) : (
            <div className="flex flex-col items-center gap-3">
              <p className="font-mono text-2xl tnum tracking-wide text-ink">
                {order.checkout.presentation_value}
              </p>
              <button
                className="rounded-lg border border-line-strong px-4 py-2 text-sm font-medium text-ink-2 transition-colors hover:border-ink hover:text-ink"
                onClick={() => void copyVa()}
                type="button"
              >
                {copied ? "Copied" : "Copy virtual account number"}
              </button>
            </div>
          )}
        </div>
      )}

      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-[20px] border border-line bg-white px-5 py-4 font-mono text-sm tnum sm:grid-cols-4">
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

      {order.status === "completed" && order.stellar_transaction_hash !== undefined && (
        <a
          className="break-all rounded-[20px] border border-gold/40 bg-sun-tint px-5 py-4 text-sm font-medium text-sun-deep transition-colors hover:bg-sun-tint/70"
          href={`https://stellar.expert/lumen/testnet/tx/${order.stellar_transaction_hash}`}
          rel="noopener noreferrer"
          target="_blank"
        >
          View the transfer on the testnet explorer
        </a>
      )}

      {order.status === "stellar_failed" && (
        <p className="rounded-[20px] border border-line bg-white px-5 py-4 text-sm leading-6 text-ink-2">
          Keep the order id <span className="font-mono text-xs">{order.id}</span> for support.
          Every response also carries a request id.
        </p>
      )}
    </div>
  );
}
