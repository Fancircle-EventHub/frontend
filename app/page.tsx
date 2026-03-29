import type { Metadata } from "next";
import { OrganizationLoginScreen } from "@/components/organization-login/OrganizationLoginScreen";
import { SITE_DESCRIPTION } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Organizer home",
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
};

export default function Home() {
  return <OrganizationLoginScreen />;
}
