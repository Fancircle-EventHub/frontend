import type { Metadata } from "next";
import type { ReactNode } from "react";
import { metadataForEventScopedPage } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  return metadataForEventScopedPage(params, "Upload", {
    description: "Upload photos or videos to share with the event community.",
    canonical: `/guest/event-access/${code}/upload`,
  });
}

export default function GuestEventUploadLayout({ children }: { children: ReactNode }) {
  return children;
}
