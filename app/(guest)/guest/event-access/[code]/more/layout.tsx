import type { Metadata } from "next";
import type { ReactNode } from "react";
import { metadataForEventScopedPage } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  return metadataForEventScopedPage(params, "More", {
    description: "Additional links and options for this event hub.",
    canonical: `/guest/event-access/${code}/more`,
  });
}

export default function GuestEventMoreLayout({ children }: { children: ReactNode }) {
  return children;
}
