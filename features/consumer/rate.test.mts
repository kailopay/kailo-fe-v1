import assert from "node:assert/strict";
import test from "node:test";
import { directionLabels, rateLabel } from "./rate.ts";

test("buy direction labels the route from IDR to XLM", () => {
  assert.deepEqual(directionLabels("buy"), {
    source: "IDR",
    destination: "XLM",
  });
});

test("sell direction labels the route from XLM to IDR", () => {
  assert.deepEqual(directionLabels("sell"), {
    source: "XLM",
    destination: "IDR",
  });
});

test("a quote with a future expiry is presented as locked", () => {
  const result = rateLabel(
    {
      rate: "2500",
      adjusted_rate: "2525",
      spread_bps: 100,
      source_at: "2026-08-28T10:00:00.000Z",
      expires_at: "2026-08-28T10:05:00.000Z",
    },
    Date.parse("2026-08-28T10:02:00.000Z"),
  );

  assert.equal(result.label, "Rate locked");
  assert.match(result.detail, /^Valid until \d{2}:\d{2}$/);
});

test("an absent quote is explained without inventing a live price", () => {
  assert.deepEqual(rateLabel(null, Date.parse("2026-08-28T10:02:00.000Z")), {
    label: "Live rate at checkout",
    detail: "The rate is secured when the order is created",
  });
});

test("an expired quote asks for a fresh quote", () => {
  assert.deepEqual(
    rateLabel(
      {
        rate: "2500",
        adjusted_rate: "2525",
        spread_bps: 100,
        source_at: "2026-08-28T10:00:00.000Z",
        expires_at: "2026-08-28T10:01:00.000Z",
      },
      Date.parse("2026-08-28T10:02:00.000Z"),
    ),
    { label: "Rate needs refreshing", detail: "Start again to secure a new quote" },
  );
});
