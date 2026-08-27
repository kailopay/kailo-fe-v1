"use client";

import Link from "next/link";
import { useState } from "react";
import { formatIdrInput, parseIdrInput } from "@/lib/format-money";
import { SandboxBadges } from "@/components/sandbox-badges";
import { AmountField } from "./amount-field";
import { LiveRateStrip } from "./live-rate-strip";
import { RouteVisual } from "./route-visual";
import type { ConsumerDirection } from "./rate";

const STELLAR_ACCOUNT_PATTERN = /^G[A-Z2-7]{55}$/;

type ConsumerFlowProps = {
  initialDirection: ConsumerDirection;
  displayName: string;
};

export function ConsumerFlow({ initialDirection, displayName }: ConsumerFlowProps): React.ReactElement {
  const [direction, setDirection] = useState<ConsumerDirection>(initialDirection);
  const [idrAmount, setIdrAmount] = useState("");
  const [xlmAmount, setXlmAmount] = useState("");
  const [stellarDestination, setStellarDestination] = useState("");
  const [memo, setMemo] = useState("");
  const [sandboxPayoutReference, setSandboxPayoutReference] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"qris" | "bri_va">("qris");
  const [error, setError] = useState<string | null>(null);
  const [reviewing, setReviewing] = useState(false);

  const sourceAmount = direction === "buy" ? idrAmount || "0" : xlmAmount || "0";
  const destinationAmount = direction === "buy" ? "Quote secured next" : "Payout calculated next";

  function selectDirection(next: ConsumerDirection): void {
    setDirection(next);
    setError(null);
    setReviewing(false);
  }

  function handleIdrChange(value: string): void {
    setIdrAmount(formatIdrInput(value));
    setError(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (direction === "buy") {
      if (parseIdrInput(idrAmount) === null) {
        setError("Enter the amount of rupiah you want to spend.");
        return;
      }
      if (!STELLAR_ACCOUNT_PATTERN.test(stellarDestination.trim())) {
        setError("Enter a valid Stellar testnet address starting with G.");
        return;
      }
      if (memo.trim().length > 28) {
        setError("The memo must be 28 characters or fewer.");
        return;
      }
    } else if (!/^\d+(\.\d{1,7})?$/.test(xlmAmount.trim()) || xlmAmount.trim() === "0") {
      setError("Enter the amount of XLM you want to sell.");
      return;
    } else if (sandboxPayoutReference.trim().length === 0) {
      setError("Enter a sandbox payout reference.");
      return;
    }
    setError(null);
    setReviewing(true);
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 md:px-0 md:py-2">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-sm font-semibold text-ink-3">Welcome, {displayName}</p>
          <h1 className="mt-2 text-4xl font-bold tracking-[-0.06em] text-ink sm:text-5xl">What are you moving today?</h1>
          <p className="mt-3 max-w-xl text-base leading-7 text-ink-2">A clear route from rupiah to testnet XLM, or back again.</p>
        </div>
        <SandboxBadges />
      </div>

      <div className="mt-9 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-start">
        <section>
          <div className="flex rounded-2xl border border-line bg-white p-1.5" aria-label="Transaction direction">
            <button
              aria-pressed={direction === "buy"}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold transition-colors ${direction === "buy" ? "bg-coral text-ink" : "text-ink-2 hover:bg-coral-tint hover:text-coral-deep"}`}
              onClick={() => selectDirection("buy")}
              type="button"
            >
              Buy XLM
            </button>
            <button
              aria-pressed={direction === "sell"}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold transition-colors ${direction === "sell" ? "bg-aqua text-ink" : "text-ink-2 hover:bg-aqua-tint hover:text-aqua-deep"}`}
              onClick={() => selectDirection("sell")}
              type="button"
            >
              Sell XLM
            </button>
          </div>

          <div className="mt-5">
            <RouteVisual direction={direction} sourceAmount={sourceAmount} destinationAmount={destinationAmount} />
          </div>

          <div className="mt-5">
            <LiveRateStrip direction={direction} quote={null} />
          </div>
        </section>

        <section className="rounded-[28px] border border-line bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.12em] text-ink-3">YOUR DETAILS</p>
              <h2 className="mt-2 text-2xl font-bold tracking-[-0.04em]">Set your route</h2>
            </div>
            <span className="rounded-full bg-lilac-tint px-3 py-1 text-xs font-bold text-lilac-deep">Testnet</span>
          </div>

          <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
            {direction === "buy" ? (
              <>
                <AmountField currency="IDR" id="consumer-idr-amount" label="You pay" onChange={handleIdrChange} placeholder="500.000" value={idrAmount} />
                <fieldset>
                  <legend className="text-sm font-semibold text-ink-2">Payment method</legend>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button aria-pressed={paymentMethod === "qris"} className={`rounded-xl border px-3 py-3 text-sm font-semibold transition-colors ${paymentMethod === "qris" ? "border-coral bg-coral-tint text-coral-deep" : "border-line-strong text-ink-2 hover:border-coral"}`} onClick={() => setPaymentMethod("qris")} type="button">QRIS</button>
                    <button aria-pressed={paymentMethod === "bri_va"} className={`rounded-xl border px-3 py-3 text-sm font-semibold transition-colors ${paymentMethod === "bri_va" ? "border-coral bg-coral-tint text-coral-deep" : "border-line-strong text-ink-2 hover:border-coral"}`} onClick={() => setPaymentMethod("bri_va")} type="button">BRI virtual account</button>
                  </div>
                </fieldset>
                <label className="flex flex-col gap-2 text-sm font-semibold text-ink-2" htmlFor="consumer-stellar-destination">
                  Send XLM to
                  <input className="h-12 rounded-xl border border-line-strong bg-paper px-4 text-sm outline-none transition-colors focus:border-coral" id="consumer-stellar-destination" onChange={(event) => setStellarDestination(event.target.value)} placeholder="G... testnet address" value={stellarDestination} />
                </label>
                <label className="flex flex-col gap-2 text-sm font-semibold text-ink-2" htmlFor="consumer-memo">
                  Memo <span className="font-normal text-ink-3">Optional</span>
                  <input className="h-12 rounded-xl border border-line-strong bg-paper px-4 text-sm outline-none transition-colors focus:border-coral" id="consumer-memo" maxLength={28} onChange={(event) => setMemo(event.target.value)} value={memo} />
                </label>
              </>
            ) : (
              <>
                <AmountField currency="XLM" id="consumer-xlm-amount" label="You send" onChange={setXlmAmount} placeholder="25.0000000" value={xlmAmount} />
                <label className="flex flex-col gap-2 text-sm font-semibold text-ink-2" htmlFor="consumer-payout-reference">
                  Receive IDR through
                  <input className="h-12 rounded-xl border border-line-strong bg-paper px-4 text-sm outline-none transition-colors focus:border-aqua" id="consumer-payout-reference" onChange={(event) => setSandboxPayoutReference(event.target.value)} placeholder="Sandbox payout reference" value={sandboxPayoutReference} />
                </label>
                <p className="rounded-xl bg-aqua-tint px-4 py-3 text-sm leading-6 text-aqua-deep">This Week 2 release simulates the bank payout. No real IDR moves.</p>
              </>
            )}

            {error !== null && <p className="rounded-xl bg-sun-tint px-4 py-3 text-sm leading-6 text-sun-deep" role="alert">{error}</p>}

            <button className={`mt-1 h-13 rounded-xl px-5 text-sm font-bold text-ink transition-colors ${direction === "buy" ? "bg-coral hover:bg-coral/85" : "bg-aqua hover:bg-aqua/85"}`} type="submit">
              {reviewing ? "Route details ready" : "Review route"}
            </button>
          </form>

          {reviewing && (
            <div className="mt-4 rounded-2xl border border-lilac/35 bg-lilac-tint p-4" role="status">
              <p className="text-sm font-bold text-lilac-deep">Your route is ready for a secured quote</p>
              <p className="mt-1 text-sm leading-6 text-lilac-deep/80">The current backend locks the quote when the order is created. Continue through the sandbox checkout to receive the live execution rate.</p>
              <Link className="mt-3 inline-flex h-10 items-center rounded-xl bg-ink px-4 text-sm font-bold text-paper hover:bg-ink-deep" href="/developer/playground">Continue to sandbox checkout</Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
