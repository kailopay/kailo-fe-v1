"use client";

import Link from "next/link";
import { useState } from "react";
import { ApiError, resetPasswordWithToken } from "@/lib/api/client";
import { ForgotPassword } from "./forgot-password";

const PASSWORD_MIN = 10;
const PASSWORD_MAX = 128;

type ResetState =
  | { kind: "form" }
  | { kind: "done" }
  | { kind: "invalid" }
  | { kind: "missing" };

type ResetPasswordFormProps = { token: string | null };

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [state, setState] = useState<ResetState>(token === null ? { kind: "missing" } : { kind: "form" });
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (token === null) return;
    if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
      setError(`The password must be ${PASSWORD_MIN} to ${PASSWORD_MAX} characters.`);
      return;
    }
    if (password !== confirmation) {
      setError("The passwords do not match.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      // 204; every session for the account was revoked, this browser included.
      await resetPasswordWithToken(token, password);
      setState({ kind: "done" });
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 400) {
        setState({ kind: "invalid" });
      } else if (caught instanceof ApiError) {
        setError(caught.message);
      } else {
        setError("Could not reach the server. Try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs text-ink-3">auth · password reset</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Reset your password</h1>
      </div>

      {state.kind === "form" && (
        <form className="flex flex-col gap-4" onSubmit={(event) => void handleSubmit(event)}>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-ink-2" htmlFor="reset-password">
              New password
            </label>
            <input
              autoComplete="new-password"
              className="h-11 rounded-xl border border-line-strong bg-white px-4 text-sm outline-none transition-colors focus:border-sky-deep"
              id="reset-password"
              maxLength={PASSWORD_MAX}
              minLength={PASSWORD_MIN}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
            <p className="text-xs text-ink-3">{PASSWORD_MIN} to {PASSWORD_MAX} characters.</p>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-ink-2" htmlFor="reset-password-confirm">
              Confirm new password
            </label>
            <input
              autoComplete="new-password"
              className="h-11 rounded-xl border border-line-strong bg-white px-4 text-sm outline-none transition-colors focus:border-sky-deep"
              id="reset-password-confirm"
              onChange={(event) => setConfirmation(event.target.value)}
              required
              type="password"
              value={confirmation}
            />
          </div>
          {error !== null && (
            <p className="rounded-xl bg-sun-tint px-4 py-3 text-sm text-sun-deep" role="alert">
              {error}
            </p>
          )}
          <button
            className="h-11 rounded-xl bg-ink text-sm font-medium text-paper transition-colors hover:bg-ink-deep disabled:opacity-50"
            disabled={busy}
            type="submit"
          >
            {busy ? "Saving" : "Set new password"}
          </button>
          <p className="text-xs leading-5 text-ink-3">
            Setting a new password signs out every session for the account.
          </p>
        </form>
      )}

      {state.kind === "done" && (
        <div className="flex flex-col gap-5 rounded-[20px] border border-line bg-sea-tint p-6">
          <p className="text-sm font-medium text-sea-deep">
            Your password was updated and every session was signed out.
          </p>
          <Link
            className="flex h-11 items-center justify-center self-start rounded-xl bg-ink px-6 text-sm font-medium text-paper transition-colors hover:bg-ink-deep"
            href="/login"
          >
            Continue to sign in
          </Link>
        </div>
      )}

      {(state.kind === "invalid" || state.kind === "missing") && (
        <div className="flex flex-col gap-4">
          <p className="rounded-xl bg-sun-tint px-4 py-3 text-sm text-sun-deep" role="alert">
            {state.kind === "invalid"
              ? "This reset link is invalid or has expired. Links are single-use."
              : "This link is missing its token."}{" "}
            Request a new one and open it from the sandbox backend console.
          </p>
          <ForgotPassword defaultOpen />
        </div>
      )}
    </div>
  );
}
