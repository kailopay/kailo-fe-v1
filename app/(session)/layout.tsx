import { redirect } from "next/navigation";
import { SessionChrome } from "@/features/session/session-chrome";
import { getServerSession } from "@/lib/api/server";

export default async function SessionLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerSession();
  if (user === null) redirect("/login");

  return <SessionChrome user={user}>{children}</SessionChrome>;
}
