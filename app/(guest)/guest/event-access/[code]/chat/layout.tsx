import type { Metadata } from "next";
import type { ReactNode } from "react";
import { metadataForEventScopedPage } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  return metadataForEventScopedPage(params, "Chats", {
    description: "Event channel, meetups, and carpool conversations.",
    canonical: `/guest/event-access/${code}/chat`,
  });
}

/** Parent `[code]/layout` already wraps with GuestEventAccessLayout — do not nest again. */
export default function GuestChatSegmentLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
