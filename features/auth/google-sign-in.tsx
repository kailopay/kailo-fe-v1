"use client";

import { useEffect, useState } from "react";

type GoogleAvailability =
  | { kind: "checking" }
  | { kind: "available" }
  | { kind: "unconfigured" };

export function GoogleSignIn() {
  const [availability, setAvailability] = useState<GoogleAvailability>({ kind: "checking" });

  useEffect(() => {
    let cancelled = false;
    // redirect: "manual" surfaces the backend's 302 as an opaque redirect
    // instead of following it to Google.
    void fetch("/auth/google/login", { cache: "no-store", redirect: "manual" })
      .then((response) => {
        if (cancelled) return;
        setAvailability(
          response.type === "opaqueredirect" ? { kind: "available" } : { kind: "unconfigured" },
        );
      })
      .catch(() => {
        if (!cancelled) setAvailability({ kind: "unconfigured" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (availability.kind === "checking") {
    // Hold the button's space so the card does not shift when the probe lands.
    return <div aria-hidden className="h-11" />;
  }

  if (availability.kind === "unconfigured") {
    // Reserved slot: button-shaped but dashed, muted, and inert, so it can
    // never be mistaken for a working control.
    return (
      <div className="flex flex-col gap-2">
        <div
          aria-label="Google sign-in is reserved for this sandbox"
          className="flex h-11 items-center justify-center gap-3 rounded-xl border border-dashed border-line-strong px-4"
        >
          <GoogleMark muted />
          <span className="text-sm font-medium text-ink-3">Sign in with Google</span>
        </div>
        <p className="text-center font-mono text-xs text-ink-3">
          reserved · arrives once google credentials are configured
        </p>
      </div>
    );
  }

  return (
    // Full-window navigation: the backend owns the OIDC round-trip and
    // redirects back with the session cookie already set.
    <a
      className="flex h-11 items-center justify-center gap-3 rounded-xl border border-line-strong bg-white text-sm font-medium text-ink transition-colors hover:border-ink"
      href="/auth/google/login"
    >
      <GoogleMark />
      Sign in with Google
    </a>
  );
}

function GoogleMark({ muted = false }: { muted?: boolean }) {
  return (
    <svg
      aria-hidden
      className={`h-4 w-4 ${muted ? "opacity-40 grayscale" : ""}`}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.9 11.42 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}
