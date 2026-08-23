import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order",
};

export default async function DeveloperOrderPage(
  props: PageProps<"/developer/orders/[id]">,
) {
  const { id } = await props.params;

  return (
    <div className="flex max-w-2xl flex-col gap-3">
      <h1 className="text-2xl font-semibold tracking-tight">Order</h1>
      <p className="leading-7 text-ink-2">
        Order detail for {id}: status timeline, locked quote, checkout, and
        the testnet explorer link on completion (features/orders).
      </p>
    </div>
  );
}
