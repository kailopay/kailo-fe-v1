import assert from "node:assert/strict";
import test from "node:test";
import { exchangeCopy } from "./consumer-copy.ts";

test("buy copy makes the IDR to XLM action explicit", () => {
  assert.deepEqual(exchangeCopy("buy"), {
    title: "Buy XLM",
    description: "Buy testnet XLM with rupiah.",
    sourceLabel: "You pay",
    destinationLabel: "You receive",
    sourceCurrency: "IDR",
    destinationCurrency: "XLM",
    destinationTitle: "Where should your XLM go?",
    destinationDescription: "Use a Stellar testnet address you control.",
    submitLabel: "Review buy",
  });
});

test("sell copy makes the XLM to IDR action explicit", () => {
  assert.deepEqual(exchangeCopy("sell"), {
    title: "Sell XLM",
    description: "Sell XLM for a simulated rupiah payout.",
    sourceLabel: "You send",
    destinationLabel: "You receive",
    sourceCurrency: "XLM",
    destinationCurrency: "IDR",
    destinationTitle: "Where should the rupiah go?",
    destinationDescription: "Choose a sandbox payout reference for this test route.",
    submitLabel: "Review sell",
  });
});
