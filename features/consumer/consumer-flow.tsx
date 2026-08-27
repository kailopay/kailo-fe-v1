"use client";

import Link from "next/link";
import { useState } from "react";
import { normalizeXlmAmount } from "@/lib/format-asset";
import { formatIdrInput, parseIdrInput } from "@/lib/format-money";
import { AmountField } from "./amount-field";
import { LiveRateStrip } from "./live-rate-strip";
import { RouteVisual } from "./route-visual";
import type { ConsumerDirection } from "./rate";

const STELLAR_ACCOUNT_PATTERN = /^G[A-Z2-7]{55}$/;

type ConsumerFlowProps = {
  initialDirection: ConsumerDirection;
  displayName: string;
};

const toneClasses = {
  buy: {
    panel: "bg-coral-tint",
    badge: "bg-coral/35 text-coral-deep",
    selected: "bg-coral/30 text-coral-deep ring-1 ring-coral/50",
    hover: "hover:bg-coral-tint hover:text-coral-deep",
  },
  sell: {
    panel: "bg-aqua-tint",
    badge: "bg-aqua/35 text-aqua-deep",
    selected: "bg-aqua/30 text-aqua-deep ring-1 ring-aqua/50",
    hover: "hover:bg-aqua-tint hover:text-aqua-deep",
  },
} as const;

const steps = [
  { number: "01", title: "Choose a side", body: "Start with the currency you have." },
  { number: "02", title: "Check the route", body: "See the destination before you continue." },
  { number: "03", title: "Finish in sandbox", body: "The live rate locks at checkout." },
] as const;

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

  const isBuy = direction === "buy";
  const tone = toneClasses[direction];

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
    if (isBuy) {
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
    } else if (normalizeXlmAmount(xlmAmount) === null) {
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
    <div className="mx-auto w-full max-w-5xl px-5 py-9 sm:px-8 lg:py-12">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div className="max-w-2xl">
          <h1 className="text-[clamp(2.6rem,7vw,5rem)] font-bold leading-[0.96] tracking-[-0.075em] text-ink">Money, moving simply.</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-ink-2 sm:text-lg">Buy XLM with rupiah or turn XLM into a sandbox payout in a few clear steps.</p>
        </div>
        <p className="text-sm font-semibold text-ink-3">Welcome back, {displayName}</p>
      </header>

      <section aria-labelledby="consumer-route-title" className={`mt-9 overflow-hidden rounded-[32px] ${tone.panel} shadow-[0_24px_70px_rgba(15,30,56,0.1)]`}>
        <div className="px-5 pb-5 pt-6 sm:px-8 sm:pb-7 sm:pt-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-[-0.06em] text-ink sm:text-4xl" id="consumer-route-title">{isBuy ? "Rupiah in, XLM out" : "XLM in, rupiah out"}</h2>
              <p className="mt-2 max-w-lg text-sm leading-6 text-ink-2">{isBuy ? "A simple path from your IDR balance to Stellar testnet." : "A clear path from your XLM balance to a simulated IDR payout."}</p>
            </div>
            <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${tone.badge}`}>{isBuy ? "Buy XLM" : "Sell XLM"}</span>
          </div>
          <div className="mt-7">
            <RouteVisual direction={direction} />
          </div>
        </div>

        <div className="bg-white px-5 py-5 sm:px-8 sm:py-8">
          <div aria-label="Transaction direction" className="flex rounded-[18px] bg-paper-recess p-1.5">
            <button
              aria-pressed={isBuy}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold transition-colors ${isBuy ? tone.selected : `text-ink-2 ${tone.hover}`}`}
              onClick={() => selectDirection("buy")}
              type="button"
            >
              Buy XLM
            </button>
            <button
              aria-pressed={!isBuy}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold transition-colors ${!isBuy ? tone.selected : `text-ink-2 ${tone.hover}`}`}
              onClick={() => selectDirection("sell")}
              type="button"
            >
              Sell XLM
            </button>
          </div>

          <form className="mt-6" onSubmit={handleSubmit}>
            <div className="grid gap-3 md:grid-cols-2">
              {isBuy ? (
                <AmountField currency="IDR" id="consumer-idr-amount" label="You pay" onChange={handleIdrChange} placeholder="500.000" tone="coral" value={idrAmount} />
              ) : (
                <AmountField currency="XLM" id="consumer-xlm-amount" label="You send" onChange={(value) => { setXlmAmount(value); setError(null); }} placeholder="25.0000000" tone="aqua" value={xlmAmount} />
              )}

              <div className="rounded-[22px] bg-paper-recess/75 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-ink-2">You receive</span>
                  <span className="rounded-xl bg-white/75 px-3 py-2 text-sm font-bold text-ink-2">{isBuy ? "XLM" : "IDR"}</span>
                </div>
                <p className="mt-4 text-2xl font-bold tracking-[-0.05em] text-ink sm:text-3xl">{isBuy ? "Calculated at checkout" : "Calculated after deposit"}</p>
                <p className="mt-2 text-xs leading-5 text-ink-3">{isBuy ? "The exact XLM amount follows the locked rate." : "The sandbox payout follows the order confirmation."}</p>
              </div>
            </div>

            <div className="mt-5">
              <LiveRateStrip direction={direction} quote={null} />
            </div>

            {isBuy ? (
              <div className="mt-7 border-t border-line/75 pt-6">
                <h3 className="text-xl font-bold tracking-[-0.04em] text-ink">Where should your XLM go?</h3>
                <p className="mt-2 text-sm leading-6 text-ink-2">Use a Stellar testnet address you control.</p>

                <label className="mt-5 flex flex-col gap-2 text-sm font-semibold text-ink-2" htmlFor="consumer-stellar-destination">
                  Stellar destination
                  <input className="h-12 rounded-xl border border-line-strong bg-paper px-4 text-sm text-ink outline-none transition-colors focus:border-coral-deep" id="consumer-stellar-destination" onChange={(event) => { setStellarDestination(event.target.value); setError(null); }} placeholder="G... testnet address" value={stellarDestination} />
                </label>
                <p className="mt-2 text-xs leading-5 text-ink-3">The destination is checked before the route can continue.</p>

                <fieldset className="mt-5">
                  <legend className="text-sm font-semibold text-ink-2">Choose how you pay</legend>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <button aria-pressed={paymentMethod === "qris"} className={`rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${paymentMethod === "qris" ? "bg-coral-tint text-coral-deep ring-1 ring-coral/50" : `bg-paper-recess text-ink-2 ${tone.hover}`}`} onClick={() => setPaymentMethod("qris")} type="button">QRIS</button>
                    <button aria-pressed={paymentMethod === "bri_va"} className={`rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${paymentMethod === "bri_va" ? "bg-coral-tint text-coral-deep ring-1 ring-coral/50" : `bg-paper-recess text-ink-2 ${tone.hover}`}`} onClick={() => setPaymentMethod("bri_va")} type="button">BRI virtual account</button>
                  </div>
                </fieldset>

                <details className="mt-5 rounded-xl bg-paper-recess/70 px-4 py-3">
                  <summary className="cursor-pointer text-sm font-semibold text-ink-2">Add a memo <span className="font-normal text-ink-3">Optional</span></summary>
                  <label className="mt-4 flex flex-col gap-2 text-sm font-semibold text-ink-2" htmlFor="consumer-memo">
                    Memo
                    <input className="h-12 rounded-xl border border-line-strong bg-white px-4 text-sm text-ink outline-none transition-colors focus:border-coral-deep" id="consumer-memo" maxLength={28} onChange={(event) => { setMemo(event.target.value); setError(null); }} value={memo} />
                  </label>
                </details>
              </div>
            ) : (
              <div className="mt-7 border-t border-line/75 pt-6">
                <h3 className="text-xl font-bold tracking-[-0.04em] text-ink">Where should the rupiah go?</h3>
                <p className="mt-2 text-sm leading-6 text-ink-2">Choose the sandbox payout destination for this test route.</p>

                <label className="mt-5 flex flex-col gap-2 text-sm font-semibold text-ink-2" htmlFor="consumer-payout-reference">
                  Sandbox payout reference
                  <input className="h-12 rounded-xl border border-line-strong bg-paper px-4 text-sm text-ink outline-none transition-colors focus:border-aqua-deep" id="consumer-payout-reference" onChange={(event) => { setSandboxPayoutReference(event.target.value); setError(null); }} placeholder="sandbox-bank-user-01" value={sandboxPayoutReference} />
                </label>
                <p className="mt-2 text-xs leading-5 text-ink-3">Week 2 uses this reference to simulate the bank destination.</p>

                <div className="mt-5 rounded-2xl bg-aqua-tint px-4 py-4">
                  <p className="text-sm font-bold text-aqua-deep">Sandbox payout simulation</p>
                  <p className="mt-1 text-sm leading-6 text-aqua-deep/80">No real XLM or IDR moves from this consumer preview.</p>
                </div>
              </div>
            )}

            {error !== null && <p className="mt-5 rounded-2xl bg-sun-tint px-4 py-3 text-sm leading-6 text-sun-deep" role="alert">{error}</p>}

            <button className="mt-6 h-12 w-full rounded-2xl bg-ink px-5 text-sm font-bold text-paper transition-colors hover:bg-ink-deep" type="submit">
              {reviewing ? "Route details ready" : `Review ${isBuy ? "buy" : "sell"} route`}
            </button>
          </form>

          {reviewing && (
            <div className="mt-5 grid gap-4 rounded-[24px] bg-lilac-tint p-5 sm:grid-cols-[1fr_auto] sm:items-center" role="status">
              <div>
                <h3 className="text-lg font-bold tracking-[-0.03em] text-lilac-deep">Your route is ready</h3>
                <p className="mt-1 text-sm leading-6 text-lilac-deep/80">Consumer order sessions are the next bridge. Developer Mode can create this same route through the live sandbox API today.</p>
              </div>
              <Link className="inline-flex h-11 items-center justify-center rounded-xl bg-ink px-4 text-sm font-bold text-paper hover:bg-ink-deep" href="/developer/playground">Open Developer Mode</Link>
            </div>
          )}
        </div>
      </section>

      <section aria-labelledby="consumer-steps-title" className="mt-11">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold tracking-[-0.05em] text-ink" id="consumer-steps-title">A route you can read at a glance</h2>
            <p className="mt-2 text-sm leading-6 text-ink-2">One corridor, with the important detail shown before the handoff.</p>
          </div>
          <span className="rounded-full bg-mango-tint px-3 py-1.5 text-xs font-bold text-mango-deep">IDR to XLM and back</span>
        </div>
        <ol className="mt-6 grid border-y border-line sm:grid-cols-3 sm:divide-x sm:divide-line">
          {steps.map((step) => (
            <li className="flex gap-4 py-5 sm:block sm:px-5 sm:first:pl-0 sm:last:pr-0" key={step.number}>
              <span className="tnum text-sm font-bold text-ink-3">{step.number}</span>
              <div>
                <h3 className="text-sm font-bold text-ink sm:mt-5">{step.title}</h3>
                <p className="mt-1 text-sm leading-6 text-ink-2">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
