"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { formatIdr } from "@/lib/format-money";
import type { Order } from "@/lib/api/types";
import { Button } from "./button";

/**
 * The Xendit-style payment stage of an active order: channel header with the
 * amount and expiry countdown, the QR or virtual-account artifact, numbered
 * how-to-pay steps, and a live waiting state. Structure follows Xendit's
 * customer flow (docs.xendit.co: QRIS, BRI Virtual Account).
 */
export function PaymentPanel({
  order,
  remainingSeconds,
}: {
  order: Order;
  remainingSeconds: number;
}): React.ReactElement {
  const checkout = order.checkout;
  if (checkout === null || !isActivePaymentState(order.status)) {
    return <></>;
  }

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

      {checkout.presentation_type === "QR_STRING" ? (
        <QrisStage presentationValue={checkout.presentation_value} />
      ) : (
        <VaStage presentationValue={checkout.presentation_value} />
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

/** QRIS stage: the code, then Xendit's scan-and-confirm steps beside it. */
function QrisStage({ presentationValue }: { presentationValue: string }): React.ReactElement {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(presentationValue, { width: 232, margin: 1 })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [presentationValue]);

  async function copyRaw(): Promise<void> {
    try {
      await navigator.clipboard.writeText(presentationValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-start">
      <figure className="kp-order-value m-0 flex flex-col items-center gap-2">
        {qrDataUrl !== null ? (
          // eslint-disable-next-line @next/next/no-img-element -- data URL: next/image cannot optimize a generated blob
          <img alt="QRIS payment code" className="h-[232px] w-[232px]" src={qrDataUrl} />
        ) : (
          <div aria-hidden className="h-[232px] w-[232px] animate-pulse rounded-lg bg-surface-2" />
        )}
        <figcaption className="text-center">
          <span className="text-xs text-ink-3">
            QRIS, one code for any Indonesian e-wallet
          </span>
        </figcaption>
      </figure>

      <div className="min-w-0">
        <h3 className="text-sm font-semibold">How to pay</h3>
        <ol className="mt-3 flex flex-col gap-3">
          {[
            <>Open your mobile banking or e-wallet app and find <strong className="font-semibold text-ink">Scan QR Code</strong>.</>,
            <>Point your phone camera at the QR code.</>,
            <>
              Check the merchant reads <strong className="font-semibold text-ink">KailoPay Sandbox</strong>{" "}
              and the amount matches.
            </>,
            <>Confirm the payment in the app.</>,
          ].map((step, index) => (
            <li className="flex gap-3 text-sm leading-6 text-ink-2" key={index}>
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-coral-tint text-xs font-semibold text-coral-deep">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <Button className="mt-4" onClick={() => void copyRaw()}>
          {copied ? "Copied" : "Copy QR string"}
        </Button>
        <p className="mt-2 text-xs text-ink-3">
          Developer shortcut: paste the raw payload into a QR generator.
        </p>
      </div>
    </div>
  );
}

/** Virtual-account stage: the number first, then bank-channel steps. */
function VaStage({ presentationValue }: { presentationValue: string }): React.ReactElement {
  const [channel, setChannel] = useState<"mobile" | "atm">("mobile");

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-start">
      <div className="kp-order-value">
        <p className="text-xs font-medium text-ink-3">BRI virtual account number</p>
        <p className="mt-1 break-all text-2xl font-semibold tnum tracking-wide">
          {presentationValue}
        </p>
        <VaCopy value={presentationValue} />
        <ul className="mt-4 flex flex-col gap-1 border-t border-line pt-4 text-sm leading-6 text-ink-2">
          <li className="flex justify-between gap-4">
            <span>Amount</span>
            <span className="tnum font-medium text-ink">transfer the exact amount</span>
          </li>
          <li className="flex justify-between gap-4">
            <span>Bank</span>
            <span className="font-medium text-ink">Bank Rakyat Indonesia (BRIVA)</span>
          </li>
          <li className="flex justify-between gap-4">
            <span>Name</span>
            <span className="font-medium text-ink">KailoPay Sandbox</span>
          </li>
        </ul>
      </div>

      <div className="min-w-0">
        <h3 className="text-sm font-semibold">How to pay</h3>
        <div className="mt-3 flex gap-4 border-b border-line">
          {(
            [
              { id: "mobile", label: "Mobile banking" },
              { id: "atm", label: "ATM" },
            ] as const
          ).map((tab) => (
            <button
              aria-pressed={channel === tab.id}
              className="kp-dev-tab"
              data-active={channel === tab.id}
              key={tab.id}
              onClick={() => setChannel(tab.id)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
        <ol className="mt-3 flex flex-col gap-3">
          {(channel === "mobile"
            ? [
                <>Log in to BRI Mobile Banking.</>,
                <>
                  Select <strong className="font-semibold text-ink">Payment › BRIVA</strong>.
                </>,
                <>Enter the virtual account number above.</>,
                <>Check the amount, confirm, and enter your PIN.</>,
              ]
            : [
                <>Insert your card at a BRI ATM and enter your PIN.</>,
                <>
                  Choose <strong className="font-semibold text-ink">Other Menu › Payment › Other Payment › BRIVA</strong>.
                </>,
                <>Enter the virtual account number above.</>,
                <>Check the details, then press Yes.</>,
              ]
          ).map((step, index) => (
            <li className="flex gap-3 text-sm leading-6 text-ink-2" key={index}>
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-coral-tint text-xs font-semibold text-coral-deep">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function VaCopy({ value }: { value: string }): React.ReactElement {
  const [copied, setCopied] = useState(false);

  async function copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mt-3 flex items-center gap-2">
      <Button onClick={() => void copy()} variant="primary">
        {copied ? "Copied" : "Copy number"}
      </Button>
      <span className="text-xs text-ink-3">paste it into BRI mobile banking, internet banking, or an ATM</span>
    </div>
  );
}
