import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Developer",
};

export default function DeveloperPage() {
  return (
    <div className="flex max-w-2xl flex-col gap-3">
      <h1 className="text-2xl font-semibold tracking-tight">Developer</h1>
      <p className="leading-7 text-ink-2">
        API key list, create, and revoke with one-time key reveal
        (features/developer). Requires Developer Mode.
      </p>
    </div>
  );
}
