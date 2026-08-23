import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Placeholder: compose this page from widgets in <code>features/</code>.
      </p>
    </div>
  );
}
