"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { createOrder, type CreateOrderInput } from "@/lib/api/orders";
import { normalizeXlmAmount } from "@/lib/format-asset";
import { formatIdrInput, parseIdrInput } from "@/lib/format-money";
import { AmountField } from "./amount-field";
import { consumerErrorMessage, shouldSendConsumerToLogin } from "./consumer-errors";
import { exchangeCopy } from "./consumer-copy";
import { ConsumerOrderView } from "./consumer-order";
import { LiveRateStrip } from "./live-rate-strip";
import {
  clearConsumerPurchase,
  paymentLinkForCheckout,
  readConsumerOrderId,
  readConsumerPurchase,
  saveConsumerPurchase,
  type ConsumerPurchase,
} from "./purchase";
import type { ConsumerDirection } from "./rate";

const STELLAR_ACCOUNT_PATTERN = /^G[A-Z2-7]{55}$/;

type ConsumerFlowProps = {
  initialDirection: ConsumerDirection;
  displayName: string;
};

export function ConsumerFlow({ initialDirection, displayName }: ConsumerFlowProps): React.ReactElement {
  const router = useRouter();
  const [direction, setDirection] = useState<ConsumerDirection>(initialDirection);
  const [idrAmount, setIdrAmount] = useState("");
  const [xlmAmount, setXlmAmount] = useState("");
  const [stellarDestination, setStellarDestination] = useState("");
  const [memo, setMemo] = useState("");
  const [sandboxPayoutReference, setSandboxPayoutReference] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sellReviewing, setSellReviewing] = useState(false);
  const [restoring, setRestoring] = useState(initialDirection === "buy");
  const [consumerOrderId, setConsumerOrderId] = useState<string | null>(null);
  const [pendingPurchase, setPendingPurchase] = useState<ConsumerPurchase | null>(null);
  const [reconciliationNotice, setReconciliationNotice] = useState<string | null>(null);
  const [reconciliationRequestId, setReconciliationRequestId] = useState<string | null>(null);

  const isBuy = direction === "buy";
  const copy = exchangeCopy(direction);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (direction === "buy") {
        const savedOrderId = readConsumerOrderId(sessionStorage);
        const savedPurchase = readConsumerPurchase(sessionStorage);
        setConsumerOrderId(savedOrderId);
        setPendingPurchase(savedOrderId === null ? savedPurchase : null);
      }
      setRestoring(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [direction]);

  function selectDirection(next: ConsumerDirection): void {
    setDirection(next);
    setError(null);
    setRequestId(null);
    setSellReviewing(false);
    setRestoring(next === "buy");
  }

  function handleIdrChange(value: string): void {
    setIdrAmount(formatIdrInput(value));
    setError(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (isBuy) {
      const amountMinor = parseIdrInput(idrAmount);
      if (amountMinor === null) {
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

      const purchase: ConsumerPurchase = {
        orderId: null,
        idempotencyKey: crypto.randomUUID(),
        amountMinor,
        stellarAccount: stellarDestination.trim(),
        memo: memo.trim().length === 0 ? null : memo.trim(),
      };
      void submitConsumerPurchase(purchase);
      return;
    }

    if (normalizeXlmAmount(xlmAmount) === null) {
      setError("Enter the amount of XLM you want to sell.");
      return;
    }
    if (sandboxPayoutReference.trim().length === 0) {
      setError("Enter a sandbox payout reference.");
      return;
    }
    setError(null);
    setSellReviewing(true);
  }

  async function submitConsumerPurchase(purchase: ConsumerPurchase): Promise<void> {
    const input: CreateOrderInput = {
      idempotencyKey: purchase.idempotencyKey,
      amountMinor: purchase.amountMinor,
      paymentMethod: "xendit",
      destinationAccount: purchase.stellarAccount,
      memo: purchase.memo,
    };
    saveConsumerPurchase(sessionStorage, purchase);
    setSubmitting(true);
    setError(null);
    setRequestId(null);
    setReconciliationNotice(null);
    setReconciliationRequestId(null);

    try {
      const created = await createOrder(input);
      saveConsumerPurchase(sessionStorage, { ...purchase, orderId: created.id });
      setConsumerOrderId(created.id);
      setPendingPurchase(null);
      const paymentLink = paymentLinkForCheckout(created.checkout);
      if (paymentLink === null) {
        setReconciliationNotice("Your order is saved, but its secure payment page is unavailable. Keep this order for support.");
        return;
      }
      window.location.assign(paymentLink);
    } catch (caught: unknown) {
      if (caught instanceof ApiError && caught.status === 202) {
        setRequestId(caught.requestId);
        setReconciliationRequestId(caught.requestId);
        if (caught.orderId !== null) {
          saveConsumerPurchase(sessionStorage, { ...purchase, orderId: caught.orderId });
          setConsumerOrderId(caught.orderId);
          setPendingPurchase(null);
          setReconciliationNotice("Your checkout is still being confirmed. We saved the order and are watching it for updates.");
        } else {
          setPendingPurchase(purchase);
          setError("Your checkout is still being confirmed. Retry this same purchase if needed.");
        }
        return;
      }

      if (shouldSendConsumerToLogin(caught)) {
        router.push("/login");
        return;
      }

      if (caught instanceof ApiError) {
        setError(consumerErrorMessage(caught));
        setRequestId(caught.requestId);
        if (caught.status === 503) {
          setPendingPurchase(purchase);
        } else {
          clearConsumerPurchase(sessionStorage);
          setPendingPurchase(null);
        }
        return;
      }

      setPendingPurchase(purchase);
      setError("The request may have reached the server. Retry this same purchase safely.");
    } finally {
      setSubmitting(false);
    }
  }

  function startNewPurchase(): void {
    clearConsumerPurchase(sessionStorage);
    setConsumerOrderId(null);
    setPendingPurchase(null);
    setReconciliationNotice(null);
    setReconciliationRequestId(null);
    setError(null);
    setRequestId(null);
    setIdrAmount("");
    setStellarDestination("");
    setMemo("");
    setDirection("buy");
    setRestoring(false);
  }

  if (isBuy && restoring) {
    return (
      <div className="kp-consumer-page">
        <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 lg:py-12">
          <p className="text-sm font-bold text-coral-deep">Your exchange</p>
          <h1 className="kp-page-heading kp-consumer-heading mt-3">Picking up where you left off</h1>
          <p className="kp-copy mt-4">Checking for a saved sandbox order.</p>
        </div>
      </div>
    );
  }

  if (isBuy && consumerOrderId !== null) {
    return (
      <div className="kp-consumer-page">
        <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 lg:py-12">
          <header className="kp-consumer-header">
            <div className="kp-consumer-header-copy">
              <p className="text-sm font-bold text-coral-deep">Your exchange</p>
              <h1 className="kp-page-heading kp-consumer-heading mt-3">Track your XLM</h1>
              <p className="kp-copy mt-4 text-sm">Your rate, payment page, and Stellar Testnet delivery stay together here.</p>
            </div>
            <p className="kp-consumer-greeting">Welcome back, {displayName}</p>
          </header>
          <ConsumerOrderView
            notice={reconciliationNotice ?? undefined}
            onStartNewPurchase={startNewPurchase}
            orderId={consumerOrderId}
            requestId={reconciliationRequestId}
          />
        </div>
      </div>
    );
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
              <div aria-label={`${copy.sourceCurrency} to ${copy.destinationCurrency} exchange`} className="kp-consumer-route-summary" data-tone={isBuy ? "buy" : "sell"}>
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
                <div className="kp-consumer-quote-grid">
                  <div>
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
                  </div>

                  <div className="kp-receive-row">
                    <span className="kp-receive-label">{copy.destinationLabel}</span>
                    <span className="kp-receive-value">
                      {isBuy ? "Rate locked at checkout" : "Payout after deposit"}{" "}
                      <span className="kp-currency">{copy.destinationCurrency}</span>
                    </span>
                  </div>
                  <LiveRateStrip direction={direction} quote={null} />
                </div>

                <div className="kp-detail-section">
                  <h3 className="kp-detail-heading">{copy.destinationTitle}</h3>
                  <p className="kp-detail-copy">{copy.destinationDescription}</p>

                  {isBuy ? (
                    <>
                      <div className="kp-consumer-destination-grid mt-5">
                        <div>
                          <label className="block" htmlFor="consumer-stellar-destination">
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
                        </div>
                        <div className="kp-order-value self-start">
                          <p className="text-xs font-semibold text-ink-3">Payment page</p>
                          <p className="mt-1 text-lg font-bold tracking-[-0.025em] text-ink">Xendit hosted checkout</p>
                          <p className="mt-2 text-xs leading-5 text-ink-2">Choose an available payment channel on Xendit after your rate is locked.</p>
                        </div>
                      </div>

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

                {pendingPurchase !== null && isBuy && (
                  <div className="kp-reveal" role="status">
                    <p className="text-sm font-bold text-ink">A purchase is waiting safely</p>
                    <p className="mt-1 text-sm leading-6 text-ink-2">We kept the same request details so checking again cannot create a duplicate order.</p>
                    <button
                      className="kp-secondary-button mt-4"
                      disabled={submitting}
                      onClick={() => void submitConsumerPurchase(pendingPurchase)}
                      type="button"
                    >
                      {submitting ? "Checking" : "Check the same purchase"}
                    </button>
                    <button className="kp-quiet-button ml-4 mt-4" onClick={startNewPurchase} type="button">Start over</button>
                  </div>
                )}

                {error !== null && <p className="kp-notice mt-5" data-tone="warning" role="alert">{error}</p>}
                {requestId !== null && <p className="mt-3 text-xs leading-5 text-ink-3">Keep request id <span className="break-all font-semibold text-ink-2">{requestId}</span> if you contact support.</p>}

                <button className="kp-primary-button mt-6 w-full" disabled={submitting} type="submit">
                  {submitting ? "Preparing secure checkout" : copy.submitLabel}
                </button>
              </form>

              {sellReviewing && (
                <div className="kp-reveal" role="status">
                  <h3 className="text-lg font-bold tracking-[-0.025em] text-ink">Your sell details are ready</h3>
                  <p className="mt-1 max-w-xl text-sm leading-6 text-ink-2">The sandbox payout reference will be used for the simulated bank transfer.</p>
                </div>
              )}
            </div>
          </section>

          <aside className="kp-consumer-side self-start">
            <div className="kp-notice" data-tone="warning">
              <p className="font-bold text-ink">Testnet only</p>
              <p className="mt-1">This is a sandbox route. It does not move real IDR or XLM.</p>
            </div>
            <div className="kp-consumer-side-block">
              <h2 className="text-sm font-bold text-ink">What you will see</h2>
              <ul className="mt-3 flex flex-col gap-3 text-sm leading-6 text-ink-2">
                <li>the amount you start with</li>
                <li>the hosted payment page on Xendit</li>
                <li>the exact rate and XLM after the order is created</li>
              </ul>
            </div>
            <div className="kp-consumer-side-block">
              <p className="text-sm leading-6 text-ink-2">Need API keys, request ids, or order polling?</p>
              <Link className="kp-action-link mt-3 inline-flex" href="/developer">Open Developer Mode</Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
