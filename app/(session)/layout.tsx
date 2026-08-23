import Link from "next/link";
import { redirect } from "next/navigation";
import { SandboxBadges } from "@/components/sandbox-badges";
import { SignOutButton } from "@/features/auth/sign-out-button";
import { getServerSession } from "@/lib/api/server";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/profile", label: "Profile" },
  { href: "/developer", label: "Developer" },
  { href: "/developer/playground", label: "Playground" },
] as const;

export default async function SessionLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerSession();
  if (user === null) redirect("/login");

  return (
    <div className="flex flex-1">
      <aside className="hidden w-60 shrink-0 flex-col gap-6 border-r border-line p-5 md:flex">
        <Link className="text-lg font-semibold tracking-tight" href="/">
          KailoPay
        </Link>
        <SandboxBadges />
        <nav>
          <ul className="flex flex-col gap-1 text-sm font-medium">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  className="block rounded-lg px-3 py-2 text-ink-2 transition-colors hover:bg-paper-recess hover:text-ink"
                  href={item.href}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto flex flex-col gap-3 border-t border-line pt-4">
          <div>
            <p className="truncate text-sm font-medium">{user.display_name}</p>
            <p className="truncate text-xs text-ink-3">{user.email}</p>
          </div>
          <SignOutButton />
        </div>
      </aside>
      <main className="flex-1 p-8">
        <div className="md:hidden">
          <SandboxBadges />
        </div>
        {children}
      </main>
    </div>
  );
}
