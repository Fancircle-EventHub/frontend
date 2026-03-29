import type { Metadata } from "next";
import type { ReactNode } from "react";
import { metadataForEventScopedPage } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  return metadataForEventScopedPage(params, "Sign in", {
    description: "Sign in to your guest account for this event hub.",
    canonical: `/guest/event/${code}/auth/login`,
  });
}

export default function GuestEventAuthLoginLayout({ children }: { children: ReactNode }) {
  return children;
}
