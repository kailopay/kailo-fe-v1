import { directionLabels, type ConsumerDirection } from "./rate";

type RouteVisualProps = {
  direction: ConsumerDirection;
  sourceAmount: string;
  destinationAmount: string;
};

export function RouteVisual({ direction, sourceAmount, destinationAmount }: RouteVisualProps): React.ReactElement {
  const labels = directionLabels(direction);
  const accent = direction === "buy" ? "coral" : "aqua";

  return (
    <div
      aria-label={`${labels.source} to ${labels.destination} route`}
      className={`rounded-[28px] border p-5 sm:p-6 ${accent === "coral" ? "border-coral/35 bg-coral-tint" : "border-aqua/35 bg-aqua-tint"}`}
    >
      <div className="flex items-center justify-between gap-4 text-xs font-bold tracking-[0.12em] text-ink-2">
        <span>{labels.source}</span>
        <span className="flex items-center gap-2">
          <span aria-hidden className={`h-2 w-2 rounded-full ${accent === "coral" ? "bg-coral" : "bg-aqua"}`} />
          route
        </span>
        <span>{labels.destination}</span>
      </div>
      <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-end gap-3">
        <div className="min-w-0">
          <p className="truncate text-2xl font-bold tracking-[-0.04em] text-ink sm:text-3xl">{sourceAmount || "0"}</p>
          <p className="mt-1 text-sm font-semibold text-ink-2">{labels.source}</p>
        </div>
        <span aria-hidden className={`pb-5 text-2xl font-bold ${accent === "coral" ? "text-coral-deep" : "text-aqua-deep"}`}>→</span>
        <div className="min-w-0 text-right">
          <p className="truncate text-2xl font-bold tracking-[-0.04em] text-ink sm:text-3xl">{destinationAmount || "0"}</p>
          <p className="mt-1 text-sm font-semibold text-ink-2">{labels.destination}</p>
        </div>
      </div>
    </div>
  );
}
