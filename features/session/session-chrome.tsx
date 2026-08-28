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
  const developerLabel = user.developer_enabled ? "Developer" : "Developer mode";

  return (
    <div className="flex min-h-full flex-1 flex-col bg-paper">
      <header className="bg-paper/80">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-7 px-5 py-5 sm:px-8">
          <Link className="kp-brand shrink-0" href="/">KailoPay</Link>
          <nav aria-label="Consumer navigation" className="hidden items-center gap-5 sm:flex">
            {consumerItems.map((item) => (
              <Link
                className="kp-top-nav-link"
                data-active={isActivePath(pathname, item.href)}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-4">
            <div className="hidden md:block">
              <SandboxBadges />
            </div>
            <NetworkSelector />
            <Link className="kp-header-link hidden sm:inline-flex" href="/profile">Profile</Link>
            <Link className="kp-header-developer hidden lg:inline-flex" href={developerHref}>{developerLabel}</Link>
            <div className="hidden xl:block">
              <SignOutButton />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 bg-surface/70 px-5 py-2.5 md:hidden">
          <SandboxBadges />
          <span className="text-xs font-semibold text-ink-3">Testnet only</span>
        </div>
      </header>

      <main className="min-w-0 flex-1 pb-24 sm:pb-0">{children}</main>

      <nav aria-label="Mobile consumer navigation" className="kp-mobile-nav fixed inset-x-0 bottom-0 z-30 px-3 py-2 sm:hidden">
        <ul className="mx-auto grid max-w-md grid-cols-4 gap-1 text-center">
          {consumerItems.map((item) => (
            <li key={item.href}>
              <Link
                className="kp-mobile-nav-link"
                data-active={isActivePath(pathname, item.href)}
                href={item.href}
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            <Link className="kp-mobile-nav-link" data-active={isActivePath(pathname, "/profile")} href="/profile">Profile</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

function DeveloperChrome({ pathname, user, children }: SessionChromeProps & { pathname: string }): React.ReactElement {
  return (
    <div className="kp-developer-shell flex min-h-full flex-1">
      <aside className="kp-dev-rail hidden w-60 shrink-0 flex-col gap-8 p-6 md:flex">
        <Link className="kp-brand" href="/developer">KailoPay</Link>
        <div className="pt-5">
          <p className="text-xs font-bold text-ink-3">Developer workspace</p>
          <p className="mt-2 text-sm leading-6 text-ink-2">Build against the sandbox order API.</p>
        </div>
        <div className="flex flex-col gap-3">
          <NetworkSelector />
          <SandboxBadges />
        </div>
        <nav aria-label="Developer navigation" className="flex flex-col">
          {developerItems.map((item) => (
            <Link
              className="kp-dev-nav-link"
              data-active={isActivePath(pathname, item.href)}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
          <Link className="kp-dev-nav-link mt-2" data-active="false" href="/buy">Back to consumer</Link>
        </nav>
        <div className="mt-auto pt-5">
          <p className="truncate text-sm font-bold text-ink">{user.display_name}</p>
          <p className="mt-1 truncate text-xs text-ink-3">{user.email}</p>
          <div className="mt-4">
            <SignOutButton />
          </div>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-5 pb-24 pt-8 md:px-10 md:pb-10 lg:px-14">{children}</main>
      <nav aria-label="Mobile developer navigation" className="kp-mobile-nav fixed inset-x-0 bottom-0 z-30 px-3 py-2 md:hidden">
        <ul className="mx-auto grid max-w-md grid-cols-4 gap-1 text-center">
          {developerItems.map((item) => (
            <li key={item.href}>
              <Link
                className="kp-mobile-nav-link"
                data-active={isActivePath(pathname, item.href)}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            <Link className="kp-mobile-nav-link" data-active={isActivePath(pathname, "/profile")} href="/profile">Profile</Link>
          </li>
          <li>
            <Link className="kp-mobile-nav-link" data-active="false" href="/buy">Consumer</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

function isActivePath(pathname: string, href: string): boolean {
  if (pathname === "/dashboard" && href === "/buy") return true;
  return pathname === href || (href !== "/developer" && pathname.startsWith(`${href}/`));
}
