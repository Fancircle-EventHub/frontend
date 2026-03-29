import type { Metadata } from "next";
import type { ReactNode } from "react";
import { metadataForEventScopedPage } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  return metadataForEventScopedPage(params, "Legal", {
    description: "Legal terms and notices for this event hub.",
    canonical: `/guest/event-access/${code}/legal`,
  });
}

export default function GuestEventLegalLayout({ children }: { children: ReactNode }) {
  return children;
}
