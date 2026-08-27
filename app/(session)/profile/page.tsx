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
    <div className="mx-auto w-full max-w-xl px-5 py-10 sm:px-8 lg:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="kp-page-heading">Profile</h1>
          <p className="mt-3 text-sm leading-6 text-ink-2">Manage your account and choose whether to open the developer workspace.</p>
        </div>
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
        <section className="kp-dev-panel mt-8" aria-labelledby="developer-tools-title">
          <h2 className="text-lg font-semibold" id="developer-tools-title">Developer tools</h2>
          <p className="mt-1 text-sm leading-6 text-ink-2">
            Keep the consumer routes simple, or open the technical workspace
            when you need keys, order history, or API-backed test flows.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link className="kp-primary-button" href="/developer">
              Manage API keys
            </Link>
            <Link className="kp-secondary-button" href="/developer/playground">
              Open Playground
            </Link>
          </div>
        </section>
      )}
      <ChangePasswordForm />
    </div>
  );
}
