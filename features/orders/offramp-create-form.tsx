"use client";

import { useState } from "react";
import { normalizeXlmAmount } from "@/lib/format-asset";

export type CreateOfframpFormValue = {
  assetAmount: string;
  destinationToken: string;
};

type OfframpCreateFormProps = {
  busy: boolean;
  onSubmit: (value: CreateOfframpFormValue) => void;
};

export function OfframpCreateForm({ busy, onSubmit }: OfframpCreateFormProps) {
  const [amount, setAmount] = useState("");
  const [destinationToken, setDestinationToken] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const normalizedAmount = normalizeXlmAmount(amount);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (normalizedAmount === null) {
      setFieldError("Enter an XLM amount with up to 7 decimal places.");
      return;
    }
    const trimmedToken = destinationToken.trim();
    if (trimmedToken.length < 3) {
      setFieldError("Enter the sandbox payout reference for this withdrawal.");
      return;
    }
    setFieldError(null);
    onSubmit({ assetAmount: normalizedAmount, destinationToken: trimmedToken });
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <label className="kp-field-label" htmlFor="sell-amount">
          XLM to sell
        </label>
        <input
          className="kp-input tnum"
          data-tone="sell"
          id="sell-amount"
          inputMode="decimal"
          onChange={(event) => setAmount(event.target.value)}
          placeholder="25.0000000"
          value={amount}
        />
        <p className="text-xs leading-5 text-ink-3">
          The sandbox accepts XLM with up to 7 decimal places. The backend
          secures the IDR quote when you create the order.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="kp-field-label" htmlFor="destination-token">
          Sandbox payout reference
        </label>
        <input
          className="kp-input"
          data-tone="sell"
          id="destination-token"
          onChange={(event) => setDestinationToken(event.target.value)}
          placeholder="sandbox-bank-001"
          value={destinationToken}
        />
        <p className="text-xs leading-5 text-ink-3">
          This test-only token represents the bank destination. No real bank
          account or payout is used.
        </p>
      </div>

      {fieldError !== null && (
        <p className="kp-notice" data-tone="warning" role="alert">
          {fieldError}
        </p>
      )}

      <button
        className="kp-primary-button w-full"
        disabled={busy}
        type="submit"
      >
        {busy ? "Creating sell order" : "Create sell order"}
      </button>
    </form>
  );
}
