import type { Metadata } from "next";
import type { ReactNode } from "react";
import { metadataForEventScopedPage } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  return metadataForEventScopedPage(params, "Create account", {
    description: "Create a guest account to join this event hub and complete verification.",
    canonical: `/guest/event/${code}/auth/register`,
  });
}

export default function GuestEventAuthRegisterLayout({ children }: { children: ReactNode }) {
  return children;
}
