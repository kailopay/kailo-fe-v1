import type { Quote } from "@/lib/api/types";
import { rateLabel, type ConsumerDirection } from "./rate";

type LiveRateStripProps = {
  direction: ConsumerDirection;
  quote: Quote | null;
};

export function LiveRateStrip({ direction, quote }: LiveRateStripProps): React.ReactElement {
  const state = rateLabel(quote);
  const isSell = direction === "sell";

  return (
    <section className="kp-status-line" aria-label={`${isSell ? "Sell" : "Buy"} exchange rate`}>
      <div className="flex min-w-0 items-center gap-3">
        <span aria-hidden className="kp-status-mark" data-tone={isSell ? "sell" : "buy"} />
        <div className="min-w-0">
          <p className="text-sm font-bold text-ink">{state.label}</p>
          <p className="mt-1 text-xs leading-5 text-ink-3">{state.detail}</p>
        </div>
      </div>
      <p className="tnum shrink-0 text-right text-sm font-bold text-ink">
        {quote === null ? "Shown at checkout" : `1 XLM = ${quote.adjusted_rate} IDR`}
      </p>
    </section>
  );
}
