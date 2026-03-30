"use client";

import { useParams } from "next/navigation";
import { useGuestEventOnboardingQuery } from "@/apis/guest.api";
import { GuestEventUploadContent } from "@/components/guest-event/GuestEventUploadContent";
import { PageCenterSpinner } from "@/components/ui/PageCenterSpinner";
import { useGuestModuleRedirect } from "@/hooks/useGuestModuleRedirect";

export default function GuestEventUploadPage() {
  const params = useParams<{ code: string }>();
  const code = params.code ?? "";
  const gate = useGuestModuleRedirect(code, "fan_gallery");
  const { data: onboardingEnvelope, isLoading } = useGuestEventOnboardingQuery(code, {
    skip: !code || gate !== "ok",
  });
  const eventId = onboardingEnvelope?.data?.event?.id ?? "";

  if (gate !== "ok") {
    return <PageCenterSpinner fixed />;
  }

  if (isLoading || !eventId) {
    return <PageCenterSpinner fixed />;
  }

  return (
    <div className="px-4 pb-8 pt-6 sm:px-6 lg:mx-auto lg:max-w-3xl">
      <h1 className="text-2xl font-bold text-white">Upload</h1>
      <p className="mt-1 text-sm text-eh-text-secondary">Share photos and videos for this event.</p>
      <div className="mt-8">
        <GuestEventUploadContent accessCode={code} eventId={eventId} />
      </div>
    </div>
  );
}
