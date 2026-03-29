import type { Metadata } from "next";
import type { ReactNode } from "react";
import { GuestEventAccessLayout } from "@/components/guest-event/GuestEventAccessLayout";
import { metadataForEventScopedPage } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  return metadataForEventScopedPage(params, "Event hub", {
    description: "Your event hub — home, community, uploads, and more.",
    canonical: `/guest/event-access/${code}`,
  });
}

export default function GuestEventAccessSegmentLayout({ children }: { children: ReactNode }) {
  return <GuestEventAccessLayout>{children}</GuestEventAccessLayout>;
}
