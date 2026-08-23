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
        Create a real sandbox on-ramp order with your own test key: pay the
        QRIS or BRI virtual account in the Xendit sandbox and watch testnet
        XLM arrive. Locally the Xendit callback needs a tunnel or the
        dashboard simulator, or the order stays in payment_pending.
      </p>
      <div className="mt-8">
        <PlaygroundFlow initialOrderId={initialOrderId} />
      </div>
    </div>
  );
}
