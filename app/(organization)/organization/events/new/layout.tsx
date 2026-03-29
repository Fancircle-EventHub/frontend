import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Create event",
  description: "Create a new event hub with schedule, venue, and branding basics.",
  alternates: { canonical: "/organization/events/new" },
};

export default function OrganizationNewEventLayout({ children }: { children: ReactNode }) {
  return children;
}
