import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Organizer sign in",
  description: "Sign in to your Fancircle EventHub organizer account to manage events and guest hubs.",
  alternates: { canonical: "/organization/auth/login" },
};

export default function OrganizationAuthLoginLayout({ children }: { children: ReactNode }) {
  return children;
}
