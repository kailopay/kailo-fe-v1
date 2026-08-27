import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ConsumerFlow } from "@/features/consumer/consumer-flow";
import { getServerSession } from "@/lib/api/server";

export const metadata: Metadata = {
  title: "Sell XLM",
};

export default async function SellPage() {
  const user = await getServerSession();
  if (user === null) redirect("/login");

  return <ConsumerFlow displayName={user.display_name} initialDirection="sell" />;
}
