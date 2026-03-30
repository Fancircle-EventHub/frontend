import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Related events",
  description: "Curate other hubs to show as related events for guests.",
};

export default function OrganizationEventRelatedLayout({ children }: { children: ReactNode }) {
  return children;
}
