"use client";

import { useState } from "react";
import { apiRequest } from "@/lib/api/client";

export function SignOutButton() {
  const [busy, setBusy] = useState(false);

  async function handleSignOut(): Promise<void> {
    setBusy(true);
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } catch {
      // The session may already be gone; the landing page is correct either way.
    }
    // A hard reload is required on sign-out: it wipes all client state,
    // including any playground API key held in memory.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/login";
  }

  return (
    <button
      className="kp-signout-button disabled:opacity-50"
      disabled={busy}
      onClick={() => void handleSignOut()}
      type="button"
    >
      {busy ? "Signing out" : "Sign out"}
    </button>
  );
}
