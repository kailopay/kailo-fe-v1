"use client";

import Link from "next/link";
import { useState } from "react";
import { ApiError, resendVerificationEmail } from "@/lib/api/client";

type VerifyPromptProps = { email: string };

/**
 * Shown after register (201) and on login 403 "email is not verified".
 * Sandbox delivery is the backend console, so the copy never says
 * "check your email".
 */
export function VerifyPrompt({ email }: VerifyPromptProps) {
  const [busy, setBusy] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleResend(): Promise<void> {
    setBusy(true);
    setError(null);
    try {
      // Always 202; the endpoint never reveals whether the account exists.
      await resendVerificationEmail(email);
      setResent(true);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not reach the server. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 rounded-[20px] border border-line bg-white p-6">
      <div>
        <p className="font-mono text-xs text-ink-3">auth · flow b</p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight">Verify your email</h2>
        <p className="mt-3 text-sm leading-6 text-ink-2">
          One more step for <span className="font-medium text-ink">{email}</span>:
          open the verification link to activate the account. In this sandbox
          the link is delivered via the backend console, not by email.
        </p>
      </div>

      {resent ? (
        <p className="text-sm text-sky-deep" role="status">
          A new link was delivered via the sandbox console.
        </p>
      ) : (
        <button
          className="h-11 self-start rounded-xl border border-line-strong px-5 text-sm font-medium text-ink-2 transition-colors hover:border-ink hover:text-ink disabled:opacity-50"
          disabled={busy}
          onClick={() => void handleResend()}
          type="button"
        >
          {busy ? "Sending" : "Send a new link"}
        </button>
      )}
      {error !== null && (
        <p className="text-sm text-sun-deep" role="alert">
          {error}
        </p>
      )}

      <p className="text-sm leading-6 text-ink-2">
        Already opened the link?{" "}
        <Link className="font-medium text-sky-deep underline underline-offset-4" href="/login">
          Continue to sign in
        </Link>
        .
      </p>
    </div>
  );
}
