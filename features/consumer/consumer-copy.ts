import type { ConsumerDirection } from "./rate";

export type ExchangeCopy = {
  title: string;
  description: string;
  sourceLabel: string;
  destinationLabel: string;
  sourceCurrency: "IDR" | "XLM";
  destinationCurrency: "IDR" | "XLM";
  destinationTitle: string;
  destinationDescription: string;
  submitLabel: string;
};

const BUY_COPY: ExchangeCopy = {
  title: "Buy XLM",
  description: "Use rupiah to buy Stellar testnet XLM.",
  sourceLabel: "You pay",
  destinationLabel: "You receive",
  sourceCurrency: "IDR",
  destinationCurrency: "XLM",
  destinationTitle: "Where should your XLM go?",
  destinationDescription: "Use a Stellar testnet address you control.",
  submitLabel: "Review buy",
};

const SELL_COPY: ExchangeCopy = {
  title: "Sell XLM",
  description: "Send testnet XLM for a simulated rupiah payout.",
  sourceLabel: "You send",
  destinationLabel: "You receive",
  sourceCurrency: "XLM",
  destinationCurrency: "IDR",
  destinationTitle: "Where should the rupiah go?",
  destinationDescription: "Choose a sandbox payout reference for this test route.",
  submitLabel: "Review sell",
};

export function exchangeCopy(direction: ConsumerDirection): ExchangeCopy {
  return direction === "buy" ? BUY_COPY : SELL_COPY;
}
