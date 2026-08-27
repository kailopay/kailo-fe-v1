"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NetworkSelector } from "@/components/network-selector";
import { SandboxBadges } from "@/components/sandbox-badges";
import { SignOutButton } from "@/features/auth/sign-out-button";
import type { User } from "@/lib/api/types";

type SessionChromeProps = {
  user: User;
  children: React.ReactNode;
};

const consumerItems = [
  { href: "/buy", label: "Buy" },
  { href: "/sell", label: "Sell" },
  { href: "/activity", label: "Activity" },
] as const;

const developerItems = [
  { href: "/developer", label: "API keys" },
  { href: "/developer/playground", label: "Playground" },
] as const;

export function SessionChrome({ user, children }: SessionChromeProps): React.ReactElement {
  const pathname = usePathname() ?? "";
  const isDeveloperRoute = pathname === "/developer" || pathname.startsWith("/developer/");

  return isDeveloperRoute ? (
    <DeveloperChrome pathname={pathname} user={user}>{children}</DeveloperChrome>
  ) : (
    <ConsumerChrome pathname={pathname} user={user}>{children}</ConsumerChrome>
  );
}

function ConsumerChrome({ pathname, user, children }: SessionChromeProps & { pathname: string }): React.ReactElement {
  const developerHref = user.developer_enabled ? "/developer" : "/profile";
  const developerLabel = user.developer_enabled ? "Developer Mode" : "Enable Developer Mode";

  return (
    <div className="flex min-h-full flex-1 flex-col bg-milk">
      <header className="sticky top-0 z-20 border-b border-line/75 bg-milk/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-5 py-4 sm:px-8">
          <Link className="shrink-0 text-xl font-bold tracking-[-0.05em] text-ink" href="/">
            KailoPay
          </Link>
          <nav aria-label="Consumer navigation" className="hidden items-center gap-1 sm:flex">
            {consumerItems.map((item) => (
              <Link className={topNavClasses(isActivePath(pathname, item.href))} href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden xl:flex">
              <SandboxBadges />
            </div>
            <NetworkSelector />
            <Link className="hidden rounded-full bg-white px-3.5 py-2 text-sm font-semibold text-ink-2 transition-colors hover:text-ink sm:inline-flex" href="/profile">
              Profile
            </Link>
            <Link className="hidden rounded-full bg-lilac-tint px-3.5 py-2 text-sm font-semibold text-lilac-deep transition-colors hover:bg-lilac/35 lg:inline-flex" href={developerHref}>
              {developerLabel}
            </Link>
            <div className="hidden xl:block">
              <SignOutButton />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-line/60 px-5 py-2.5 sm:hidden">
          <SandboxBadges />
          <span className="text-xs font-semibold text-ink-3">Testnet only</span>
        </div>
      </header>

      <main className="min-w-0 flex-1 pb-24">{children}</main>

      <nav aria-label="Mobile consumer navigation" className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-milk/95 px-3 py-2 backdrop-blur sm:hidden">
        <ul className="mx-auto grid max-w-md grid-cols-4 gap-1 text-center text-xs font-semibold">
          {consumerItems.map((item) => (
            <li key={item.href}>
              <Link className={mobileNavClasses(isActivePath(pathname, item.href))} href={item.href}>{item.label}</Link>
            </li>
          ))}
          <li>
            <Link className={mobileNavClasses(isActivePath(pathname, "/profile"))} href="/profile">Profile</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

function DeveloperChrome({ pathname, user, children }: SessionChromeProps & { pathname: string }): React.ReactElement {
  return (
    <div className="flex min-h-full flex-1 bg-paper">
      <aside className="hidden w-60 shrink-0 flex-col gap-6 border-r border-line bg-white/45 p-5 md:flex">
        <Link className="text-xl font-bold tracking-[-0.05em] text-ink" href="/developer">
          KailoPay
        </Link>
        <div className="flex flex-col gap-3">
          <NetworkSelector />
          <SandboxBadges />
        </div>
        <div>
          <p className="px-3 text-xs font-semibold text-ink-3">Developer workspace</p>
          <nav aria-label="Developer navigation" className="mt-2 flex flex-col gap-1 text-sm font-semibold">
            {developerItems.map((item) => (
              <Link className={sideNavClasses(isActivePath(pathname, item.href))} href={item.href} key={item.href}>{item.label}</Link>
            ))}
            <Link className="mt-2 rounded-xl px-3 py-2.5 text-ink-2 transition-colors hover:bg-coral-tint hover:text-coral-deep" href="/buy">Back to consumer</Link>
          </nav>
        </div>
        <div className="mt-auto flex flex-col gap-3 border-t border-line pt-4">
          <div>
            <p className="truncate text-sm font-medium text-ink">{user.display_name}</p>
            <p className="truncate text-xs text-ink-3">{user.email}</p>
          </div>
          <SignOutButton />
        </div>
      </aside>
      <main className="min-w-0 flex-1 pb-24 md:p-8 md:pb-8">{children}</main>
      <nav aria-label="Mobile developer navigation" className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 px-3 py-2 backdrop-blur md:hidden">
        <ul className="mx-auto grid max-w-md grid-cols-4 gap-1 text-center text-xs font-semibold">
          {developerItems.map((item) => (
            <li key={item.href}>
              <Link className={mobileNavClasses(isActivePath(pathname, item.href))} href={item.href}>{item.label}</Link>
            </li>
          ))}
          <li><Link className={mobileNavClasses(isActivePath(pathname, "/profile"))} href="/profile">Profile</Link></li>
          <li><Link className={mobileNavClasses(false)} href="/buy">Consumer</Link></li>
        </ul>
      </nav>
    </div>
  );
}

function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || (href !== "/developer" && pathname.startsWith(`${href}/`));
}

function topNavClasses(active: boolean): string {
  return `rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${active ? "bg-white text-ink shadow-sm" : "text-ink-2 hover:bg-white/70 hover:text-ink"}`;
}

function sideNavClasses(active: boolean): string {
  return `rounded-xl px-3 py-2.5 transition-colors ${active ? "bg-lilac-tint text-lilac-deep" : "text-ink-2 hover:bg-lilac-tint hover:text-lilac-deep"}`;
}

function mobileNavClasses(active: boolean): string {
  return `block rounded-xl px-2 py-2.5 transition-colors ${active ? "bg-white text-ink shadow-sm" : "text-ink-2 hover:bg-white/70 hover:text-ink"}`;
}
