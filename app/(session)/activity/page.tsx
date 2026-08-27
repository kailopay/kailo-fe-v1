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
      <h1 className="kp-page-heading">Your activity</h1>
      <p className="mt-5 max-w-xl text-base leading-7 text-ink-2 sm:text-lg">
        A simple record of money moving between rupiah and Stellar testnet.
      </p>

      <section className="kp-order-block mt-10" aria-labelledby="activity-empty-title">
        <p className="text-sm font-bold text-coral-deep">A quiet starting point</p>
        <h2 className="mt-3 text-2xl font-bold tracking-[-0.04em]" id="activity-empty-title">Your first exchange starts here</h2>
        <p className="mt-3 max-w-lg text-sm leading-7 text-ink-2">
          Consumer order sessions are the next bridge to the Week 2 order API.
          You can still create and follow a real sandbox order from Developer
          Mode, where the test key and technical order history live.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="kp-primary-button" href="/buy">
            Start a buy exchange
          </Link>
          <Link className="kp-secondary-button" href="/developer/playground">
            Open Developer Mode
          </Link>
        </div>
      </section>
    </div>
  );
}
