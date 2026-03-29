import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Reset organizer password",
  description: "Choose a new password for your Fancircle EventHub organizer account.",
  alternates: { canonical: "/organization/auth/reset-password" },
};

export default function OrganizationAuthResetLayout({ children }: { children: ReactNode }) {
  return children;
}
