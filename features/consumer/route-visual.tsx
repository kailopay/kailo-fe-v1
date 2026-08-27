import { directionLabels, type ConsumerDirection } from "./rate";

type RouteVisualProps = {
  direction: ConsumerDirection;
};

export function RouteVisual({ direction }: RouteVisualProps): React.ReactElement {
  const labels = directionLabels(direction);
  const isBuy = direction === "buy";

  return (
    <div
      aria-label={`${labels.source} to ${labels.destination} route`}
      className="kp-route-visual"
    >
      <div>
        <p className="kp-route-label">{labels.source}</p>
        <p className="kp-route-caption">{isBuy ? "Rupiah" : "Your balance"}</p>
      </div>
      <div aria-hidden className="kp-route-track" data-tone={isBuy ? "buy" : "sell"}>
        <span className="kp-route-node" data-tone={isBuy ? "buy" : "sell"} />
      </div>
      <div className="text-right">
        <p className="kp-route-label">{labels.destination}</p>
        <p className="kp-route-caption">{isBuy ? "Stellar Testnet" : "Sandbox payout"}</p>
      </div>
    </div>
  );
}
