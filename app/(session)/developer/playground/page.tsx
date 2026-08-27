import type { Metadata } from "next";
import { SandboxBadges } from "@/components/sandbox-badges";
import { PlaygroundFlow } from "@/features/orders/playground-flow";

export const metadata: Metadata = {
  title: "Playground",
};

export default async function PlaygroundPage(
  props: PageProps<"/developer/playground">,
): Promise<React.ReactElement> {
  const { order } = await props.searchParams;
  const initialOrderId = typeof order === "string" && order.length > 0 ? order : undefined;

  return (
    <div className="kp-dev-page">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-bold text-coral-deep">Developer workspace</p>
          <h1 className="kp-dev-heading mt-3">Playground</h1>
          <p className="kp-copy mt-4 max-w-2xl">Use a test key to create an on-ramp or off-ramp order, then inspect its checkout, quote, and settlement state.</p>
        </div>
        <SandboxBadges />
      </header>
      <div className="mt-5 flex flex-wrap gap-4 border-y border-line py-4 text-xs font-bold text-ink-3">
        <span>Same sandbox API as the consumer route</span>
        <span aria-hidden className="h-4 w-px bg-line-strong" />
        <span>No real money moves</span>
      </div>
      <div className="mt-8">
        <PlaygroundFlow initialOrderId={initialOrderId} />
      </div>
    </div>
  );
}
