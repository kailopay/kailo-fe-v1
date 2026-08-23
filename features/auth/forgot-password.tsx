"use client";

import { useState } from "react";
import { ApiError, apiRequest } from "@/lib/api/client";

export function ForgotPassword() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await apiRequest("/auth/password/forgot", { body: { email: email.trim() } });
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
        className="text-sm font-medium text-ink-2 underline underline-offset-4 transition-colors hover:text-ink"
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
        If an account exists for that email, a reset message is on its way.
      </p>
    );
  }

  return (
    <form className="flex flex-col items-center gap-3" onSubmit={(event) => void handleSubmit(event)}>
      <input
        className="h-11 w-64 rounded-xl border border-line-strong bg-white px-4 text-sm outline-none transition-colors focus:border-sky-deep"
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        type="email"
        value={email}
      />
      {error !== null && (
        <p className="text-sm text-sun-deep" role="alert">
          {error}
        </p>
      )}
      <button
        className="h-11 rounded-xl bg-ink px-5 text-sm font-medium text-paper transition-colors hover:bg-ink-deep disabled:opacity-50"
        disabled={busy || email.trim().length === 0}
        type="submit"
      >
        {busy ? "Sending" : "Send reset email"}
      </button>
    </form>
  );
}
