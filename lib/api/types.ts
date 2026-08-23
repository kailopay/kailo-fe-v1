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

export type PaymentMethod = "qris" | "bri_va";

export type OrderStatus =
  | "created"
  | "payment_pending"
  | "payment_confirmed"
  | "stellar_processing"
  | "completed"
  | "expired"
  | "payment_failed"
  | "stellar_failed";

export type Quote = {
  rate: string;
  adjusted_rate: string;
  spread_bps: number;
  source_at: string;
  expires_at: string;
};

export type CheckoutPresentation =
  | "QR_STRING"
  | "VIRTUAL_ACCOUNT_NUMBER";

export type Checkout = {
  id: string;
  status: string;
  presentation_type: CheckoutPresentation;
  presentation_value: string;
  expires_at: string;
};

export type Order = {
  id: string;
  status: OrderStatus;
  environment: "sandbox";
  network: "stellar_testnet";
  fiat: { currency: "IDR"; amount_minor: string };
  asset: { code: "XLM"; amount: string };
  quote: Quote;
  payment_method: PaymentMethod;
  stellar_destination: { account: string; memo: string | null };
  checkout: Checkout | null;
  stellar_transaction_hash?: string;
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
