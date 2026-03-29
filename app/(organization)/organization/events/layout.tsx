import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Your events",
  description: "List and manage your event hubs on Fancircle EventHub.",
  alternates: { canonical: "/organization/events" },
};

export default function OrganizationEventsLayout({ children }: { children: ReactNode }) {
  return children;
}
