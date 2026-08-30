import { ApiError } from "../../lib/api/client.ts";

export function shouldSendConsumerToLogin(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}

export function consumerErrorMessage(error: ApiError): string {
  if (error.status === 401) return "Your session expired. Sign in again to continue.";
  if (error.status === 403) return "This consumer action is unavailable right now.";
  if (error.status === 404) return "This order is no longer available.";

  switch (error.code) {
    case "IDEMPOTENCY_KEY_REUSED":
      return "This purchase was already sent with different details. Start a new purchase.";
    case "INSUFFICIENT_LIQUIDITY":
      return "XLM inventory is temporarily low. Try again later.";
    case "AMOUNT_OUT_OF_RANGE":
      return "Enter an amount within the supported range.";
    case "INVALID_STELLAR_ACCOUNT":
      return "Enter a valid Stellar testnet address.";
    case "QUOTE_UNAVAILABLE":
    case "EXTERNAL_SERVICE_UNAVAILABLE":
      return "The checkout service is temporarily unavailable. Try again shortly.";
    default:
      if (error.status === 409) return "This purchase could not be started. Start a new purchase.";
      if (error.status === 422) return "Check the purchase details and try again.";
      if (error.status === 503) return "The checkout service is temporarily unavailable. Try again shortly.";
      return "We could not complete this request. Try again shortly.";
  }
}
