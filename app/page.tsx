import { cookies } from "next/headers";
import Link from "next/link";
import { SandboxBadges } from "@/components/sandbox-badges";
import { RouteVisual } from "@/features/consumer/route-visual";
import { SESSION_COOKIE_NAME } from "@/lib/api/client";

export default async function Home(): Promise<React.ReactElement> {
  const cookieStore = await cookies();
  const hasSession = cookieStore.has(SESSION_COOKIE_NAME);
  const appHref = hasSession ? "/dashboard" : "/login";

  return (
    <main className="flex flex-1 flex-col bg-paper">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-5 px-5 py-5 sm:px-8">
        <Link className="kp-brand" href="/">KailoPay</Link>
        <div className="flex items-center gap-5">
          <SandboxBadges />
          <Link className="kp-primary-button" href={appHref}>{hasSession ? "Open app" : "Sign in"}</Link>
        </div>
      </header>

      <section className="kp-landing-hero mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 lg:py-14">
        <div className="max-w-xl">
          <p className="text-sm font-bold text-coral-deep">The IDR and XLM corridor</p>
          <h1 className="kp-display mt-4">Buy XLM with rupiah.</h1>
          <p className="kp-copy mt-7 max-w-lg">KailoPay gives you one clear sandbox route for Stellar. Start with rupiah, choose a testnet destination, and see the locked quote when the order is created.</p>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Link className="kp-primary-button" href={appHref}>{hasSession ? "Continue to the exchange" : "Start with KailoPay"}</Link>
            <a className="kp-action-link" href="#developer-note">For developers</a>
          </div>
          <p className="mt-6 max-w-md text-xs leading-5 text-ink-3">Sandbox only. No real IDR or XLM moves.</p>
        </div>

        <LandingExchange appHref={appHref} />
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 pb-14 sm:px-8 lg:pb-20">
        <div className="kp-info-strip">
          <div className="kp-info-item">
            <p className="kp-info-label">Direction</p>
            <p className="kp-info-value">IDR to XLM and back</p>
          </div>
          <div className="kp-info-item">
            <p className="kp-info-label">Payment</p>
            <p className="kp-info-value">QRIS or BRI virtual account</p>
          </div>
          <div className="kp-info-item">
            <p className="kp-info-label">Network</p>
            <p className="kp-info-value">Stellar Testnet</p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 pb-16 sm:px-8 lg:pb-24" id="developer-note">
        <div className="kp-landing-note">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold tracking-[-0.035em] text-ink sm:text-3xl">The technical workspace stays separate.</h2>
            <p className="kp-copy mt-3 text-sm">When you need test keys, request ids, order polling, or raw API responses, Developer Mode gives those tools their own room.</p>
          </div>
          <Link className="kp-action-link self-start lg:mt-1" href={hasSession ? "/developer" : "/login"}>{hasSession ? "Open Developer Mode" : "Sign in to build"}</Link>
        </div>
      </section>

      <footer className="mt-auto border-t border-line">
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
    <div aria-label="Preview of the KailoPay buy exchange" className="kp-landing-composer">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-ink">Buy XLM</p>
          <p className="mt-1 text-sm text-ink-3">A sandbox exchange preview</p>
        </div>
        <span className="kp-network-note">Testnet</span>
      </div>

      <div className="mt-8">
        <RouteVisual direction="buy" />
      </div>

      <div className="mt-8 border-t border-line">
        <div className="kp-preview-row">
          <span className="text-sm font-bold text-ink-2">You pay</span>
          <span className="kp-preview-amount">500.000 <span className="kp-currency">IDR</span></span>
        </div>
        <div className="kp-preview-row">
          <span className="text-sm font-bold text-ink-2">You receive</span>
          <span className="kp-preview-amount text-ink-3">Rate at checkout <span className="kp-currency">XLM</span></span>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4 border-t border-line pt-5">
        <p className="max-w-[16rem] text-xs leading-5 text-ink-3">The destination and payment method stay visible before the handoff.</p>
        <Link className="kp-action-link shrink-0" href={appHref}>Open exchange</Link>
      </div>
    </div>
  );
}
