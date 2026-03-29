import type { Metadata } from "next";
import type { ReactNode } from "react";
import { metadataForEventScopedPage } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  return metadataForEventScopedPage(params, "Guest profile", {
    description: "Complete your guest profile to join the event community and unlock the hub.",
    canonical: `/guest/onboarding/${code}`,
  });
}

export default function GuestOnboardingLayout({ children }: { children: ReactNode }) {
  return children;
}
