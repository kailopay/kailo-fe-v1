import type { Metadata } from "next";
import { VerifyEmailClient } from "@/features/auth/verify-email-client";

export const metadata: Metadata = {
  title: "Verify your email",
};

/** Reads the single-use token from the console-logged link and consumes it. */
export default async function VerifyEmailPage(props: PageProps<"/auth/verify-email">) {
  const searchParams = await props.searchParams;
  const tokenParam: unknown = searchParams.token;
  const token = typeof tokenParam === "string" && tokenParam.length > 0 ? tokenParam : null;

  return <VerifyEmailClient token={token} />;
}
