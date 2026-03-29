import type { Metadata } from "next";
import type { ReactNode } from "react";
import { metadataForEventScopedPage } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  return metadataForEventScopedPage(params, "Privacy", {
    description: "Privacy information for this event hub.",
    canonical: `/guest/event-access/${code}/privacy`,
  });
}

export default function GuestEventPrivacyLayout({ children }: { children: ReactNode }) {
  return children;
}
