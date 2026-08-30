import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ConsumerOrderView } from "@/features/consumer/consumer-order";
import { getServerSession } from "@/lib/api/server";

export const metadata: Metadata = {
  title: "Order status",
};

export default async function ConsumerOrderPage(
  props: { params: Promise<{ id: string }> },
): Promise<React.ReactElement> {
  const user = await getServerSession();
  if (user === null) redirect("/login");
  const { id } = await props.params;

  return (
    <div className="kp-consumer-page">
      <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 lg:py-12">
        <header className="kp-consumer-header">
          <div className="kp-consumer-header-copy">
            <p className="text-sm font-bold text-coral-deep">Your exchange</p>
            <h1 className="kp-page-heading kp-consumer-heading mt-3">Track your XLM</h1>
            <p className="kp-copy mt-4 text-sm">Your rate, payment, and Stellar Testnet delivery stay together here.</p>
          </div>
          <p className="kp-consumer-greeting">Welcome back, {user.display_name}</p>
        </header>
        <ConsumerOrderView orderId={id} />
      </div>
    </div>
  );
}
