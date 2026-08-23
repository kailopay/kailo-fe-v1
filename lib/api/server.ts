import { cookies } from "next/headers";
import { ApiError, SESSION_COOKIE_NAME, buildHeaders, toApiError, parseUser, type RequestOptions } from "./client";
import type { User } from "./types";

/**
 * Server-side request for Server Components. Bypasses the rewrite (outbound
 * fetch never hits it) and talks to the API origin directly, forwarding the
 * session cookie the browser sent.
 */
export async function serverApiRequest(
  path: string,
  options: RequestOptions = {},
): Promise<unknown> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME);
  const headers = buildHeaders(options);
  if (session !== undefined) headers.cookie = `${SESSION_COOKIE_NAME}=${session.value}`;

  const origin = process.env.API_ORIGIN ?? "http://localhost:8081";
  const response = await fetch(`${origin}${path}`, {
    method: options.method ?? (options.body !== undefined ? "POST" : "GET"),
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: "no-store",
    signal: options.signal,
  });

  if (!response.ok) throw await toApiError(response);
  if (response.status === 204) return null;
  return await response.json();
}

/**
 * Current user for Server Components, or null when not signed in.
 * Callers decide how to react (redirect, signed-out copy, etc.).
 * A backend that cannot be reached cannot vouch for a session, so a
 * network failure is treated as signed out rather than crashing the render.
 */
export async function getServerSession(): Promise<User | null> {
  try {
    return parseUser(await serverApiRequest("/auth/me"));
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    if (error instanceof TypeError) return null;
    throw error;
  }
}
