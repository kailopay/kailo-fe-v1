import type { Metadata } from "next";
import { ResetPasswordForm } from "@/features/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Reset your password",
};

/** Reads the single-use token from the console-logged link and collects a new password. */
export default async function ResetPasswordPage(props: PageProps<"/auth/reset-password">) {
  const searchParams = await props.searchParams;
  const tokenParam: unknown = searchParams.token;
  const token = typeof tokenParam === "string" && tokenParam.length > 0 ? tokenParam : null;

  return <ResetPasswordForm token={token} />;
}
