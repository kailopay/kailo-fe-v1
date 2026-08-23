import type { User } from "./types";

/** Configurable on the backend; this is the default. */
export const SESSION_COOKIE_NAME = "kailopay_session";

/**
 * Normalized API failure covering both backend envelope styles:
 * rich `{"error": {"code", "message"}, "request_id"}` on /v1 order endpoints,
 * simple `{"error": "<message>"}` on /auth and /v1/api-keys endpoints.
 * Surface `code` (when present) and keep `requestId` for support copy.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string | null,
    readonly requestId: string | null,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export type RequestOptions = {
  method?: string;
  /** JSON body. Send only documented fields: the backend 400s on unknown keys. */
  body?: unknown;
  /** Bearer token for /v1 order endpoints (`pk_test_...`). Memory only. */
  apiKey?: string;
  /** Required by POST /v1/onramps. One per user intent; reuse on retry. */
  idempotencyKey?: string;
  signal?: AbortSignal;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function buildHeaders(options: RequestOptions): Record<string, string> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (options.apiKey !== undefined) headers.Authorization = `Bearer ${options.apiKey}`;
  if (options.idempotencyKey !== undefined) headers["Idempotency-Key"] = options.idempotencyKey;
  return headers;
}

export async function toApiError(response: Response): Promise<ApiError> {
  const requestId = response.headers.get("X-Request-ID");
  let message = response.statusText || "Request failed";
  let code: string | null = null;

  try {
    const payload: unknown = await response.json();
    if (isRecord(payload) && "error" in payload) {
      const error: unknown = payload.error;
      if (typeof error === "string") {
        message = error;
      } else if (isRecord(error) && typeof error.message === "string") {
        message = error.message;
        if (typeof error.code === "string") code = error.code;
      }
    }
  } catch {
    // Non-JSON error body; keep the status text.
  }

  return new ApiError(message, response.status, code, requestId);
}

/**
 * Browser-side request through the same-origin rewrite (see next.config.ts).
 * Returns unvalidated JSON; endpoint wrappers own boundary parsing.
 */
export async function apiRequest(
  path: string,
  options: RequestOptions = {},
): Promise<unknown> {
  const response = await fetch(path, {
    method: options.method ?? (options.body !== undefined ? "POST" : "GET"),
    headers: buildHeaders(options),
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    credentials: "same-origin",
    cache: "no-store",
    signal: options.signal,
  });

  if (!response.ok) throw await toApiError(response);
  if (response.status === 204) return null;
  return await response.json();
}

function stringField(record: Record<string, unknown>, key: string): string {
  const value: unknown = record[key];
  if (typeof value !== "string") {
    throw new ApiError(`Malformed session payload: field "${key}"`, 0, "MALFORMED_RESPONSE", null);
  }
  return value;
}

function booleanField(record: Record<string, unknown>, key: string): boolean {
  const value: unknown = record[key];
  if (typeof value !== "boolean") {
    throw new ApiError(`Malformed session payload: field "${key}"`, 0, "MALFORMED_RESPONSE", null);
  }
  return value;
}

/** Boundary parse of the /auth/me envelope into a trusted User. */
export function parseUser(payload: unknown): User {
  if (!isRecord(payload) || !isRecord(payload.user)) {
    throw new ApiError("Malformed session payload", 0, "MALFORMED_RESPONSE", null);
  }
  const user = payload.user;
  const parsed: User = {
    id: stringField(user, "id"),
    display_name: stringField(user, "display_name"),
    email: stringField(user, "email"),
    email_verified: booleanField(user, "email_verified"),
    developer_enabled: booleanField(user, "developer_enabled"),
  };
  if (typeof user.avatar_url === "string") parsed.avatar_url = user.avatar_url;
  return parsed;
}

export async function getSession(): Promise<User> {
  return parseUser(await apiRequest("/auth/me"));
}

/**
 * Multipart upload through the same-origin rewrite. The backend detects
 * the image type from the bytes, so the Content-Type header is the
 * browser's multipart boundary, never a hand-set image type.
 */
export async function apiUpload(path: string, field: string, file: File): Promise<unknown> {
  const body = new FormData();
  body.append(field, file);
  const response = await fetch(path, {
    method: "PUT",
    body,
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!response.ok) throw await toApiError(response);
  if (response.status === 204) return null;
  return await response.json();
}
