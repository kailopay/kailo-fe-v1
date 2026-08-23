"use client";

import { useRef, useState } from "react";
import { ApiError, apiRequest, apiUpload, isSessionGone, parseUser } from "@/lib/api/client";

type AvatarSectionProps = { initialHasAvatar: boolean };

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ["image/png", "image/jpeg", "image/gif"];

export function AvatarSection({ initialHasAvatar }: AvatarSectionProps) {
  const [hasAvatar, setHasAvatar] = useState(initialHasAvatar);
  const [version, setVersion] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file === undefined) return;
    if (!ACCEPTED.includes(file.type)) {
      setError("Choose a png, jpeg, or gif image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("The image must be under 5 MiB.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const payload: unknown = await apiUpload("/auth/me/avatar", "avatar", file);
      parseUser(payload);
      setHasAvatar(true);
      setVersion((current) => current + 1);
    } catch (caught) {
      if (isSessionGone(caught)) {
        // The cookie is gone: leave the app for the public explainer.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.assign("/session-expired");
        return;
      }
      setError(caught instanceof ApiError ? caught.message : "Could not reach the server. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove(): Promise<void> {
    setBusy(true);
    setError(null);
    try {
      await apiRequest("/auth/me/avatar", { method: "DELETE" });
      setHasAvatar(false);
    } catch (caught) {
      if (isSessionGone(caught)) {
        // The cookie is gone: leave the app for the public explainer.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.assign("/session-expired");
        return;
      }
      setError(caught instanceof ApiError ? caught.message : "Could not reach the server. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-6">
      <h2 className="text-lg font-semibold">Avatar</h2>
      <div className="mt-4 flex items-center gap-5">
        <div
          aria-label="Your avatar"
          className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-sea-tint text-lg font-semibold text-sea-deep"
          role="img"
        >
          {hasAvatar ? (
            // Same-origin path: the session cookie authenticates the image.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt="Your avatar"
              className="h-16 w-16 object-cover"
              src={`/auth/me/avatar?v=${version}`}
            />
          ) : (
            "n/a"
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input
            accept="image/png,image/jpeg,image/gif"
            className="hidden"
            onChange={(event) => void handleFile(event)}
            ref={fileInput}
            type="file"
          />
          <div className="flex gap-2">
            <button
              className="rounded-lg border border-line-strong px-3 py-1.5 text-sm font-medium text-ink-2 transition-colors hover:border-ink hover:text-ink disabled:opacity-50"
              disabled={busy}
              onClick={() => fileInput.current?.click()}
              type="button"
            >
              {busy ? "Working" : "Upload"}
            </button>
            {hasAvatar && (
              <button
                className="rounded-lg border border-line-strong px-3 py-1.5 text-sm font-medium text-ink-2 transition-colors hover:border-sun-deep hover:text-sun-deep disabled:opacity-50"
                disabled={busy}
                onClick={() => void handleRemove()}
                type="button"
              >
                Remove
              </button>
            )}
          </div>
          <p className="text-xs text-ink-3">png, jpeg, or gif. Up to 5 MiB.</p>
        </div>
      </div>
      {error !== null && (
        <p className="mt-4 rounded-xl bg-sun-tint px-4 py-3 text-sm text-sun-deep" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
