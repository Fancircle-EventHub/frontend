import type { Metadata } from "next";
import type { ReactNode } from "react";
import { metadataForEventScopedPage } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  return metadataForEventScopedPage(params, "Verify email", {
    description: "Confirm your email with the verification code to access this event hub.",
    canonical: `/guest/event/${code}/auth/verify`,
  });
}

export default function GuestEventAuthVerifyLayout({ children }: { children: ReactNode }) {
  return children;
}
