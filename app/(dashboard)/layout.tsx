import Link from "next/link";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/transactions", label: "Transactions" },
  { href: "/settings", label: "Settings" },
] as const;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1">
      <nav className="hidden w-56 shrink-0 border-r border-black/[.08] p-4 md:block dark:border-white/[.145]">
        <ul className="flex flex-col gap-1 text-sm font-medium">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                className="block rounded-md px-3 py-2 text-zinc-600 transition-colors hover:bg-black/[.04] hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-white/[.06] dark:hover:text-zinc-50"
                href={item.href}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
