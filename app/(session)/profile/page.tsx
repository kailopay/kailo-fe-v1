import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AvatarSection } from "@/features/auth/avatar-section";
import { ProfileForm } from "@/features/auth/profile-form";
import { getServerSession } from "@/lib/api/server";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const user = await getServerSession();
  if (user === null) redirect("/auth/login");

  return (
    <div className="max-w-xl">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="font-mono text-xs text-ink-3">
          {user.email_verified ? "email verified" : "email not verified"}
        </p>
      </div>
      <AvatarSection initialHasAvatar={user.avatar_url !== undefined} />
      <ProfileForm
        initialDeveloperEnabled={user.developer_enabled}
        initialDisplayName={user.display_name}
      />
    </div>
  );
}
