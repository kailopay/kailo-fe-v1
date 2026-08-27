import type { Quote } from "@/lib/api/types";
import { rateLabel, type ConsumerDirection } from "./rate";

type LiveRateStripProps = {
  direction: ConsumerDirection;
  quote: Quote | null;
};

export function LiveRateStrip({ direction, quote }: LiveRateStripProps): React.ReactElement {
  const state = rateLabel(quote);

  return (
    <section className="rounded-2xl border border-mango/60 bg-mango-tint px-4 py-3" aria-label={`${direction === "buy" ? "Buy" : "Sell"} exchange rate`}>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex items-center gap-2">
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-mango" />
          <p className="text-xs font-bold tracking-[0.08em] text-mango-deep">{quote === null ? "LIVE RATE" : "LOCKED RATE"}</p>
        </div>
        <p className="text-xs font-medium text-mango-deep">{state.label}</p>
      </div>
      <p className="mt-2 text-xl font-bold tracking-[-0.02em] text-ink">
        {quote === null ? "Live rate appears at checkout" : `1 XLM = ${quote.adjusted_rate} IDR`}
      </p>
      <p className="mt-1 text-xs leading-5 text-mango-deep">{state.detail}</p>
    </section>
  );
}
