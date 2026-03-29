import type { Metadata } from "next";
import type { ReactNode } from "react";
import { metadataForEventScopedPage } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  return metadataForEventScopedPage(params, "Forgot password", {
    description: "Request a password reset link for your guest account for this event.",
    canonical: `/guest/event/${code}/auth/forgot-password`,
  });
}

export default function GuestEventAuthForgotLayout({ children }: { children: ReactNode }) {
  return children;
}
