import type { Metadata } from "next";
import type { ReactNode } from "react";
import { metadataForEventScopedPage } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  return metadataForEventScopedPage(params, "Community", {
    description: "Event community feed and discussion for this hub.",
    canonical: `/guest/event-access/${code}/community`,
  });
}

export default function GuestEventCommunityLayout({ children }: { children: ReactNode }) {
  return children;
}
