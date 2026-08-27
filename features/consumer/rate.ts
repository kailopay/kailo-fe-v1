import type { Quote } from "@/lib/api/types";

export type ConsumerDirection = "buy" | "sell";

export type DirectionLabels = {
  source: "IDR" | "XLM";
  destination: "IDR" | "XLM";
};

export type RateLabel = {
  label: string;
  detail: string;
};

export function directionLabels(direction: ConsumerDirection): DirectionLabels {
  return direction === "buy"
    ? { source: "IDR", destination: "XLM" }
    : { source: "XLM", destination: "IDR" };
}

export function rateLabel(quote: Quote | null, now = Date.now()): RateLabel {
  if (quote === null) {
    return {
      label: "Rate appears when you continue",
      detail: "The backend secures the quote when the order is created",
    };
  }

  const expiry = Date.parse(quote.expires_at);
  if (Number.isNaN(expiry) || expiry <= now) {
    return {
      label: "Rate needs refreshing",
      detail: "Start again to secure a new quote",
    };
  }

  const time = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(expiry);
  return { label: "Rate locked", detail: `Valid until ${time}` };
}
