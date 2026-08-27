import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AvatarSection } from "@/features/auth/avatar-section";
import { ChangePasswordForm } from "@/features/auth/change-password-form";
import { ProfileForm } from "@/features/auth/profile-form";
import { getServerSession } from "@/lib/api/server";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const user = await getServerSession();
  if (user === null) redirect("/login");

  return (
    <div className="max-w-xl">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-xs text-ink-3">
          {user.email_verified ? "email verified" : "email not verified"}
        </p>
      </div>
      <AvatarSection initialHasAvatar={user.avatar_url !== undefined} />
      <ProfileForm
        initialDeveloperEnabled={user.developer_enabled}
        initialDisplayName={user.display_name}
      />
      {user.developer_enabled && (
        <section className="mt-8 rounded-[20px] border border-lilac/35 bg-lilac-tint p-5" aria-labelledby="developer-tools-title">
          <h2 className="text-lg font-semibold" id="developer-tools-title">Developer tools</h2>
          <p className="mt-1 text-sm leading-6 text-lilac-deep/80">
            Keep the consumer routes simple, or open the technical workspace
            when you need keys, order history, or API-backed test flows.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link className="inline-flex h-10 items-center rounded-xl bg-ink px-4 text-sm font-semibold text-paper hover:bg-ink-deep" href="/developer">
              Manage API keys
            </Link>
            <Link className="inline-flex h-10 items-center rounded-xl border border-lilac-deep/35 px-4 text-sm font-semibold text-lilac-deep hover:border-lilac-deep" href="/developer/playground">
              Open Playground
            </Link>
          </div>
        </section>
      )}
      <ChangePasswordForm />
    </div>
  );
}
