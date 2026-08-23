import Link from "next/link";
import { SandboxBadges } from "@/components/sandbox-badges";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Link className="text-lg font-semibold tracking-tight" href="/">
          KailoPay
        </Link>
        <SandboxBadges />
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 pb-16">
        {children}
      </main>
    </div>
  );
}
