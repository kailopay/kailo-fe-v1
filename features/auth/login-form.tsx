"use client";

import { useState } from "react";
import { ApiError, loginAccount } from "@/lib/api/client";
import { VerifyPrompt } from "./verify-prompt";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await loginAccount({ email: email.trim(), password });
      // Hard navigation: the fresh tree hydrates with the new session cookie.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/dashboard");
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 403) {
        // "email is not verified": a prompt to verify, never a password error.
        setUnverifiedEmail(email.trim());
      } else if (caught instanceof ApiError) {
        // 401 covers unknown email, wrong password, and lockout; the message
        // never distinguishes them, and neither does the interface.
        setError(caught.message);
      } else {
        setError("Could not reach the server. Try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  if (unverifiedEmail !== null) {
    return <VerifyPrompt email={unverifiedEmail} />;
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={(event) => void handleSubmit(event)}>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-ink-2" htmlFor="login-email">
          Email
        </label>
        <input
          autoComplete="email"
          className="h-11 rounded-xl border border-line-strong bg-white px-4 text-sm outline-none transition-colors focus:border-sky-deep"
          id="login-email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
          type="email"
          value={email}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-ink-2" htmlFor="login-password">
          Password
        </label>
        <input
          autoComplete="current-password"
          className="h-11 rounded-xl border border-line-strong bg-white px-4 text-sm outline-none transition-colors focus:border-sky-deep"
          id="login-password"
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
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
        {busy ? "Signing in" : "Sign in"}
      </button>
    </form>
  );
}
