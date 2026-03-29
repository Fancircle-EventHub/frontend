import type { Metadata } from "next";
import type { ReactNode } from "react";
import { metadataForEventScopedPage } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  return metadataForEventScopedPage(params, "Gallery", {
    description: "Photo and video gallery for this event hub.",
    canonical: `/guest/event-access/${code}/gallery`,
  });
}

export default function GuestEventGalleryLayout({ children }: { children: ReactNode }) {
  return children;
}
