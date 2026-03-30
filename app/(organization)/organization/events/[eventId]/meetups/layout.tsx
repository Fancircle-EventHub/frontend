import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Event meetups",
  description: "Create and manage fan meetups for this event hub.",
};

export default function OrganizationEventMeetupsLayout({ children }: { children: ReactNode }) {
  return children;
}
