import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Playground",
};

export default function PlaygroundPage() {
  return (
    <div className="flex max-w-2xl flex-col gap-3">
      <h1 className="text-2xl font-semibold tracking-tight">Playground</h1>
      <p className="leading-7 text-ink-2">
        Paste your own test API key (kept in memory only), create an on-ramp
        order, and watch it settle (features/orders).
      </p>
    </div>
  );
}
