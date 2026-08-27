import assert from "node:assert/strict";
import test from "node:test";
import { normalizeXlmAmount } from "./format-asset.ts";

test("normalizes an XLM amount without floating point arithmetic", () => {
  assert.equal(normalizeXlmAmount(" 001.2300000 "), "1.23");
  assert.equal(normalizeXlmAmount("0.0000001"), "0.0000001");
});

test("rejects zero, malformed, and over-precision XLM amounts", () => {
  assert.equal(normalizeXlmAmount("0"), null);
  assert.equal(normalizeXlmAmount("0.0000000"), null);
  assert.equal(normalizeXlmAmount("1.23456789"), null);
  assert.equal(normalizeXlmAmount("1,2"), null);
  assert.equal(normalizeXlmAmount(""), null);
});
