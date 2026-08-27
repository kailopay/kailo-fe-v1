import type { OrderDirection, OrderStatus } from "@/lib/api/types";

export type RouteStepState = "complete" | "current" | "pending" | "failed";

export type RouteStep = {
  label: string;
  state: RouteStepState;
};

export type RouteStatusView = {
  title: string;
  detail: string;
  currentStep: string | null;
  canPayAgain: boolean;
  steps: readonly RouteStep[];
};

const offrampsStatuses: readonly OrderStatus[] = [
  "asset_pending",
  "asset_received",
  "asset_invalid",
  "retirement_processing",
  "withdrawal_processing",
  "retirement_failed",
  "withdrawal_failed",
];

export function routeStatus(input: { direction: OrderDirection; status: OrderStatus }): RouteStatusView {
  if (input.direction === "offramp") return offrampStatus(input.status);
  return onrampStatus(input.status);
}

export function isOfframpStatus(status: OrderStatus): boolean {
  return offrampsStatuses.includes(status);
}

function onrampStatus(status: OrderStatus): RouteStatusView {
  switch (status) {
    case "created":
      return view("Preparing your checkout", "The payment option is being prepared", "Pay in rupiah", true, [
        step("Quote secured", "complete"),
        step("Pay in rupiah", "current"),
        step("XLM delivered", "pending"),
      ]);
    case "payment_pending":
      return view("Complete your payment", "Pay before the quote window closes", "Pay in rupiah", true, [
        step("Quote secured", "complete"),
        step("Pay in rupiah", "current"),
        step("XLM delivered", "pending"),
      ]);
    case "payment_confirmed":
      return view("Payment received", "Your payment is confirmed and the transfer is starting", "XLM delivered", false, [
        step("Quote secured", "complete"),
        step("Pay in rupiah", "complete"),
        step("XLM delivered", "current"),
      ]);
    case "stellar_processing":
      return view("Sending your XLM", "The testnet transfer is in flight", "XLM delivered", false, [
        step("Quote secured", "complete"),
        step("Pay in rupiah", "complete"),
        step("XLM delivered", "current"),
      ]);
    case "completed":
      return view("XLM delivered", "Your testnet XLM transfer is complete", null, false, [
        step("Quote secured", "complete"),
        step("Pay in rupiah", "complete"),
        step("XLM delivered", "complete"),
      ]);
    case "expired":
      return view("Quote expired", "The payment window closed before payment was confirmed", null, false, [
        step("Quote secured", "complete"),
        step("Pay in rupiah", "failed"),
        step("XLM delivered", "pending"),
      ]);
    case "payment_failed":
      return view("Payment did not go through", "The sandbox checkout rejected this payment", null, false, [
        step("Quote secured", "complete"),
        step("Pay in rupiah", "failed"),
        step("XLM delivered", "pending"),
      ]);
    case "stellar_failed":
      return view("Payment received", "Support will resolve the failed testnet transfer. Do not pay again", null, false, [
        step("Quote secured", "complete"),
        step("Pay in rupiah", "complete"),
        step("XLM delivered", "failed"),
      ]);
    case "cancelled":
      return view("Order cancelled", "This order can no longer receive payment", null, false, [
        step("Quote secured", "complete"),
        step("Pay in rupiah", "failed"),
        step("XLM delivered", "pending"),
      ]);
    default: {
      return unsupportedStatus("Buy", status);
    }
  }
}

function offrampStatus(status: OrderStatus): RouteStatusView {
  switch (status) {
    case "asset_pending":
      return view("Send XLM to begin", "Send the exact amount to the sandbox deposit address", "Send XLM", false, [
        step("Quote secured", "complete"),
        step("Send XLM", "current"),
        step("IDR payout", "pending"),
      ]);
    case "asset_received":
      return view("XLM received", "The sandbox received your asset and is preparing retirement", "IDR payout", false, [
        step("Quote secured", "complete"),
        step("Send XLM", "complete"),
        step("IDR payout", "current"),
      ]);
    case "retirement_processing":
      return view("Retiring your XLM", "The received asset is being retired on testnet", "IDR payout", false, [
        step("Quote secured", "complete"),
        step("Send XLM", "complete"),
        step("IDR payout", "current"),
      ]);
    case "withdrawal_processing":
      return view("Preparing your payout", "The sandbox is recording the bank transfer simulation", "IDR payout", false, [
        step("Quote secured", "complete"),
        step("Send XLM", "complete"),
        step("IDR payout", "current"),
      ]);
    case "completed":
      return view("Payout simulated", "The sandbox recorded the IDR payout without moving real money", null, false, [
        step("Quote secured", "complete"),
        step("Send XLM", "complete"),
        step("IDR payout", "complete"),
      ]);
    case "asset_invalid":
      return view("Deposit needs attention", "The received asset did not match the quoted deposit", null, false, [
        step("Quote secured", "complete"),
        step("Send XLM", "failed"),
        step("IDR payout", "pending"),
      ]);
    case "retirement_failed":
      return view("Asset retirement needs attention", "The sandbox could not retire the received asset", null, false, [
        step("Quote secured", "complete"),
        step("Send XLM", "complete"),
        step("IDR payout", "failed"),
      ]);
    case "withdrawal_failed":
      return view("Payout needs attention", "The sandbox payout simulation failed. Keep the order for support", null, false, [
        step("Quote secured", "complete"),
        step("Send XLM", "complete"),
        step("IDR payout", "failed"),
      ]);
    default: {
      return unsupportedStatus("Sell", status);
    }
  }
}

function step(label: string, state: RouteStepState): RouteStep {
  return { label, state };
}

function view(
  title: string,
  detail: string,
  currentStep: string | null,
  canPayAgain: boolean,
  steps: readonly RouteStep[],
): RouteStatusView {
  return { title, detail, currentStep, canPayAgain, steps };
}

function unsupportedStatus(direction: "Buy" | "Sell", status: OrderStatus): RouteStatusView {
  return view("Route needs attention", `${direction} route returned an unsupported state: ${status}`, null, false, [
    step("Quote secured", "pending"),
    step(direction === "Buy" ? "Pay in rupiah" : "Send XLM", "pending"),
    step(direction === "Buy" ? "XLM delivered" : "IDR payout", "pending"),
  ]);
}
