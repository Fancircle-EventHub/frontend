import type { Metadata } from "next";
import type { ReactNode } from "react";
import { metadataForEventScopedPage } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  return metadataForEventScopedPage(params, "Profile", {
    description: "Your guest profile and settings for this event hub.",
    canonical: `/guest/event-access/${code}/profile`,
  });
}

export default function GuestEventProfileLayout({ children }: { children: ReactNode }) {
  return children;
}
