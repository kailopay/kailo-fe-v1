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
    <div className="mx-auto w-full max-w-4xl px-5 py-8 md:px-0 md:py-2">
      <p className="text-sm font-semibold text-ink-3">Your routes</p>
      <h1 className="mt-2 text-4xl font-bold tracking-[-0.06em] text-ink sm:text-5xl">Activity</h1>
      <p className="mt-3 max-w-xl text-base leading-7 text-ink-2">
        A simple record of money moving between rupiah and Stellar testnet.
      </p>

      <section className="mt-10 rounded-[28px] border border-line bg-white p-6 sm:p-8" aria-labelledby="activity-empty-title">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lilac-tint text-2xl text-lilac-deep" aria-hidden>
          ↗
        </div>
        <h2 className="mt-6 text-2xl font-bold tracking-[-0.04em]" id="activity-empty-title">Your first route starts here</h2>
        <p className="mt-3 max-w-lg text-sm leading-7 text-ink-2">
          Consumer sessions are being connected to the order API in this
          release. You can still create and follow a real sandbox order from
          Developer Mode, where the test key and technical order history live.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="inline-flex h-11 items-center rounded-xl bg-coral px-5 text-sm font-bold text-ink hover:bg-coral/85" href="/buy">
            Start a buy route
          </Link>
          <Link className="inline-flex h-11 items-center rounded-xl border border-line-strong px-5 text-sm font-semibold text-ink-2 hover:border-ink hover:text-ink" href="/developer/playground">
            Open Developer Mode
          </Link>
        </div>
      </section>
    </div>
  );
}
