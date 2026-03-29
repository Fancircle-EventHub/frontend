import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Verify organizer email",
  description: "Enter the verification code sent to your email to activate your organizer account.",
  alternates: { canonical: "/organization/auth/verify" },
};

export default function OrganizationAuthVerifyLayout({ children }: { children: ReactNode }) {
  return children;
}
