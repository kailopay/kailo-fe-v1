import assert from "node:assert/strict";
import test from "node:test";
import { isTerminalStatus } from "./status.ts";

test("consumer terminal statuses stop order polling", () => {
  for (const status of ["completed", "expired", "payment_failed", "stellar_failed", "cancelled"] as const) {
    assert.equal(isTerminalStatus(status), true, status);
  }
});

test("consumer active statuses continue order polling", () => {
  for (const status of ["created", "payment_pending", "payment_confirmed", "stellar_processing"] as const) {
    assert.equal(isTerminalStatus(status), false, status);
  }
});
