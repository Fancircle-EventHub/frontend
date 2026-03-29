"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { OrganizationEventGalleryContent } from "@/components/organization-dashboard/OrganizationEventGalleryContent";

export default function OrganizationEventGalleryPage() {
  const params = useParams<{ eventId: string }>();
  const eventId = params.eventId ?? "";

  return (
    <div className="px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href="/organization/events"
          className="text-xs font-semibold uppercase tracking-wide text-eh-accent hover:underline"
        >
          ← Events
        </Link>
      </div>
      {eventId ? <OrganizationEventGalleryContent eventId={eventId} /> : null}
    </div>
  );
}
