import Link from "next/link";
import { cookies } from "next/headers";
import { SandboxBadges } from "@/components/sandbox-badges";
import { StarCompass } from "@/components/star-compass";
import { SESSION_COOKIE_NAME } from "@/lib/api/client";

const proofFigures = [
  {
    claim: "The quote is locked before you pay.",
    detail:
      "Rate, adjusted rate, and spread in basis points are fixed at order creation and printed on every order. The quote window bounds the payment, and expiry releases the reserved XLM automatically.",
    artifact: (
      <div className="rounded-[20px] border border-line bg-white px-5 py-4">
        <div className="flex items-baseline justify-between border-b border-line pb-3">
          <span className="font-mono text-xs text-ink-3">order</span>
          <span className="font-mono text-xs text-ink-3">synthetic demo</span>
        </div>
        <dl className="divide-y divide-line font-mono text-sm tnum">
          <div className="flex items-baseline justify-between py-3">
            <dt className="text-ink-2">fiat</dt>
            <dd className="text-ink">100000 idr</dd>
          </div>
          <div className="flex items-baseline justify-between py-3">
            <dt className="text-ink-2">asset</dt>
            <dd className="text-ink">40.0000000 xlm</dd>
          </div>
          <div className="flex items-baseline justify-between py-3">
            <dt className="text-ink-2">rate · spread</dt>
            <dd className="text-ink">2500 · 0 bps</dd>
          </div>
          <div className="flex items-baseline justify-between py-3">
            <dt className="text-ink-2">quote window</dt>
            <dd className="text-brass-text">05:00</dd>
          </div>
        </dl>
      </div>
    ),
  },
  {
    claim: "Money crosses the wire as strings.",
    detail:
      "Amounts are decimal strings end to end: minor-unit IDR in, XLM with exactly seven fraction digits out. The interface never converts a value to a floating-point number.",
    artifact: (
      <div className="rounded-[20px] border border-line bg-paper-recess px-5 py-4 font-mono text-sm">
        <div className="flex items-baseline justify-between border-b border-line pb-3 text-xs">
          <span className="text-ink-3">wire format</span>
          <span className="text-ink-3">synthetic values</span>
        </div>
        <p className="mt-3 text-ink-3 text-xs">request</p>
        <p className="mt-1 text-ink">{`{ "amount_minor": "100000" }`}</p>
        <p className="mt-4 text-ink-3 text-xs">response</p>
        <p className="mb-3 mt-1 text-ink">
          {`{ "amount": "40.0000000" }`} <span className="text-brass-text">kept as string</span>
        </p>
      </div>
    ),
  },
  {
    claim: "Your key appears exactly once.",
    detail:
      "Creating an API key returns the full pk_test string a single time. The server stores only a hash; the interface shows the reveal once, then never again.",
    artifact: (
      <div className="rounded-[20px] border border-line bg-white px-5 py-4">
        <div className="flex items-baseline justify-between border-b border-line pb-3">
          <span className="font-mono text-xs text-ink-3">api key</span>
          <span className="font-mono text-xs text-ink-3">synthetic demo</span>
        </div>
        <p className="break-all py-3 font-mono text-sm text-ink">
          pk_test_ab12cd34ef56<span className="text-ink-3">················</span>
        </p>
        <p className="border-t border-line pt-3 font-mono text-xs text-ink-3">
          copy now · shown once · the server keeps only the hash
        </p>
      </div>
    ),
  },
] as const;

const plateStates = [
  { label: "created", note: "checkout being established", numeral: "text-sky" },
  { label: "payment_pending", note: "qr or va ready", numeral: "text-sea" },
  { label: "stellar_processing", note: "transfer in flight", numeral: "text-orchid" },
  { label: "completed", note: "explorer link on the order", numeral: "text-gold" },
] as const;

const terminalStates = [
  { label: "expired", note: "unpaid past the quote window" },
  { label: "payment_failed", note: "checkout rejected" },
  { label: "stellar_failed", note: "paid · support resolves it" },
] as const;

export default async function Home() {
  const cookieStore = await cookies();
  const hasSession = cookieStore.has(SESSION_COOKIE_NAME);

  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Link className="text-lg font-semibold tracking-tight" href="/">
          KailoPay
        </Link>
        <div className="flex items-center gap-4">
          <span className="hidden font-mono text-xs text-ink-3 sm:block">v0.1.0</span>
          <SandboxBadges />
          <Link
            className="rounded-full bg-ink px-4 py-1.5 text-sm font-medium text-paper transition-colors hover:bg-ink-deep"
            href={hasSession ? "/profile" : "/login"}
          >
            {hasSession ? "Signed in" : "Sign in"}
          </Link>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-6xl gap-10 px-6 pt-10 pb-20 lg:grid-cols-[2fr_1fr] lg:items-center lg:pt-16">
        <figure className="m-0">
          <StarCompass />
          <figcaption className="mt-2 font-mono text-xs text-ink-3">
            fig. 1 · the corridor plotted, synthetic route for illustration
          </figcaption>
        </figure>
        <div className="max-w-xl">
          <h1 className="text-balance text-5xl font-semibold leading-[1.05] tracking-[-0.02em] lg:text-6xl">
            Rupiah in. Testnet XLM out.
          </h1>
          <p className="mt-6 max-w-[68ch] text-lg leading-8 text-ink-2">
            KailoPay is an Indonesia-first on-ramp for Stellar, proving one
            corridor in sandbox form: pay rupiah through QRIS or a BRI virtual
            account and watch testnet XLM arrive at your address. No real
            money moves, ever.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              className="flex h-12 items-center justify-center rounded-xl bg-ink px-7 font-medium text-paper transition-colors hover:bg-ink-deep"
              href={hasSession ? "/profile" : "/login"}
            >
              {hasSession ? "Continue to your profile" : "Sign in to the playground"}
            </Link>
            <Link
              className="flex h-12 items-center justify-center rounded-xl border border-line-strong px-7 font-medium text-ink transition-colors hover:border-ink"
              href="#how-it-settles"
            >
              How it settles
            </Link>
          </div>
          <p className="mt-6 font-mono text-xs leading-5 text-ink-3">
            developer sandbox · orders need a pk_test key · sessions are
            self-hosted, held server-side
          </p>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto grid w-full max-w-6xl gap-x-12 gap-y-16 px-6 py-20 lg:grid-cols-3">
          {proofFigures.map((figure) => (
            <article key={figure.claim} className="flex flex-col gap-5">
              <h2 className="text-balance text-2xl font-semibold tracking-[-0.01em]">
                {figure.claim}
              </h2>
              <p className="text-[15px] leading-7 text-ink-2">{figure.detail}</p>
              <div className="mt-auto">{figure.artifact}</div>
            </article>
          ))}
        </div>
      </section>

      <section id="how-it-settles" className="mx-auto w-full max-w-6xl px-6 py-6">
        <div className="rounded-[28px] bg-ink-plate px-6 py-16 sm:px-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-balance text-3xl font-semibold tracking-[-0.01em] text-paper-on-plate">
              Every state is named, bounded, and final.
            </h2>
            <SandboxBadges onPlate />
          </div>
          <p className="mt-5 max-w-[70ch] text-[15px] leading-7 text-paper-on-plate/70">
            An order travels one way. There is no cancel today, so the
            interface says exactly where money sits: polling the order, not
            guessing, is the intended integration. Each state owns its color,
            on this plate and everywhere the order travels.
          </p>
          <ol className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {plateStates.map((state, i) => (
              <li key={state.label} className="rounded-2xl bg-ink-deep p-5">
                <p className={`font-mono text-xs ${state.numeral}`}>
                  {String(i + 1).padStart(2, "0")}
                </p>
                <p className="mt-3 font-mono text-sm text-paper-on-plate">{state.label}</p>
                <p className="mt-2 text-sm leading-6 text-paper-on-plate/60">{state.note}</p>
              </li>
            ))}
          </ol>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {terminalStates.map((state) => (
              <p key={state.label} className="text-sm leading-6">
                <span className="font-mono text-sun">{state.label}</span>
                <span className="text-paper-on-plate/50"> · {state.note}</span>
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-6">
        <div className="max-w-2xl rounded-[28px] bg-cloud px-6 py-14 sm:px-12">
          <h2 className="text-balance text-3xl font-semibold tracking-[-0.01em]">
            One corridor. Thirty days. No real money.
          </h2>
          <p className="mt-5 text-[15px] leading-7 text-ink-2">
            This release proves the path: a developer creates an IDR to XLM
            order, pays it in the Xendit sandbox, and the treasury sends real
            testnet XLM to a real testnet address. Off-ramp, webhooks, and
            production settlement come later, and nothing here pretends
            otherwise.
          </p>
          <div className="mt-8">
            <Link
              className="inline-flex h-12 items-center justify-center rounded-xl bg-ink px-7 font-medium text-paper transition-colors hover:bg-ink-deep"
              href={hasSession ? "/profile" : "/login"}
            >
              {hasSession ? "Continue to your profile" : "Sign in"}
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-6">
          <p className="text-sm text-ink-2">KailoPay</p>
          <p className="font-mono text-xs text-ink-3">
            sandbox build · not financial infrastructure · settles on stellar
            testnet only
          </p>
        </div>
      </footer>
    </div>
  );
}
