import { cookies } from "next/headers";
import Link from "next/link";
import { SandboxBadges } from "@/components/sandbox-badges";
import { SESSION_COOKIE_NAME } from "@/lib/api/client";

export default async function Home(): Promise<React.ReactElement> {
  const cookieStore = await cookies();
  const hasSession = cookieStore.has(SESSION_COOKIE_NAME);
  const appHref = hasSession ? "/dashboard" : "/login";

  return (
    <main className="kp-home-shell flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-5 px-5 py-5 sm:px-8">
        <Link className="kp-brand" href="/">KailoPay</Link>
        <div className="flex items-center gap-5">
          <SandboxBadges />
          <Link className="kp-primary-button" href={appHref}>{hasSession ? "Open app" : "Sign in"}</Link>
        </div>
      </header>

      <section className="kp-home-main mx-auto w-full max-w-6xl px-5 sm:px-8" aria-labelledby="home-title">
        <div className="kp-home-intro">
          <h1 className="kp-home-title" id="home-title">Buy and sell XLM with IDR.</h1>
          <p className="kp-home-lede mt-6">A straightforward sandbox exchange for the Stellar testnet. Start with a direction, enter an amount, and keep the destination in view.</p>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Link className="kp-primary-button" href={appHref}>{hasSession ? "Continue to exchange" : "Start with KailoPay"}</Link>
            <a className="kp-action-link" href="#developer-note">For developers</a>
          </div>
          <p className="kp-home-safety mt-6">Sandbox only. No real IDR or XLM moves.</p>
        </div>

        <LandingExchange appHref={appHref} />
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 pb-14 sm:px-8 lg:pb-20">
        <div className="kp-home-facts">
          <div className="kp-home-fact">
            <p className="kp-home-fact-label">Direction</p>
            <p className="kp-home-fact-value">IDR to XLM and back</p>
          </div>
          <div className="kp-home-fact">
            <p className="kp-home-fact-label">Payment</p>
            <p className="kp-home-fact-value">QRIS or BRI virtual account</p>
          </div>
          <div className="kp-home-fact">
            <p className="kp-home-fact-label">Network</p>
            <p className="kp-home-fact-value">Stellar Testnet</p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 pb-16 sm:px-8 lg:pb-24" id="developer-note">
        <div className="kp-home-developer">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold tracking-[-0.035em] text-ink sm:text-3xl">Building with KailoPay?</h2>
            <p className="kp-copy mt-3 text-sm">Test keys, request ids, order polling, and raw API responses live in the separate Developer Mode workspace.</p>
          </div>
          <Link className="kp-action-link self-start lg:mt-1" href={hasSession ? "/developer" : "/login"}>{hasSession ? "Open Developer Mode" : "Sign in to build"}</Link>
        </div>
      </section>

      <footer className="mt-auto bg-paper/55">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-sm sm:px-8">
          <p className="font-bold text-ink">KailoPay</p>
          <p className="text-xs text-ink-3">Sandbox build, Stellar Testnet only</p>
        </div>
      </footer>
    </main>
  );
}

function LandingExchange({ appHref }: { appHref: string }): React.ReactElement {
  return (
    <div aria-label="Preview of the KailoPay buy exchange" className="kp-home-preview">
      <div className="kp-home-preview-header">
        <div>
          <p className="kp-home-preview-label">Quick exchange</p>
          <h2 className="kp-home-preview-title">Buy XLM</h2>
          <p className="mt-1 text-sm text-ink-3">IDR to Stellar Testnet</p>
        </div>
        <span className="kp-network-note">Testnet</span>
      </div>

      <div className="kp-home-preview-amount">
        <div>
          <span className="kp-home-preview-label">You pay</span>
          <span className="kp-home-preview-unit">IDR</span>
        </div>
        <strong>500.000</strong>
      </div>

      <p className="kp-home-preview-transition">Then</p>

      <div className="kp-home-preview-amount" data-tone="receive">
        <div>
          <span className="kp-home-preview-label">You receive</span>
          <span className="kp-home-preview-unit">XLM</span>
        </div>
        <strong>Rate at checkout</strong>
      </div>

      <div className="kp-home-preview-footer">
        <p className="max-w-[13rem] text-xs leading-5 text-ink-3">The live rate is locked when the order is created.</p>
        <Link className="kp-action-link shrink-0" href={appHref}>Open exchange</Link>
      </div>
    </div>
  );
}
