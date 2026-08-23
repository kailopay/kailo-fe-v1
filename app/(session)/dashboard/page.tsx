import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/api/server";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const user = await getServerSession();
  if (user === null) redirect("/login");

  const destinations = [
    {
      href: "/profile",
      title: "Profile",
      note: "Display name, password, Developer Mode, avatar.",
      requirement: null as string | null,
    },
    {
      href: "/developer",
      title: "Developer",
      note: "API keys: create with one-time reveal, list, revoke.",
      requirement: user.developer_enabled ? null : "requires developer mode",
    },
    {
      href: "/developer/playground",
      title: "Playground",
      note: "Create a sandbox order, pay the QRIS or BRI checkout, watch testnet XLM land.",
      requirement: user.developer_enabled ? null : "requires developer mode",
    },
  ];

  return (
    <div className="max-w-3xl">
      <p className="font-mono text-xs text-ink-3">dashboard · sandbox session</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Hello, {user.display_name}
      </h1>
      <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-ink-3">
        <span>{user.email}</span>
        <span aria-hidden>·</span>
        <span>{user.email_verified ? "email verified" : "email not verified"}</span>
        <span aria-hidden>·</span>
        <span>{user.developer_enabled ? "developer mode on" : "developer mode off"}</span>
      </p>

      <ul className="mt-10 grid gap-4 sm:grid-cols-3">
        {destinations.map((destination) => (
          <li key={destination.href}>
            <Link
              className="flex h-full flex-col rounded-[20px] border border-line bg-white p-5 transition-colors hover:border-ink"
              href={destination.href}
            >
              <p className="text-base font-semibold">{destination.title}</p>
              <p className="mt-2 flex-1 text-sm leading-6 text-ink-2">{destination.note}</p>
              {destination.requirement !== null && (
                <p className="mt-3 font-mono text-xs text-ink-3">{destination.requirement}</p>
              )}
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-10 rounded-[20px] border border-line bg-paper-recess px-5 py-4 text-sm leading-6 text-ink-2">
        Everything here runs against the Xendit sandbox and Stellar testnet.
        No real money moves, and orders need a pk_test key from the
        Developer section.
      </p>
    </div>
  );
}
