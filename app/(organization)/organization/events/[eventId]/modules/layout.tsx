import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Event modules",
  description: "Turn community, uploads, and other modules on or off for this event hub.",
};

export default function OrganizationEventModulesLayout({ children }: { children: ReactNode }) {
  return children;
}
