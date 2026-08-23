import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register",
};

export default function RegisterPage() {
  return (
    <main className="rounded-lg border border-black/[.08] bg-white p-8 dark:border-white/[.145] dark:bg-black">
      <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Placeholder: build the registration form in <code>features/auth</code>.
      </p>
    </main>
  );
}
