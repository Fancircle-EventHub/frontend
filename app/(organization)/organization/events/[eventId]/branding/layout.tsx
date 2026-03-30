import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Event branding",
  description: "Customize hero imagery, colors, and presentation for your event hub.",
};

export default function OrganizationEventBrandingLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-eh-text-secondary">Loading…</div>
      }
    >
      {children}
    </Suspense>
  );
}
