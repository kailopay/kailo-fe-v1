import Link from "next/link";
import { redirect } from "next/navigation";
import { SandboxBadges } from "@/components/sandbox-badges";
import { NetworkSelector } from "@/components/network-selector";
import { SignOutButton } from "@/features/auth/sign-out-button";
import { ConsumerShellNav } from "@/features/consumer/consumer-shell";
import { getServerSession } from "@/lib/api/server";

export default async function SessionLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerSession();
  if (user === null) redirect("/login");

  return (
    <div className="flex flex-1">
      <aside className="hidden w-60 shrink-0 flex-col gap-6 border-r border-line p-5 md:flex">
        <Link className="text-xl font-bold tracking-[-0.03em]" href="/">
          KailoPay
        </Link>
        <div className="flex flex-col gap-3">
          <NetworkSelector />
          <SandboxBadges />
        </div>
        <ConsumerShellNav developerEnabled={user.developer_enabled} />
        <div className="mt-auto flex flex-col gap-3 border-t border-line pt-4">
          <div>
            <p className="truncate text-sm font-medium">{user.display_name}</p>
            <p className="truncate text-xs text-ink-3">{user.email}</p>
          </div>
          <SignOutButton />
        </div>
      </aside>
      <main className="flex-1 pb-24 md:p-8 md:pb-8">
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4 md:hidden">
          <Link className="text-lg font-bold tracking-[-0.03em]" href="/">
            KailoPay
          </Link>
          <div className="flex items-center gap-2">
            <NetworkSelector />
            <SandboxBadges />
          </div>
        </div>
        {children}
        <nav aria-label="Mobile consumer navigation" className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-paper/95 px-3 py-2 backdrop-blur md:hidden">
          <ul className="mx-auto grid max-w-md grid-cols-4 gap-1 text-center text-xs font-semibold">
            <li><Link className="block rounded-xl px-2 py-2.5 text-ink-2 hover:bg-coral-tint hover:text-coral-deep" href="/buy">Buy</Link></li>
            <li><Link className="block rounded-xl px-2 py-2.5 text-ink-2 hover:bg-aqua-tint hover:text-aqua-deep" href="/sell">Sell</Link></li>
            <li><Link className="block rounded-xl px-2 py-2.5 text-ink-2 hover:bg-lilac-tint hover:text-lilac-deep" href="/activity">Activity</Link></li>
            <li><Link className="block rounded-xl px-2 py-2.5 text-ink-2 hover:bg-mango-tint hover:text-mango-deep" href="/profile">Profile</Link></li>
          </ul>
        </nav>
      </main>
    </div>
  );
}
