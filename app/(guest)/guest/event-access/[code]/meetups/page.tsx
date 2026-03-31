"use client";

import { useParams } from "next/navigation";
import { GuestEventMeetupsContent } from "@/components/guest-event/GuestEventMeetupsContent";
import { PageCenterSpinner } from "@/components/ui/PageCenterSpinner";
import { guestHub } from "@/lib/guest-event-branding";
import { useGuestModuleRedirect } from "@/hooks/useGuestModuleRedirect";

export default function GuestEventMeetupsPage() {
  const params = useParams<{ code: string }>();
  const code = params.code ?? "";
  const gate = useGuestModuleRedirect(code, "meetups");

  if (gate !== "ok") {
    return <PageCenterSpinner fixed />;
  }

  return (
    <div className="min-w-0 max-w-full px-4 pb-8 pt-6 sm:px-6 lg:mx-auto lg:max-w-xl">
      <h1 className={`text-2xl font-bold ${guestHub.fg}`}>Meetups</h1>
      <p className={`mt-1 text-sm ${guestHub.fgMuted}`}>Participate in informal fan meetups before the show.</p>
      <div className="mt-6 min-w-0">{code ? <GuestEventMeetupsContent accessCode={code} /> : null}</div>
    </div>
  );
}
