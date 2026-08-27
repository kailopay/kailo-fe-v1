import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/api/server";

export const metadata: Metadata = {
  title: "Activity",
};

export default async function ActivityPage() {
  const user = await getServerSession();
  if (user === null) redirect("/login");

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8 lg:py-12">
      <h1 className="text-[clamp(2.6rem,7vw,4.5rem)] font-bold leading-[0.96] tracking-[-0.075em] text-ink">Your activity</h1>
      <p className="mt-5 max-w-xl text-base leading-7 text-ink-2 sm:text-lg">
        A simple record of money moving between rupiah and Stellar testnet.
      </p>

      <section className="mt-10 rounded-[28px] bg-white p-6 shadow-[0_20px_55px_rgba(15,30,56,0.07)] sm:p-8" aria-labelledby="activity-empty-title">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lilac-tint text-lilac-deep" aria-hidden="true">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 28 28">
            <path d="M6 20.5h16M8 17V9.5h5V17m2 0V5.5h5V17" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        </div>
        <h2 className="mt-6 text-2xl font-bold tracking-[-0.04em]" id="activity-empty-title">Your first exchange starts here</h2>
        <p className="mt-3 max-w-lg text-sm leading-7 text-ink-2">
          Consumer order sessions are the next bridge to the Week 2 order API.
          You can still create and follow a real sandbox order from Developer
          Mode, where the test key and technical order history live.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="inline-flex h-11 items-center rounded-xl bg-coral px-5 text-sm font-bold text-ink hover:bg-coral/85" href="/buy">
            Start a buy exchange
          </Link>
          <Link className="inline-flex h-11 items-center rounded-xl border border-line-strong px-5 text-sm font-semibold text-ink-2 hover:border-ink hover:text-ink" href="/developer/playground">
            Open Developer Mode
          </Link>
        </div>
      </section>
    </div>
  );
}
