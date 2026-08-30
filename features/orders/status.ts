import type { OrderStatus } from "@/lib/api/types";

export type StatusStyle = {
  /** Pill background and text for this state. */
  pill: string;
  /** One-line meaning shown beside the pill. */
  note: string;
};

const statusStyles: Record<OrderStatus, StatusStyle> = {
  created: {
    pill: "bg-sky-tint text-sky-deep",
    note: "Preparing the checkout. This can also mean the payment provider outcome is being reconciled.",
  },
  payment_pending: {
    pill: "bg-sea-tint text-sea-deep",
    note: "Checkout ready. Pay before the quote window closes.",
  },
  payment_confirmed: {
    pill: "bg-sea-tint text-sea-deep",
    note: "Payment confirmed. The Stellar transfer is starting.",
  },
  stellar_processing: {
    pill: "bg-orchid-tint text-orchid-deep",
    note: "Sending your XLM on Stellar testnet. This is usually brief.",
  },
  completed: {
    pill: "bg-sun-tint text-brass-text",
    note: "Done. Your XLM is on Stellar testnet.",
  },
  expired: {
    pill: "bg-sun-tint text-sun-deep",
    note: "Unpaid past the quote window. Start a new order if you still want to buy.",
  },
  payment_failed: {
    pill: "bg-sun-tint text-sun-deep",
    note: "The checkout was permanently rejected. Start a new order.",
  },
  stellar_failed: {
    pill: "bg-sun-tint text-sun-deep",
    note: "Paid, but the transfer failed. Support will resolve it. Do not pay again.",
  },
  cancelled: {
    pill: "bg-paper-recess text-ink-3",
    note: "This order is no longer active.",
  },
  asset_pending: {
    pill: "bg-aqua-tint text-aqua-deep",
    note: "Send the exact XLM amount to the sandbox deposit address before expiry.",
  },
  asset_received: {
    pill: "bg-aqua-tint text-aqua-deep",
    note: "The sandbox received your XLM and is preparing the payout.",
  },
  asset_invalid: {
    pill: "bg-sun-tint text-sun-deep",
    note: "The received asset did not match the quoted deposit instructions.",
  },
  retirement_processing: {
    pill: "bg-orchid-tint text-orchid-deep",
    note: "The received XLM is being retired on Stellar testnet.",
  },
  withdrawal_processing: {
    pill: "bg-orchid-tint text-orchid-deep",
    note: "The sandbox is preparing the simulated IDR payout.",
  },
  retirement_failed: {
    pill: "bg-sun-tint text-sun-deep",
    note: "The sandbox could not retire the received XLM. Keep the order for support.",
  },
  withdrawal_failed: {
    pill: "bg-sun-tint text-sun-deep",
    note: "The payout simulation failed. Keep the order for support.",
  },
};

export function statusStyle(status: OrderStatus): StatusStyle {
  return statusStyles[status];
}

export const ACTIVE_STATUSES: readonly OrderStatus[] = [
  "created",
  "payment_pending",
  "payment_confirmed",
  "stellar_processing",
  "asset_pending",
  "asset_received",
  "retirement_processing",
  "withdrawal_processing",
];

export function isActiveStatus(status: OrderStatus): boolean {
  return ACTIVE_STATUSES.includes(status);
}

export const TERMINAL_STATUSES: readonly OrderStatus[] = [
  "completed",
  "expired",
  "payment_failed",
  "stellar_failed",
  "cancelled",
];

export function isTerminalStatus(status: OrderStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}
