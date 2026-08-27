import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ForgotPassword } from "@/features/auth/forgot-password";
import { GoogleSignIn } from "@/features/auth/google-sign-in";
import { LoginForm } from "@/features/auth/login-form";
import { getServerSession } from "@/lib/api/server";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function LoginPage(props: PageProps<"/login">) {
  const user = await getServerSession();
  if (user !== null) redirect("/profile");

  const searchParams = await props.searchParams;
  const passwordChanged = searchParams.password === "changed";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs text-ink-3">Sign in with email and password</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-2 text-sm leading-6 text-ink-2">
          Sessions are an opaque cookie held server-side. New here?{" "}
          <Link className="font-medium text-sky-deep underline underline-offset-4" href="/register">
            Create an account
          </Link>
          .
        </p>
      </div>

      {passwordChanged && (
        <p className="rounded-xl bg-sky-tint px-4 py-3 text-sm text-sky-deep" role="status">
          Your password was changed and every session was signed out. Sign in
          with your new password.
        </p>
      )}

      <GoogleSignIn />
      <LoginForm />
      <ForgotPassword />
    </div>
  );
}
