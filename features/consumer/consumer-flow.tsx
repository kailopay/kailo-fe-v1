"use client";

import Link from "next/link";
import { useState } from "react";
import { normalizeXlmAmount } from "@/lib/format-asset";
import { formatIdrInput, parseIdrInput } from "@/lib/format-money";
import { AmountField } from "./amount-field";
import { exchangeCopy } from "./consumer-copy";
import { LiveRateStrip } from "./live-rate-strip";
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

  const isBuy = direction === "buy";
  const copy = exchangeCopy(direction);

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
    <div className="kp-consumer-page">
      <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 lg:py-12">
        <header className="kp-consumer-header">
          <div className="kp-consumer-header-copy">
            <h1 className="kp-page-heading kp-consumer-heading">{copy.title}</h1>
            <p className="kp-copy mt-3 text-sm">{copy.description} No real money moves in this sandbox.</p>
          </div>
          <p className="kp-consumer-greeting">Welcome back, {displayName}</p>
        </header>

        <div className="kp-consumer-layout">
          <section aria-labelledby="consumer-exchange-title" className="kp-consumer-card">
            <div className="kp-consumer-card-top">
              <h2 className="sr-only" id="consumer-exchange-title">Exchange details</h2>
              <div aria-label="Transaction direction" className="kp-direction-tabs" role="group">
                <button
                  aria-pressed={isBuy}
                  className="kp-direction-tab"
                  data-active={isBuy}
                  data-tone="buy"
                  onClick={() => selectDirection("buy")}
                  type="button"
                >
                  Buy XLM
                </button>
                <button
                  aria-pressed={!isBuy}
                  className="kp-direction-tab"
                  data-active={!isBuy}
                  data-tone="sell"
                  onClick={() => selectDirection("sell")}
                  type="button"
                >
                  Sell XLM
                </button>
              </div>
              <span className="kp-network-note">Stellar Testnet</span>
            </div>

            <div className="kp-consumer-card-body">
              <div className="kp-consumer-route-summary" aria-label={`${copy.sourceCurrency} to ${copy.destinationCurrency} exchange`}>
                <div className="kp-consumer-route-cell">
                  <span className="kp-consumer-route-label">From</span>
                  <strong className="kp-consumer-route-currency">{copy.sourceCurrency}</strong>
                  <span className="kp-consumer-route-detail">{isBuy ? "Rupiah" : "Stellar Testnet"}</span>
                </div>
                <span aria-hidden="true" className="kp-consumer-route-arrow">to</span>
                <div className="kp-consumer-route-cell">
                  <span className="kp-consumer-route-label">To</span>
                  <strong className="kp-consumer-route-currency">{copy.destinationCurrency}</strong>
                  <span className="kp-consumer-route-detail">{isBuy ? "Stellar Testnet" : "Sandbox payout"}</span>
                </div>
              </div>

              <form className="mt-5" onSubmit={handleSubmit}>
              {isBuy ? (
                <AmountField
                  currency="IDR"
                  id="consumer-idr-amount"
                  label={copy.sourceLabel}
                  onChange={handleIdrChange}
                  placeholder="500.000"
                  tone="coral"
                  value={idrAmount}
                />
              ) : (
                <AmountField
                  currency="XLM"
                  id="consumer-xlm-amount"
                  label={copy.sourceLabel}
                  onChange={(value) => {
                    setXlmAmount(value);
                    setError(null);
                  }}
                  placeholder="25.0000000"
                  tone="aqua"
                  value={xlmAmount}
                />
              )}

              <div className="kp-receive-row">
                <span className="kp-receive-label">{copy.destinationLabel}</span>
                <span className="kp-receive-value">
                  {isBuy ? "Quote at checkout" : "Payout after deposit"}{" "}
                  <span className="kp-currency">{copy.destinationCurrency}</span>
                </span>
              </div>

              <div className="mt-5">
                <LiveRateStrip direction={direction} quote={null} />
              </div>

              <div className="kp-detail-section">
                <h3 className="kp-detail-heading">{copy.destinationTitle}</h3>
                <p className="kp-detail-copy">{copy.destinationDescription}</p>

                {isBuy ? (
                  <>
                    <label className="mt-5 block" htmlFor="consumer-stellar-destination">
                      <span className="kp-field-label">Stellar destination</span>
                      <input
                        className="kp-input mt-2"
                        data-tone="buy"
                        id="consumer-stellar-destination"
                        onChange={(event) => {
                          setStellarDestination(event.target.value);
                          setError(null);
                        }}
                        placeholder="G... testnet address"
                        value={stellarDestination}
                      />
                    </label>
                    <p className="mt-2 text-xs leading-5 text-ink-3">Mainnet addresses are rejected in this release.</p>

                    <fieldset className="mt-5">
                      <legend className="kp-field-label">Choose how you pay</legend>
                      <div className="kp-choice-row mt-2">
                        <button
                          aria-pressed={paymentMethod === "qris"}
                          className="kp-choice"
                          data-active={paymentMethod === "qris"}
                          onClick={() => setPaymentMethod("qris")}
                          type="button"
                        >
                          QRIS
                        </button>
                        <button
                          aria-pressed={paymentMethod === "bri_va"}
                          className="kp-choice"
                          data-active={paymentMethod === "bri_va"}
                          onClick={() => setPaymentMethod("bri_va")}
                          type="button"
                        >
                          BRI virtual account
                        </button>
                      </div>
                    </fieldset>

                    <details className="kp-detail-section">
                      <summary className="cursor-pointer text-sm font-bold text-ink">
                        Add a memo <span className="ml-1 font-normal text-ink-3">Optional</span>
                      </summary>
                      <label className="mt-4 block" htmlFor="consumer-memo">
                        <span className="kp-field-label">Memo</span>
                        <input
                          className="kp-input mt-2"
                          id="consumer-memo"
                          maxLength={28}
                          onChange={(event) => {
                            setMemo(event.target.value);
                            setError(null);
                          }}
                          value={memo}
                        />
                      </label>
                    </details>
                  </>
                ) : (
                  <>
                    <label className="mt-5 block" htmlFor="consumer-payout-reference">
                      <span className="kp-field-label">Sandbox payout reference</span>
                      <input
                        className="kp-input mt-2"
                        data-tone="sell"
                        id="consumer-payout-reference"
                        onChange={(event) => {
                          setSandboxPayoutReference(event.target.value);
                          setError(null);
                        }}
                        placeholder="sandbox-bank-user-01"
                        value={sandboxPayoutReference}
                      />
                    </label>
                    <p className="mt-2 text-xs leading-5 text-ink-3">Week 2 uses this reference to simulate the bank destination.</p>
                  </>
                )}
              </div>

              {error !== null && <p className="kp-notice mt-5" data-tone="warning" role="alert">{error}</p>}

              <button className="kp-primary-button mt-6 w-full" type="submit">
                {reviewing ? "Review again" : copy.submitLabel}
              </button>
            </form>

            {reviewing && (
              <div className="kp-reveal" role="status">
                <h3 className="text-lg font-bold tracking-[-0.025em] text-ink">Your details are ready</h3>
                <p className="mt-1 max-w-xl text-sm leading-6 text-ink-2">Consumer order sessions are still being connected. Developer Mode can create this same route through the live Week 2 sandbox API today.</p>
                <Link className="kp-action-link mt-4 inline-flex" href="/developer/playground">Open Developer Mode</Link>
              </div>
            )}
          </div>
        </section>

        <aside className="self-start">
          <div className="kp-notice" data-tone="warning">
            <p className="font-bold text-ink">Testnet only</p>
            <p className="mt-1">This is a sandbox route. It does not move real IDR or XLM.</p>
          </div>
          <div className="mt-8 border-t border-line pt-5">
            <h2 className="text-sm font-bold text-ink">What you will see</h2>
            <ul className="mt-3 flex flex-col gap-3 text-sm leading-6 text-ink-2">
              <li>the amount you start with</li>
              <li>the destination before you continue</li>
              <li>the exact rate after the order is created</li>
            </ul>
          </div>
          <div className="mt-8 border-t border-line pt-5">
            <p className="text-sm leading-6 text-ink-2">Need API keys, request ids, or order polling?</p>
            <Link className="kp-action-link mt-3 inline-flex" href="/developer">Open Developer Mode</Link>
          </div>
        </aside>
      </div>
    </div>
    </div>
  );
}
