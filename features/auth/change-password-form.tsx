"use client";

import { useState } from "react";
import { ApiError, changePassword, isSessionGone } from "@/lib/api/client";

const PASSWORD_MIN = 10;
const PASSWORD_MAX = 128;

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (newPassword.length < PASSWORD_MIN || newPassword.length > PASSWORD_MAX) {
      setError(`The new password must be ${PASSWORD_MIN} to ${PASSWORD_MAX} characters.`);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await changePassword(currentPassword, newPassword);
      // 204: the backend revoked every session, this one included. A hard
      // navigation re-enters the app as signed out.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/login?password=changed");
    } catch (caught) {
      if (isSessionGone(caught)) {
        // The cookie is gone: leave the app for the public explainer.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.assign("/session-expired");
        return;
      }
      setError(caught instanceof ApiError ? caught.message : "Could not reach the server. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold">Password</h2>
      <form className="mt-4 flex flex-col gap-4" onSubmit={(event) => void handleSubmit(event)}>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-ink-2" htmlFor="current-password">
            Current password
          </label>
          <input
            autoComplete="current-password"
            className="h-11 rounded-xl border border-line-strong bg-white px-4 text-sm outline-none transition-colors focus:border-sky-deep"
            id="current-password"
            onChange={(event) => setCurrentPassword(event.target.value)}
            required
            type="password"
            value={currentPassword}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-ink-2" htmlFor="new-password">
            New password
          </label>
          <input
            autoComplete="new-password"
            className="h-11 rounded-xl border border-line-strong bg-white px-4 text-sm outline-none transition-colors focus:border-sky-deep"
            id="new-password"
            maxLength={PASSWORD_MAX}
            minLength={PASSWORD_MIN}
            onChange={(event) => setNewPassword(event.target.value)}
            required
            type="password"
            value={newPassword}
          />
          <p className="text-xs text-ink-3">{PASSWORD_MIN} to {PASSWORD_MAX} characters.</p>
        </div>
        {error !== null && (
          <p className="rounded-xl bg-sun-tint px-4 py-3 text-sm text-sun-deep" role="alert">
            {error}
          </p>
        )}
        <button
          className="h-11 self-start rounded-xl bg-ink px-5 text-sm font-medium text-paper transition-colors hover:bg-ink-deep disabled:opacity-50"
          disabled={busy}
          type="submit"
        >
          {busy ? "Saving" : "Change password"}
        </button>
      </form>
      <p className="mt-4 max-w-md text-xs leading-5 text-ink-3">
        Changing the password signs out every device, including this one.
      </p>
    </section>
  );
}
