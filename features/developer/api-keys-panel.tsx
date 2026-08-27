"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError, apiRequest, isSessionGone, parseApiKeyCreated } from "@/lib/api/client";
import type { ApiKeyCreated, ApiKeyMeta } from "@/lib/api/types";
import { formatDate } from "./format-date";

type ApiKeysPanelProps = { initialKeys: ApiKeyMeta[] };

export function ApiKeysPanel({ initialKeys }: ApiKeysPanelProps): React.ReactElement {
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
      await apiRequest("/v1/api-keys/" + id, { method: "DELETE" });
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
    <div className="mt-8">
      {created !== null && (
        <div className="kp-key-reveal" role="alertdialog" aria-label="API key created">
          <p className="text-sm font-bold text-ink">Copy your key now</p>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-ink-2">
            This is the only time the full key is shown. The server keeps only a hash and cannot recover it.
          </p>
          <p className="kp-key-value mt-4">{created.key}</p>
          <div className="mt-4 flex flex-wrap gap-4">
            <button className="kp-primary-button" onClick={() => void handleCopy()} type="button">
              {copied ? "Copied" : "Copy key"}
            </button>
            <button className="kp-secondary-button" onClick={dismissReveal} type="button">
              I saved it
            </button>
          </div>
        </div>
      )}

      <form className="kp-dev-create-row" onSubmit={(event) => void handleCreate(event)}>
        <div>
          <label className="kp-field-label" htmlFor="api-key-name">Create a test key</label>
          <p className="mt-1 text-xs leading-5 text-ink-3">Give it a name you will recognize in the playground.</p>
        </div>
        <input
          className="kp-input"
          id="api-key-name"
          maxLength={100}
          onChange={(event) => setName(event.target.value)}
          placeholder="Playground key"
          value={name}
        />
        <button className="kp-primary-button" disabled={creating || name.trim().length === 0} type="submit">
          {creating ? "Creating" : "Create key"}
        </button>
      </form>

      {error !== null && (
        <p className="kp-notice mt-6" data-tone="warning" role="alert">{error}</p>
      )}

      {initialKeys.length === 0 ? (
        <p className="kp-dev-empty mt-8">No API keys yet. Create one to use the playground and order API.</p>
      ) : (
        <section className="mt-10" aria-labelledby="existing-keys-title">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-lg font-bold tracking-[-0.025em] text-ink" id="existing-keys-title">Existing keys</h2>
            <p className="text-xs text-ink-3">The secret is never shown again</p>
          </div>
          <ul className="kp-dev-key-list mt-3">
            {initialKeys.map((apiKey) => {
              const revoked = apiKey.revoked_at !== null;
              return (
                <li className="kp-dev-row" key={apiKey.id}>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className={revoked ? "text-sm font-bold text-ink-3 line-through" : "text-sm font-bold text-ink"}>{apiKey.name}</p>
                      {revoked && <span className="kp-status-tag" data-tone="warning">revoked</span>}
                    </div>
                    <p className="kp-dev-mono-value mt-2">{apiKey.prefix}</p>
                    <p className="mt-1 text-xs text-ink-3">
                      Created {formatDate(apiKey.created_at)}
                      {apiKey.last_used_at !== undefined && ", last used " + formatDate(apiKey.last_used_at)}
                    </p>
                  </div>
                  {!revoked && (
                    <button
                      className="kp-secondary-button"
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
        </section>
      )}
    </div>
  );
}

function readError(caught: unknown): string {
  if (caught instanceof ApiError) return caught.message;
  if (caught instanceof Error) return "Could not reach the server. Try again.";
  return "Something went wrong. Try again.";
}
