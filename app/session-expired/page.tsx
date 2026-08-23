import type { Metadata } from "next";
import { SandboxBadges } from "@/components/sandbox-badges";

export const metadata: Metadata = {
  title: "Session expired",
};

export default function SessionExpiredPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
      <SandboxBadges />
      <h1 className="text-2xl font-semibold tracking-tight">Your session expired</h1>
      <p className="max-w-md leading-7 text-ink-2">
        Sign in again to continue. Your sandbox orders and API keys are not
        affected.
      </p>
      {/* Full-window navigation: the backend owns the Auth0 round-trip. */}
      <a
        className="flex h-12 items-center justify-center rounded-xl bg-ink px-7 font-medium text-paper transition-colors hover:bg-ink-deep"
        href="/auth/login"
      >
        Sign in
      </a>
    </div>
  );
}
