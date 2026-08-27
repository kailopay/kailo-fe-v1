"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ApiError, resendVerificationEmail, verifyEmailToken } from "@/lib/api/client";

type VerifyState =
  | { kind: "verifying" }
  | { kind: "verified"; email: string }
  | { kind: "invalid" }
  | { kind: "failed" }
  | { kind: "missing" };

type VerifyEmailClientProps = { token: string | null };

export function VerifyEmailClient({ token }: VerifyEmailClientProps) {
  const [state, setState] = useState<VerifyState>(
    token === null ? { kind: "missing" } : { kind: "verifying" },
  );
  // The token is single-use: guard against a double effect run consuming it twice.
  const started = useRef(false);

  useEffect(() => {
    if (token === null || started.current) return;
    started.current = true;
    void verifyEmailToken(token)
      .then((user) => setState({ kind: "verified", email: user.email }))
      .catch((caught: unknown) => {
        if (caught instanceof ApiError && caught.status === 400) {
          setState({ kind: "invalid" });
        } else {
          setState({ kind: "failed" });
        }
      });
  }, [token]);

  function retry(): void {
    if (token === null) return;
    setState({ kind: "verifying" });
    void verifyEmailToken(token)
      .then((user) => setState({ kind: "verified", email: user.email }))
      .catch((caught: unknown) => {
        if (caught instanceof ApiError && caught.status === 400) {
          setState({ kind: "invalid" });
        } else {
          setState({ kind: "failed" });
        }
      });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs text-ink-3">Email verification</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Verify your email</h1>
      </div>

      {state.kind === "verifying" && (
        <p className="animate-pulse text-sm leading-6 text-ink-2" role="status">
          Checking the token...
        </p>
      )}

      {state.kind === "verified" && (
        <div className="flex flex-col gap-5 rounded-[20px] border border-line bg-sea-tint p-6">
          <p className="text-sm font-medium text-sea-deep">
            {state.email} is verified. The account is ready to sign in.
          </p>
          <Link
            className="flex h-11 items-center justify-center self-start rounded-xl bg-ink px-6 text-sm font-medium text-paper transition-colors hover:bg-ink-deep"
            href="/login"
          >
            Continue to sign in
          </Link>
        </div>
      )}

      {state.kind === "failed" && (
        <div className="flex flex-col gap-4">
          <p className="rounded-xl bg-sun-tint px-4 py-3 text-sm text-sun-deep" role="alert">
            Could not reach the server.
          </p>
          <button
            className="h-11 self-start rounded-xl border border-line-strong px-5 text-sm font-medium text-ink-2 transition-colors hover:border-ink hover:text-ink"
            onClick={retry}
            type="button"
          >
            Try again
          </button>
        </div>
      )}

      {(state.kind === "invalid" || state.kind === "missing") && (
        <ResendLink
          reason={
            state.kind === "invalid"
              ? "This verification link is invalid or has expired. Links are single-use."
              : "This link is missing its token."
          }
        />
      )}
    </div>
  );
}

function ResendLink({ reason }: { reason: string }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      // Always 202; the endpoint never reveals whether the account exists.
      await resendVerificationEmail(email.trim());
      setSent(true);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not reach the server. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="rounded-xl bg-sun-tint px-4 py-3 text-sm text-sun-deep" role="alert">
        {reason} Request a new link and open it from the sandbox backend console.
      </p>
      {sent ? (
        <p className="text-sm text-sky-deep" role="status">
          If an account exists for that email, a new link was delivered via the
          sandbox console.
        </p>
      ) : (
        <form className="flex flex-col gap-3" onSubmit={(event) => void handleSubmit(event)}>
          <input
            autoComplete="email"
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
            className="h-11 self-start rounded-xl border border-line-strong px-5 text-sm font-medium text-ink-2 transition-colors hover:border-ink hover:text-ink disabled:opacity-50"
            disabled={busy || email.trim().length === 0}
            type="submit"
          >
            {busy ? "Sending" : "Request a new link"}
          </button>
        </form>
      )}
      <p className="text-sm leading-6 text-ink-2">
        Already verified?{" "}
        <Link className="font-medium text-sky-deep underline underline-offset-4" href="/login">
          Sign in
        </Link>
        .
      </p>
    </div>
  );
}
