"use client";

import { useState } from "react";
import { ApiError, requestPasswordReset } from "@/lib/api/client";

type ForgotPasswordProps = { defaultOpen?: boolean };

export function ForgotPassword({ defaultOpen = false }: ForgotPasswordProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await requestPasswordReset(email.trim());
      // Always 202: the response never reveals whether the account exists.
      setSent(true);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not reach the server. Try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        className="self-start text-sm font-medium text-ink-2 underline underline-offset-4 transition-colors hover:text-ink"
        onClick={() => setOpen(true)}
        type="button"
      >
        Forgot your password?
      </button>
    );
  }

  if (sent) {
    return (
      <p className="max-w-md text-sm leading-6 text-sky-deep" role="status">
        If an account exists for that email, a reset link was delivered via the
        sandbox backend console.
      </p>
    );
  }

  return (
    <form className="flex flex-col gap-3" onSubmit={(event) => void handleSubmit(event)}>
      <input
        className="h-11 rounded-xl border border-line-strong bg-white px-4 text-sm outline-none transition-colors focus:border-sky-deep"
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        required
        type="email"
        value={email}
      />
      {error !== null && (
        <p className="text-sm text-sun-deep" role="alert">
          {error}
        </p>
      )}
      <button
        className="h-11 self-start rounded-xl bg-ink px-5 text-sm font-medium text-paper transition-colors hover:bg-ink-deep disabled:opacity-50"
        disabled={busy || email.trim().length === 0}
        type="submit"
      >
        {busy ? "Sending" : "Request reset link"}
      </button>
    </form>
  );
}
