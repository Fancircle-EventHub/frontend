import type { Metadata } from "next";
import type { ReactNode } from "react";
import { metadataForEventScopedPage } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  return metadataForEventScopedPage(params, "Meetups", {
    description: "Fan meetups for this event hub.",
    canonical: `/guest/event-access/${code}/meetups`,
  });
}

export default function GuestEventMeetupsLayout({ children }: { children: ReactNode }) {
  return children;
}
