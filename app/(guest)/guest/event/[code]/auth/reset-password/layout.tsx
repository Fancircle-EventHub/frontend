import type { Metadata } from "next";
import type { ReactNode } from "react";
import { metadataForEventScopedPage } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  return metadataForEventScopedPage(params, "Reset password", {
    description: "Set a new password for your guest account for this event hub.",
    canonical: `/guest/event/${code}/auth/reset-password`,
  });
}

export default function GuestEventAuthResetLayout({ children }: { children: ReactNode }) {
  return children;
}
