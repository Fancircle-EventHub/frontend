import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Forgot organizer password",
  description: "Request a secure link to reset your Fancircle EventHub organizer password.",
  alternates: { canonical: "/organization/auth/forgot-password" },
};

export default function OrganizationAuthForgotLayout({ children }: { children: ReactNode }) {
  return children;
}
