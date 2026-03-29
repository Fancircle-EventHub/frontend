import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Create organizer account",
  description: "Register a Fancircle EventHub organizer account to create event spaces and manage guest access.",
  alternates: { canonical: "/organization/auth/register" },
};

export default function OrganizationAuthRegisterLayout({ children }: { children: ReactNode }) {
  return children;
}
