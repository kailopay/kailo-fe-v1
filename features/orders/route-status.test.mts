import assert from "node:assert/strict";
import test from "node:test";
import { routeStatus } from "./route-status.ts";

test("on-ramp payment pending highlights the rupiah payment step", () => {
  const view = routeStatus({ direction: "onramp", status: "payment_pending" });

  assert.equal(view.title, "Complete your payment");
  assert.equal(view.currentStep, "Pay in rupiah");
  assert.deepEqual(view.steps.map((step) => step.label), ["Quote secured", "Pay in rupiah", "XLM delivered"]);
  assert.equal(view.canPayAgain, true);
});

test("off-ramp asset pending highlights the XLM deposit step", () => {
  const view = routeStatus({ direction: "offramp", status: "asset_pending" });

  assert.equal(view.title, "Send XLM to begin");
  assert.equal(view.currentStep, "Send XLM");
  assert.deepEqual(view.steps.map((step) => step.label), ["Quote secured", "Send XLM", "IDR payout"]);
});

test("paid on-ramp failure does not offer another payment", () => {
  const view = routeStatus({ direction: "onramp", status: "stellar_failed" });

  assert.equal(view.canPayAgain, false);
  assert.equal(view.title, "Payment received");
});

test("completed off-ramp describes the simulated payout", () => {
  const view = routeStatus({ direction: "offramp", status: "completed" });

  assert.equal(view.title, "Payout simulated");
  assert.equal(view.detail, "The sandbox recorded the IDR payout without moving real money");
  assert.equal(view.currentStep, null);
});
