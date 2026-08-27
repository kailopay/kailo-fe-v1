import Link from "next/link";
import { cookies } from "next/headers";
import { SandboxBadges } from "@/components/sandbox-badges";
import { SESSION_COOKIE_NAME } from "@/lib/api/client";

const steps = [
  { number: "01", title: "Pick your direction", body: "Buy XLM with rupiah, or sell XLM for a sandbox payout." },
  { number: "02", title: "Read the route", body: "Your amount, destination, and payment method stay in view." },
  { number: "03", title: "See the rate at checkout", body: "The backend secures the exact rate when the order is created." },
] as const;

export default async function Home() {
  const cookieStore = await cookies();
  const hasSession = cookieStore.has(SESSION_COOKIE_NAME);

  return (
    <main className="flex flex-1 flex-col bg-milk">
      <header className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
        <Link className="text-xl font-bold tracking-[-0.05em] text-ink" href="/">KailoPay</Link>
        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          <SandboxBadges />
          <Link className="rounded-full bg-ink px-4 py-2 text-sm font-bold text-paper transition-colors hover:bg-ink-deep" href={hasSession ? "/dashboard" : "/login"}>
            {hasSession ? "Open app" : "Sign in"}
          </Link>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 pb-16 pt-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.82fr)] lg:gap-16 lg:pb-24 lg:pt-20">
        <div className="max-w-2xl">
          <h1 className="text-balance text-[clamp(3.2rem,7vw,6.5rem)] font-bold leading-[0.92] tracking-[-0.08em] text-ink">Rupiah in, testnet XLM out, or back again.</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-ink-2">KailoPay is a friendly Indonesia-first exchange for one clear corridor. Buy testnet XLM with QRIS or a BRI virtual account, or sell XLM through a simulated IDR payout.</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link className="inline-flex h-12 items-center justify-center rounded-2xl bg-ink px-6 text-sm font-bold text-paper transition-colors hover:bg-ink-deep" href={hasSession ? "/dashboard" : "/login"}>
              {hasSession ? "Continue to your route" : "Start with KailoPay"}
            </Link>
            <Link className="inline-flex h-12 items-center justify-center rounded-2xl bg-white px-6 text-sm font-semibold text-ink-2 transition-colors hover:text-ink" href="#how-it-works">
              How it works
            </Link>
          </div>
          <p className="mt-5 max-w-lg text-sm leading-6 text-ink-3">Sandbox only. Stellar Testnet is the selected network while the consumer order bridge is being completed.</p>
        </div>

        <ExchangePreview />
      </section>

      <section className="border-t border-line/75" id="how-it-works">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
          <div className="max-w-2xl">
            <h2 className="text-balance text-3xl font-bold tracking-[-0.06em] text-ink sm:text-4xl">The corridor stays easy to read.</h2>
            <p className="mt-4 text-base leading-7 text-ink-2">The consumer experience keeps the important decision close to the action, with the technical workspace one step away.</p>
          </div>
          <ol className="mt-10 grid border-y border-line sm:grid-cols-3 sm:divide-x sm:divide-line">
            {steps.map((step) => (
              <li className="flex gap-4 py-6 sm:block sm:px-6 sm:first:pl-0 sm:last:pr-0" key={step.number}>
                <span className="tnum text-sm font-bold text-ink-3">{step.number}</span>
                <div>
                  <h3 className="text-base font-bold text-ink sm:mt-7">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink-2">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-6 sm:px-8 lg:py-10">
        <div className="grid gap-8 rounded-[32px] bg-lilac-tint p-6 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-[-0.06em] text-ink">When you need the controls, open the developer door.</h2>
            <p className="mt-4 text-base leading-7 text-lilac-deep/85">Developer Mode is separate by design. Create a test key, run the live Week 2 order API, and inspect every settlement state without crowding the consumer route.</p>
          </div>
          <Link className="inline-flex h-12 items-center justify-center rounded-2xl bg-ink px-6 text-sm font-bold text-paper transition-colors hover:bg-ink-deep" href={hasSession ? "/developer" : "/login"}>
            {hasSession ? "Open Developer Mode" : "Sign in to build"}
          </Link>
        </div>
      </section>

      <footer className="mt-auto border-t border-line/75">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-sm sm:px-8">
          <p className="font-semibold text-ink-2">KailoPay</p>
          <p className="text-xs text-ink-3">Sandbox build, Stellar Testnet only, no real money moves</p>
        </div>
      </footer>
    </main>
  );
}

function ExchangePreview(): React.ReactElement {
  return (
    <div aria-label="Preview of the KailoPay buy exchange" className="rounded-[32px] bg-coral-tint p-5 shadow-[0_24px_70px_rgba(15,30,56,0.1)] sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-[-0.05em] text-ink">Buy XLM</h2>
          <p className="mt-1 text-sm text-ink-2">A calm start for your route.</p>
        </div>
        <span className="rounded-full bg-coral/35 px-3 py-1.5 text-xs font-bold text-coral-deep">Sandbox</span>
      </div>

      <div className="mt-6 rounded-[24px] bg-white/65 p-4 sm:p-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-ink-2">You pay</p>
            <p className="tnum mt-2 text-4xl font-bold tracking-[-0.07em] text-ink">500.000</p>
          </div>
          <span className="rounded-xl bg-white/80 px-3 py-2 text-sm font-bold text-ink-2">IDR</span>
        </div>
        <div className="my-5 flex items-center gap-2" aria-hidden="true">
          <span className="h-1.5 flex-1 rounded-full bg-coral/50" />
          <span className="h-8 w-8 shrink-0 rounded-full bg-white ring-4 ring-coral/25" />
          <span className="h-1.5 flex-1 rounded-full bg-coral/50" />
        </div>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-ink-2">You receive</p>
            <p className="mt-2 text-2xl font-bold tracking-[-0.05em] text-ink">Rate at checkout</p>
          </div>
          <span className="rounded-xl bg-white/80 px-3 py-2 text-sm font-bold text-ink-2">XLM</span>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4 border-t border-coral/30 pt-4 text-xs font-semibold text-coral-deep">
        <span>QRIS or BRI virtual account</span>
        <span>Stellar Testnet</span>
      </div>
    </div>
  );
}
