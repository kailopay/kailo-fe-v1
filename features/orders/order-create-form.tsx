"use client";

import { useState } from "react";
import { formatIdr, formatIdrInput, parseIdrInput } from "@/lib/format-money";
import type { PaymentMethod } from "@/lib/api/types";

const STELLAR_ACCOUNT_PATTERN = /^G[A-Z2-7]{55}$/;

export type CreateOrderFormValue = {
  amountMinor: string;
  paymentMethod: PaymentMethod;
  destinationAccount: string;
  memo: string | null;
};

type OrderCreateFormProps = {
  busy: boolean;
  onSubmit: (value: CreateOrderFormValue) => void;
};

export function OrderCreateForm({ busy, onSubmit }: OrderCreateFormProps) {
  const [amountDisplay, setAmountDisplay] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("qris");
  const [destination, setDestination] = useState("");
  const [memo, setMemo] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);

  const amountMinor = parseIdrInput(amountDisplay);
  const destinationTrimmed = destination.trim();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (amountMinor === null) {
      setFieldError("Enter an amount in rupiah.");
      return;
    }
    if (!STELLAR_ACCOUNT_PATTERN.test(destinationTrimmed)) {
      setFieldError("The destination must be a 56-character Stellar address starting with G.");
      return;
    }
    if (memo.length > 28) {
      setFieldError("The memo must be 28 characters or fewer.");
      return;
    }
    setFieldError(null);
    onSubmit({
      amountMinor,
      paymentMethod,
      destinationAccount: destinationTrimmed,
      memo: memo.trim().length === 0 ? null : memo.trim(),
    });
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-ink-2" htmlFor="amount">
          Amount (idr)
        </label>
        <input
          className="h-11 rounded-xl border border-line-strong bg-white px-4 font-mono text-sm tnum outline-none transition-colors focus:border-sky-deep"
          id="amount"
          inputMode="numeric"
          onChange={(event) => setAmountDisplay(formatIdrInput(event.target.value))}
          placeholder="1.000.000"
          value={amountDisplay}
        />
        <p className="text-xs text-ink-3">
          {amountMinor !== null ? `serializes as "${amountMinor}"` : "typical bounds are 10.000 to 10.000.000; the server has the final say"}
        </p>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-ink-2">Payment method</legend>
        <div className="flex gap-2">
          {(
            [
              { value: "qris", label: "QRIS" },
              { value: "bri_va", label: "BRI virtual account" },
            ] as const
          ).map((option) => (
            <button
              aria-pressed={paymentMethod === option.value}
              className={`h-11 flex-1 rounded-xl border px-4 text-sm font-medium transition-colors ${
                paymentMethod === option.value
                  ? "border-ink bg-ink text-paper"
                  : "border-line-strong bg-white text-ink-2 hover:border-ink hover:text-ink"
              }`}
              key={option.value}
              onClick={() => setPaymentMethod(option.value)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-ink-2" htmlFor="destination">
          Stellar testnet destination
        </label>
        <input
          className="h-11 rounded-xl border border-line-strong bg-white px-4 font-mono text-sm outline-none transition-colors focus:border-sky-deep"
          id="destination"
          onChange={(event) => setDestination(event.target.value)}
          placeholder="G… 56 characters"
          value={destination}
        />
        <p className="text-xs text-ink-3">
          Mainnet addresses are rejected by design. Create a funded testnet
          account at laboratory.stellar.org.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-ink-2" htmlFor="memo">
          Memo (optional)
        </label>
        <input
          className="h-11 rounded-xl border border-line-strong bg-white px-4 font-mono text-sm outline-none transition-colors focus:border-sky-deep"
          id="memo"
          maxLength={28}
          onChange={(event) => setMemo(event.target.value)}
          value={memo}
        />
      </div>

      {fieldError !== null && (
        <p className="rounded-xl bg-sun-tint px-4 py-3 text-sm text-sun-deep" role="alert">
          {fieldError}
        </p>
      )}

      <button
        className="h-12 rounded-xl bg-ink text-sm font-medium text-paper transition-colors hover:bg-ink-deep disabled:opacity-50"
        disabled={busy}
        type="submit"
      >
        {busy ? "Creating order" : `Create order${amountMinor !== null ? ` for ${formatIdr(amountMinor)} idr` : ""}`}
      </button>
    </form>
  );
}
