"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError, apiRequest, isSessionGone, parseApiKeyCreated } from "@/lib/api/client";
import type { ApiKeyCreated, ApiKeyMeta } from "@/lib/api/types";
import { formatDate } from "./format-date";

type ApiKeysPanelProps = { initialKeys: ApiKeyMeta[] };

export function ApiKeysPanel({ initialKeys }: ApiKeysPanelProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState<ApiKeyCreated | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  async function handleCreate(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length === 0) return;
    setCreating(true);
    setError(null);
    try {
      const payload: unknown = await apiRequest("/v1/api-keys", { body: { name: trimmed } });
      setCreated(parseApiKeyCreated(payload));
      setName("");
    } catch (caught) {
      if (isSessionGone(caught)) {
        // The cookie is gone: leave the app for the public explainer.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.assign("/session-expired");
        return;
      }
      setError(readError(caught));
    } finally {
      setCreating(false);
    }
  }

  async function handleCopy(): Promise<void> {
    if (created === null) return;
    try {
      await navigator.clipboard.writeText(created.key);
      setCopied(true);
    } catch {
      setError("Copy failed. Select the key text and copy it manually.");
    }
  }

  function dismissReveal(): void {
    // The plaintext key leaves memory here; only the hash exists server-side.
    setCreated(null);
    setCopied(false);
    router.refresh();
  }

  async function handleRevoke(id: string): Promise<void> {
    if (revokingId !== id) {
      setRevokingId(id);
      return;
    }
    setCreating(true);
    setError(null);
    try {
      await apiRequest(`/v1/api-keys/${id}`, { method: "DELETE" });
      setRevokingId(null);
      router.refresh();
    } catch (caught) {
      if (isSessionGone(caught)) {
        // The cookie is gone: leave the app for the public explainer.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.assign("/session-expired");
        return;
      }
      setError(readError(caught));
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="mt-6 flex flex-col gap-6">
      {created !== null && (
        <div className="rounded-[20px] border border-gold/40 bg-sun-tint p-5" role="alertdialog" aria-label="API key created">
          <p className="text-sm font-semibold text-sun-deep">Copy your key now</p>
          <p className="mt-1 text-sm leading-6 text-sun-deep/80">
            This is the only time the full key is shown. The server keeps
            only a hash and cannot recover it.
          </p>
          <p className="mt-3 break-all rounded-xl bg-white px-4 py-3 font-mono text-sm text-ink">
            {created.key}
          </p>
          <div className="mt-4 flex gap-2">
            <button
              className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-ink-deep"
              onClick={() => void handleCopy()}
              type="button"
            >
              {copied ? "Copied" : "Copy key"}
            </button>
            <button
              className="rounded-lg border border-line-strong px-4 py-2 text-sm font-medium text-ink-2 transition-colors hover:border-ink hover:text-ink"
              onClick={dismissReveal}
              type="button"
            >
              I saved it, close
            </button>
          </div>
        </div>
      )}

      <form className="flex gap-3" onSubmit={(event) => void handleCreate(event)}>
        <input
          className="h-11 flex-1 rounded-xl border border-line-strong bg-white px-4 text-sm outline-none transition-colors focus:border-sky-deep"
          maxLength={100}
          onChange={(event) => setName(event.target.value)}
          placeholder="Key name, for example: playground"
          value={name}
        />
        <button
          className="h-11 rounded-xl bg-ink px-5 text-sm font-medium text-paper transition-colors hover:bg-ink-deep disabled:opacity-50"
          disabled={creating || name.trim().length === 0}
          type="submit"
        >
          {creating ? "Working" : "Create key"}
        </button>
      </form>

      {error !== null && (
        <p className="rounded-xl bg-sun-tint px-4 py-3 text-sm text-sun-deep" role="alert">
          {error}
        </p>
      )}

      {initialKeys.length === 0 ? (
        <p className="rounded-[20px] border border-line bg-white px-5 py-6 text-sm leading-6 text-ink-3">
          No API keys yet. Create one to use the playground and the order
          API.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {initialKeys.map((apiKey) => {
            const revoked = apiKey.revoked_at !== null;
            return (
              <li
                className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-line bg-white px-5 py-4"
                key={apiKey.id}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`truncate text-sm font-medium ${revoked ? "text-ink-3 line-through" : ""}`}>
                      {apiKey.name}
                    </p>
                    {revoked && (
                      <span className="rounded-full bg-sun-tint px-2 py-0.5 text-xs font-medium text-sun-deep">
                        revoked
                      </span>
                    )}
                  </div>
                  <p className="mt-1 truncate font-mono text-xs text-ink-3">
                    {apiKey.prefix}
                  </p>
                  <p className="mt-1 text-xs text-ink-3">
                    created {formatDate(apiKey.created_at)}
                    {apiKey.last_used_at !== undefined && `, last used ${formatDate(apiKey.last_used_at)}`}
                  </p>
                </div>
                {!revoked && (
                  <button
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
                      revokingId === apiKey.id
                        ? "bg-sun text-white"
                        : "border border-line-strong text-ink-2 hover:border-sun-deep hover:text-sun-deep"
                    }`}
                    disabled={creating}
                    onClick={() => void handleRevoke(apiKey.id)}
                    type="button"
                  >
                    {revokingId === apiKey.id ? "Confirm revoke" : "Revoke"}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function readError(caught: unknown): string {
  if (caught instanceof ApiError) return caught.message;
  if (caught instanceof Error) return "Could not reach the server. Try again.";
  return "Something went wrong. Try again.";
}
