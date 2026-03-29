import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Event branding",
  description: "Customize hero imagery, colors, and presentation for your event hub.",
};

export default function OrganizationEventBrandingLayout({ children }: { children: ReactNode }) {
  return children;
}
