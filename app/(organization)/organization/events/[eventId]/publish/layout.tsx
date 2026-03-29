import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Publish hub",
  description: "Publish your event hub and notify guests when everything is ready.",
};

export default function OrganizationEventPublishLayout({ children }: { children: ReactNode }) {
  return children;
}
