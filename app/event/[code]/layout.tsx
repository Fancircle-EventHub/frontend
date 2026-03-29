import type { Metadata } from "next";
import type { ReactNode } from "react";
import { metadataForPublicEventEntry } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  return metadataForPublicEventEntry(params);
}

export default function EventEntryLayout({ children }: { children: ReactNode }) {
  return children;
}
