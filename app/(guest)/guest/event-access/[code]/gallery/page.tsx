"use client";

import { useParams } from "next/navigation";
import { GuestEventGalleryContent } from "@/components/guest-event/GuestEventGalleryContent";

export default function GuestEventGalleryPage() {
  const params = useParams<{ code: string }>();
  const code = params.code ?? "";

  return (
    <div className="px-4 pb-8 pt-6 sm:px-6 lg:mx-auto lg:max-w-4xl">
      <h1 className="text-2xl font-bold text-white">Gallery</h1>
      <p className="mt-1 text-sm text-eh-text-secondary">Fan photos and videos from this event.</p>
      <div className="mt-8">
        <GuestEventGalleryContent accessCode={code} />
      </div>
    </div>
  );
}
