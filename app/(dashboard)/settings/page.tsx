import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Placeholder: route-specific components go in{" "}
        <code>app/(dashboard)/settings/_components</code>.
      </p>
    </div>
  );
}
