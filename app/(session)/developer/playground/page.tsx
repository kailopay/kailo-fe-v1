import type { Metadata } from "next";
import { SandboxBadges } from "@/components/sandbox-badges";
import { PlaygroundFlow } from "@/features/orders/playground-flow";

export const metadata: Metadata = {
  title: "Playground",
};

export default async function PlaygroundPage(
  props: PageProps<"/developer/playground">,
) {
  const { order } = await props.searchParams;
  const initialOrderId = typeof order === "string" && order.length > 0 ? order : undefined;

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Playground</h1>
        <SandboxBadges />
      </div>
      <p className="mt-3 max-w-[70ch] text-sm leading-6 text-ink-2">
        Use your own test key to create a Buy or Sell order against the
        sandbox API. Buy orders use the QRIS or BRI virtual account flow.
        Sell orders use a test XLM deposit and a simulated IDR payout. No real
        money moves.
      </p>
      <div className="mt-8">
        <PlaygroundFlow initialOrderId={initialOrderId} />
      </div>
    </div>
  );
}
