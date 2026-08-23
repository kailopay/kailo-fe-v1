"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError, apiRequest, isSessionGone } from "@/lib/api/client";

/** One-click opt-in on the Developer gate: PATCH /auth/me {"developer_enabled":true}. */
export function EnableDeveloperMode() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleEnable(): Promise<void> {
    setBusy(true);
    setError(null);
    try {
      await apiRequest("/auth/me", { method: "PATCH", body: { developer_enabled: true } });
      router.refresh();
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
    <div className="mt-4 flex flex-col items-start gap-3">
      <button
        className="h-11 rounded-xl bg-ink px-6 text-sm font-medium text-paper transition-colors hover:bg-ink-deep disabled:opacity-50"
        disabled={busy}
        onClick={() => void handleEnable()}
        type="button"
      >
        {busy ? "Enabling" : "Enable Developer Mode"}
      </button>
      {error !== null && (
        <p className="text-sm text-sun-deep" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
