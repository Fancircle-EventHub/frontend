import type { Metadata } from "next";
import type { ReactNode } from "react";
import { metadataForEventScopedPage } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  return metadataForEventScopedPage(params, "Carpool", {
    description: "Ride offers and requests for this event.",
    canonical: `/guest/event-access/${code}/rides`,
  });
}

export default function GuestEventRidesLayout({ children }: { children: ReactNode }) {
  return children;
}
