import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ApiKeysPanel } from "@/features/developer/api-keys-panel";
import { parseApiKeys } from "@/lib/api/client";
import { serverApiRequest, getServerSession } from "@/lib/api/server";
import type { ApiKeyMeta } from "@/lib/api/types";

export const metadata: Metadata = {
  title: "Developer",
};

export default async function DeveloperPage() {
  const user = await getServerSession();
  if (user === null) redirect("/login");

  if (!user.developer_enabled) {
    return (
      <div className="max-w-xl">
        <h1 className="text-2xl font-semibold tracking-tight">Developer</h1>
        <div className="mt-6 rounded-[20px] border border-line bg-white p-6">
          <p className="text-sm leading-7 text-ink-2">
            Developer Mode is off. API key management needs it, and the
            playground does too.
          </p>
          <Link
            className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-ink px-6 text-sm font-medium text-paper transition-colors hover:bg-ink-deep"
            href="/profile"
          >
            Enable Developer Mode on your profile
          </Link>
        </div>
      </div>
    );
  }

  let keys: ApiKeyMeta[] = [];
  let loadError: string | null = null;
  try {
    keys = parseApiKeys(await serverApiRequest("/v1/api-keys"));
  } catch {
    loadError = "Could not load your API keys. Check that the backend is running, then reload.";
  }

  return (
    <div className="max-w-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">API keys</h1>
        <p className="font-mono text-xs text-ink-3">pk_test · sandbox only</p>
      </div>
      <p className="mt-3 max-w-[70ch] text-sm leading-6 text-ink-2">
        Keys authenticate the order API. The full key appears exactly once
        at creation. Revoking a key does not disable Developer Mode.
      </p>
      {loadError !== null ? (
        <p className="mt-6 rounded-xl bg-sun-tint px-4 py-3 text-sm text-sun-deep" role="alert">
          {loadError}
        </p>
      ) : (
        <ApiKeysPanel initialKeys={keys} />
      )}
    </div>
  );
}
