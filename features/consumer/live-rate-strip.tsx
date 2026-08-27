import type { Quote } from "@/lib/api/types";
import { rateLabel, type ConsumerDirection } from "./rate";

type LiveRateStripProps = {
  direction: ConsumerDirection;
  quote: Quote | null;
};

export function LiveRateStrip({ direction, quote }: LiveRateStripProps): React.ReactElement {
  const state = rateLabel(quote);

  return (
    <section className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-y border-mango/45 py-4" aria-label={`${direction === "buy" ? "Buy" : "Sell"} exchange rate`}>
      <div className="flex items-start gap-3">
        <span aria-hidden className="mt-1 h-3 w-3 rounded-md bg-mango" />
        <div>
          <p className="text-sm font-bold text-ink">{quote === null ? "Live exchange rate" : "Locked exchange rate"}</p>
          <p className="mt-1 text-xs leading-5 text-mango-deep">{state.detail}</p>
        </div>
      </div>
      <p className="tnum text-right text-sm font-bold text-ink">
        {quote === null ? "Shown at checkout" : `1 XLM = ${quote.adjusted_rate} IDR`}
      </p>
    </section>
  );
}
