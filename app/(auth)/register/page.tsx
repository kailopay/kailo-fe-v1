import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { GoogleSignIn } from "@/features/auth/google-sign-in";
import { RegisterForm } from "@/features/auth/register-form";
import { getServerSession } from "@/lib/api/server";

export const metadata: Metadata = {
  title: "Create an account",
};

export default async function RegisterPage() {
  const user = await getServerSession();
  if (user !== null) redirect("/profile");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs text-ink-3">auth · register</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Create an account</h1>
        <p className="mt-2 text-sm leading-6 text-ink-2">
          Already registered?{" "}
          <Link className="font-medium text-sky-deep underline underline-offset-4" href="/login">
            Sign in
          </Link>
          .
        </p>
      </div>

      <GoogleSignIn />
      <RegisterForm />
    </div>
  );
}
