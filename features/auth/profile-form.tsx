"use client";

import { useState } from "react";
import { ApiError, apiRequest, isSessionGone } from "@/lib/api/client";
import { parseUser } from "@/lib/api/client";
import type { User } from "@/lib/api/types";

type ProfileFormProps = {
  initialDisplayName: string;
  initialDeveloperEnabled: boolean;
};

type PatchBody = { display_name?: string; developer_enabled?: boolean };

export function ProfileForm({ initialDisplayName, initialDeveloperEnabled }: ProfileFormProps) {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [developerEnabled, setDeveloperEnabled] = useState(initialDeveloperEnabled);
  const [savingName, setSavingName] = useState(false);
  const [savingMode, setSavingMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function applyPatch(patch: PatchBody, busy: (value: boolean) => void): Promise<void> {
    busy(true);
    setError(null);
    setNotice(null);
    try {
      const payload: unknown = await apiRequest("/auth/me", { method: "PATCH", body: patch });
      const user: User = parseUser(payload);
      setDisplayName(user.display_name);
      setDeveloperEnabled(user.developer_enabled);
      setNotice("Saved");
    } catch (caught) {
      if (isSessionGone(caught)) {
        // The cookie is gone: leave the app for the public explainer.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.assign("/session-expired");
        return;
      }
      if (caught instanceof ApiError) {
        setError(caught.message);
      } else if (caught instanceof Error) {
        setError("Could not reach the server. Try again.");
      }
    } finally {
      busy(false);
    }
  }

  function handleNameSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const trimmed = displayName.trim();
    if (trimmed.length === 0) {
      setError("Display name cannot be empty.");
      return;
    }
    void applyPatch({ display_name: trimmed }, setSavingName);
  }

  function handleModeToggle(): void {
    void applyPatch({ developer_enabled: !developerEnabled }, setSavingMode);
  }

  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold">Account</h2>
      <form className="mt-4 flex flex-col gap-3" onSubmit={handleNameSubmit}>
        <label className="text-sm font-medium text-ink-2" htmlFor="display-name">
          Display name
        </label>
        <div className="flex gap-3">
          <input
            className="h-11 flex-1 rounded-xl border border-line-strong bg-white px-4 text-sm outline-none transition-colors focus:border-sky-deep"
            id="display-name"
            maxLength={100}
            onChange={(event) => setDisplayName(event.target.value)}
            value={displayName}
          />
          <button
            className="h-11 rounded-xl bg-ink px-5 text-sm font-medium text-paper transition-colors hover:bg-ink-deep disabled:opacity-50"
            disabled={savingName}
            type="submit"
          >
            {savingName ? "Saving" : "Save"}
          </button>
        </div>
      </form>

      <div className="mt-8 flex items-start justify-between gap-4 rounded-[20px] border border-line bg-white p-5">
        <div>
          <p className="text-sm font-medium">Developer Mode</p>
          <p className="mt-1 text-sm leading-6 text-ink-3">
            Required to manage API keys and use the playground. Revoking keys
            does not disable Developer Mode.
          </p>
        </div>
        <button
          aria-checked={developerEnabled}
          aria-label="Toggle Developer Mode"
          className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
            developerEnabled ? "bg-sea-deep" : "bg-line-strong"
          }`}
          disabled={savingMode}
          onClick={handleModeToggle}
          role="switch"
          type="button"
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
              developerEnabled ? "left-6" : "left-1"
            }`}
          />
        </button>
      </div>

      {error !== null && (
        <p className="mt-4 rounded-xl bg-sun-tint px-4 py-3 text-sm text-sun-deep" role="alert">
          {error}
        </p>
      )}
      {error === null && notice !== null && (
        <p className="mt-4 text-sm text-sky-deep" role="status">
          {notice}
        </p>
      )}
    </section>
  );
}
