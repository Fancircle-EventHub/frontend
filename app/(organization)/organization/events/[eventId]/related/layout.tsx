import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Tour promotion links",
  description: "Add external ticket or partner links for the guest hub.",
};

export default function OrganizationEventRelatedLayout({ children }: { children: ReactNode }) {
  return children;
}
