/**
 * Wire contract types, hand-derived from kailopay-be openapi/openapi.yaml.
 * Contract authority: that spec. Frontend-facing explanation:
 * documentations/FRONTEND-GUIDE.md.
 *
 * All money and asset amounts cross the wire as decimal strings
 * (`amount_minor` IDR minor units, XLM with 7 fraction digits). Keep them
 * strings; never run floating-point arithmetic on them.
 */

export type User = {
  id: string;
  display_name: string;
  email: string;
  email_verified: boolean;
  developer_enabled: boolean;
  avatar_url?: string;
};

export type PaymentMethod = "xendit" | "qris" | "bri_va";

export type OrderStatus =
  | "created"
  | "payment_pending"
  | "payment_confirmed"
  | "stellar_processing"
  | "completed"
  | "expired"
  | "payment_failed"
  | "stellar_failed"
  | "cancelled"
  | "asset_pending"
  | "asset_received"
  | "asset_invalid"
  | "retirement_processing"
  | "withdrawal_processing"
  | "retirement_failed"
  | "withdrawal_failed";

export type OrderDirection = "onramp" | "offramp";

export type Quote = {
  rate: string;
  adjusted_rate: string;
  spread_bps: number;
  source_at: string;
  expires_at: string;
};

export type CheckoutPresentation =
  | "PAYMENT_LINK"
  | "QR_STRING"
  | "VIRTUAL_ACCOUNT_NUMBER";

export type Checkout = {
  id: string;
  status: string;
  presentation_type: CheckoutPresentation;
  presentation_value?: string;
  payment_link_url?: string;
  expires_at: string | null;
};

export type Payout = {
  reference: string;
  method: "sandbox_bank_transfer";
  amount_minor: string;
  state: string;
  simulated: boolean;
  disclosure: string;
};

export type Order = {
  id: string;
  direction: OrderDirection;
  status: OrderStatus;
  environment: "sandbox";
  network: "stellar_testnet";
  fiat: { currency: "IDR"; amount_minor: string };
  asset: { code: "XLM"; amount: string };
  quote: Quote;
  payment_method: PaymentMethod | null;
  stellar_destination: { account: string; memo: string | null };
  checkout: Checkout | null;
  stellar_transaction_hash?: string;
  deposit_transaction_hash?: string;
  payout?: Payout;
  failure_code?: string;
  created_at: string;
  updated_at: string;
};

/** Returned exactly once at creation; the server stores only a hash. */
export type ApiKeyCreated = {
  id: string;
  client_id: string;
  prefix: string;
  key: string;
  created_at: string;
};

export type ApiKeyMeta = {
  id: string;
  client_id: string;
  name: string;
  prefix: string;
  created_at: string;
  last_used_at?: string;
  revoked_at: string | null;
};
