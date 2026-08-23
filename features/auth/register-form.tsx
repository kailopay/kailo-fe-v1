"use client";

import Link from "next/link";
import { useState } from "react";
import { ApiError, registerAccount } from "@/lib/api/client";
import { VerifyPrompt } from "./verify-prompt";

const PASSWORD_MIN = 10;
const PASSWORD_MAX = 128;

export function RegisterForm() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflict, setConflict] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setConflict(false);
    const trimmedEmail = email.trim();
    const trimmedName = displayName.trim();
    if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
      setError(`The password must be ${PASSWORD_MIN} to ${PASSWORD_MAX} characters.`);
      return;
    }
    setBusy(true);
    setError(null);
    registerAccount({
      email: trimmedEmail,
      password,
      // Optional on the wire: omit the key entirely when left blank.
      display_name: trimmedName === "" ? undefined : trimmedName,
    })
      .then(() => {
        // 201: an unverified account exists; verification comes next.
        setRegisteredEmail(trimmedEmail);
      })
      .catch((caught: unknown) => {
        if (caught instanceof ApiError && caught.status === 409) {
          setConflict(true);
        } else if (caught instanceof ApiError) {
          setError(caught.message);
        } else {
          setError("Could not reach the server. Try again.");
        }
      })
      .finally(() => setBusy(false));
  }

  if (registeredEmail !== null) {
    return <VerifyPrompt email={registeredEmail} />;
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-ink-2" htmlFor="register-name">
          Display name <span className="font-normal text-ink-3">(optional)</span>
        </label>
        <input
          autoComplete="name"
          className="h-11 rounded-xl border border-line-strong bg-white px-4 text-sm outline-none transition-colors focus:border-sky-deep"
          id="register-name"
          maxLength={100}
          onChange={(event) => setDisplayName(event.target.value)}
          value={displayName}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-ink-2" htmlFor="register-email">
          Email
        </label>
        <input
          autoComplete="email"
          className="h-11 rounded-xl border border-line-strong bg-white px-4 text-sm outline-none transition-colors focus:border-sky-deep"
          id="register-email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
          type="email"
          value={email}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-ink-2" htmlFor="register-password">
          Password
        </label>
        <input
          autoComplete="new-password"
          className="h-11 rounded-xl border border-line-strong bg-white px-4 text-sm outline-none transition-colors focus:border-sky-deep"
          id="register-password"
          maxLength={PASSWORD_MAX}
          minLength={PASSWORD_MIN}
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />
        <p className="text-xs text-ink-3">{PASSWORD_MIN} to {PASSWORD_MAX} characters.</p>
      </div>
      {conflict && (
        <p className="rounded-xl bg-sun-tint px-4 py-3 text-sm text-sun-deep" role="alert">
          That email is already registered.{" "}
          <Link className="font-medium underline underline-offset-4" href="/login">
            Sign in instead
          </Link>
          .
        </p>
      )}
      {error !== null && !conflict && (
        <p className="rounded-xl bg-sun-tint px-4 py-3 text-sm text-sun-deep" role="alert">
          {error}
        </p>
      )}
      <button
        className="h-11 rounded-xl bg-ink text-sm font-medium text-paper transition-colors hover:bg-ink-deep disabled:opacity-50"
        disabled={busy}
        type="submit"
      >
        {busy ? "Creating account" : "Create account"}
      </button>
    </form>
  );
}
