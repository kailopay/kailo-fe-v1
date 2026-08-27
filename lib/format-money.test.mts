import assert from "node:assert/strict";
import test from "node:test";
import { formatIdr, formatIdrInput, parseIdrInput } from "./format-money.ts";

test("formats IDR strings without converting them to numbers", () => {
  const largeAmount = "9007199254740993";
  assert.equal(formatIdr(largeAmount), "9.007.199.254.740.993");
  assert.equal(formatIdrInput(largeAmount), "9.007.199.254.740.993");
  assert.equal(parseIdrInput("Rp 9.007.199.254.740.993"), largeAmount);
});

test("formats empty and zero IDR input predictably", () => {
  assert.equal(formatIdr(""), "0");
  assert.equal(formatIdrInput("0"), "0");
  assert.equal(parseIdrInput("rupiah"), null);
});
