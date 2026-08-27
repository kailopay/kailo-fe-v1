import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ApiKeysPanel } from "@/features/developer/api-keys-panel";
import { EnableDeveloperMode } from "@/features/developer/enable-developer-mode";
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
            playground does too. Revoking keys does not disable it.
          </p>
          <EnableDeveloperMode />
          <p className="mt-4 text-xs text-ink-3">
            You can also toggle it any time on your{" "}
            <Link className="underline underline-offset-2" href="/profile">
              profile
            </Link>
            .
          </p>
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
        <div className="flex items-center gap-3">
          <Link className="text-sm font-semibold text-lilac-deep hover:text-ink" href="/developer/playground">
            Open Playground
          </Link>
          <p className="text-xs text-ink-3">pk_test keys, sandbox only</p>
        </div>
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
