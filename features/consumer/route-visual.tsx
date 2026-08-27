import { directionLabels, type ConsumerDirection } from "./rate";

type RouteVisualProps = {
  direction: ConsumerDirection;
};

export function RouteVisual({ direction }: RouteVisualProps): React.ReactElement {
  const labels = directionLabels(direction);
  const isBuy = direction === "buy";
  const tone = isBuy
    ? {
        chip: "bg-coral/35 text-coral-deep",
        rail: "bg-coral/50",
        centre: "ring-coral/25",
      }
    : {
        chip: "bg-aqua/35 text-aqua-deep",
        rail: "bg-aqua/50",
        centre: "ring-aqua/25",
      };

  return (
    <div aria-label={`${labels.source} to ${labels.destination} route`} className="rounded-[24px] bg-white/55 p-4 sm:p-5">
      <div className="flex items-center gap-3 sm:gap-5">
        <div className="min-w-0">
          <span className={`inline-flex rounded-xl px-3 py-2 text-sm font-bold ${tone.chip}`}>{labels.source}</span>
          <p className="mt-2 truncate text-xs font-semibold text-ink-2">{isBuy ? "Your rupiah" : "Your XLM"}</p>
        </div>
        <div aria-hidden className="relative flex min-w-[56px] flex-1 items-center">
          <span className={`h-1.5 flex-1 rounded-full ${tone.rail}`} />
          <span className={`mx-[-0.2rem] flex h-8 w-8 shrink-0 rounded-full bg-white ring-4 ${tone.centre}`} />
          <span className={`h-1.5 flex-1 rounded-full ${tone.rail}`} />
        </div>
        <div className="min-w-0 text-right">
          <span className={`inline-flex rounded-xl px-3 py-2 text-sm font-bold ${tone.chip}`}>{labels.destination}</span>
          <p className="mt-2 truncate text-xs font-semibold text-ink-2">{isBuy ? "Stellar testnet" : "Sandbox payout"}</p>
        </div>
      </div>
    </div>
  );
}
