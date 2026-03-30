import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Event modules",
  description: "Turn community, uploads, and other modules on or off for this event hub.",
};

export default function OrganizationEventModulesLayout({ children }: { children: ReactNode }) {
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
