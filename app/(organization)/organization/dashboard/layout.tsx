import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Organizer dashboard",
  description: "Your Fancircle EventHub home — review events, open a hub, and manage guest engagement.",
  alternates: { canonical: "/organization/dashboard" },
};

export default function OrganizationDashboardLayout({ children }: { children: ReactNode }) {
  return children;
}
