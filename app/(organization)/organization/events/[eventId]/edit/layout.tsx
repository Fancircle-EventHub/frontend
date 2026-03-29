import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Edit event details",
  description: "Update title, schedule, venue, and core information for this event hub.",
};

export default function OrganizationEventEditLayout({ children }: { children: ReactNode }) {
  return children;
}
