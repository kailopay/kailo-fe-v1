import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPassword } from "@/features/auth/forgot-password";

export const metadata: Metadata = {
  title: "Forgot password",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs text-ink-3">Request a password reset</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Forgot your password?</h1>
        <p className="mt-2 text-sm leading-6 text-ink-2">
          Enter your email to request a reset link. In this sandbox the link
          is delivered via the backend console, not by email. The response is
          the same for any email, so it never reveals whether an account
          exists.
        </p>
      </div>
      <ForgotPassword defaultOpen />
      <p className="text-sm leading-6 text-ink-2">
        Remembered it?{" "}
        <Link className="font-medium text-sky-deep underline underline-offset-4" href="/login">
          Sign in
        </Link>
        .
      </p>
    </div>
  );
}
