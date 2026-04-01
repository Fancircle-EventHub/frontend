import type { Metadata } from "next";
import type { ReactNode } from "react";
import { metadataForEventScopedPage } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  return metadataForEventScopedPage(params, "You may also like", {
    description: "More tickets, partners, and links from the organizer.",
    canonical: `/guest/event-access/${code}/promo`,
  });
}

export default function GuestEventPromoLayout({ children }: { children: ReactNode }) {
  return children;
}
