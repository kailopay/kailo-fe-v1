import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ApiKeysPanel } from "@/features/developer/api-keys-panel";
import { EnableDeveloperMode } from "@/features/developer/enable-developer-mode";
import { parseApiKeys } from "@/lib/api/client";
import { getServerSession, serverApiRequest } from "@/lib/api/server";
import type { ApiKeyMeta } from "@/lib/api/types";

export const metadata: Metadata = {
  title: "Developer",
};

export default async function DeveloperPage(): Promise<React.ReactElement> {
  const user = await getServerSession();
  if (user === null) redirect("/login");

  if (!user.developer_enabled) {
    return (
      <div className="kp-dev-page max-w-xl">
        <p className="text-sm font-bold text-coral-deep">Developer workspace</p>
        <h1 className="kp-dev-heading mt-3">Developer mode</h1>
        <p className="kp-copy mt-4">Open the technical workspace when you need to create test keys or run the Week 2 order API.</p>
        <section className="kp-dev-panel mt-10" aria-labelledby="developer-mode-title">
          <h2 className="text-lg font-bold tracking-[-0.025em] text-ink" id="developer-mode-title">Turn on developer mode</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-ink-2">
            It adds API key management and the sandbox playground to your account. It does not change the consumer exchange.
          </p>
          <EnableDeveloperMode />
          <p className="mt-5 text-xs leading-5 text-ink-3">
            You can also change this setting from your{" "}
            <Link className="kp-action-link" href="/profile">profile</Link>.
          </p>
        </section>
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
    <div className="kp-dev-page">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-bold text-coral-deep">Developer workspace</p>
          <h1 className="kp-dev-heading mt-3">API keys</h1>
          <p className="kp-copy mt-4 max-w-2xl">Create a test key for the playground. The full secret appears once and stays in your browser only when you use it.</p>
        </div>
        <Link className="kp-action-link" href="/developer/playground">Open Playground</Link>
      </header>

      <div className="kp-dev-context mt-10 text-xs font-bold text-ink-3">
        <span>Key scope: sandbox order API</span>
        <span>Prefix: pk_test_</span>
      </div>

      {loadError !== null ? (
        <p className="kp-notice mt-8" data-tone="warning" role="alert">{loadError}</p>
      ) : (
        <ApiKeysPanel initialKeys={keys} />
      )}
    </div>
  );
}
