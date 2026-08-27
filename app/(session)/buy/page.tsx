import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ConsumerFlow } from "@/features/consumer/consumer-flow";
import { getServerSession } from "@/lib/api/server";

export const metadata: Metadata = {
  title: "Buy XLM",
};

export default async function BuyPage() {
  const user = await getServerSession();
  if (user === null) redirect("/login");

  return <ConsumerFlow displayName={user.display_name} initialDirection="buy" />;
}
