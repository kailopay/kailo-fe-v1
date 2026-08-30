import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ConsumerActivity } from "@/features/consumer/consumer-activity";
import { getServerSession } from "@/lib/api/server";

export const metadata: Metadata = {
  title: "Activity",
};

export default async function ActivityPage() {
  const user = await getServerSession();
  if (user === null) redirect("/login");

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8 lg:py-12">
      <h1 className="kp-page-heading">Your activity</h1>
      <p className="mt-5 max-w-xl text-base leading-7 text-ink-2 sm:text-lg">
        A simple record of money moving between rupiah and Stellar testnet.
      </p>

      <ConsumerActivity />
    </div>
  );
}
