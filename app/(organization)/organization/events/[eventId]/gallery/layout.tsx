import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Guest media",
  description: "Review guest-submitted photos and videos for this event.",
};

export default function OrganizationEventGalleryLayout({ children }: { children: ReactNode }) {
  return children;
}
