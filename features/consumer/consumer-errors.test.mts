import assert from "node:assert/strict";
import test from "node:test";
import { ApiError } from "../../lib/api/client.ts";
import { consumerErrorMessage, shouldSendConsumerToLogin } from "./consumer-errors.ts";

test("consumer errors stay stable and do not expose provider text", () => {
  assert.equal(
    consumerErrorMessage(new ApiError("raw provider payload", 503, "EXTERNAL_SERVICE_UNAVAILABLE", "req-1")),
    "The checkout service is temporarily unavailable. Try again shortly.",
  );
  assert.equal(
    consumerErrorMessage(new ApiError("raw backend message", 422, "AMOUNT_OUT_OF_RANGE", "req-2")),
    "Enter an amount within the supported range.",
  );
  assert.equal(
    consumerErrorMessage(new ApiError("raw backend message", 409, "INSUFFICIENT_LIQUIDITY", "req-3")),
    "XLM inventory is temporarily low. Try again later.",
  );
});

test("only a missing session redirects the consumer to sign in", () => {
  assert.equal(shouldSendConsumerToLogin(new ApiError("unauthorized", 401, null, null)), true);
  assert.equal(shouldSendConsumerToLogin(new ApiError("forbidden", 403, null, null)), false);
  assert.equal(shouldSendConsumerToLogin(new Error("network")), false);
});
