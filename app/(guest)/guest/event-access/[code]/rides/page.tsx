"use client";

import { useParams } from "next/navigation";
import { GuestEventRidesContent } from "@/components/guest-event/GuestEventRidesContent";
import { PageCenterSpinner } from "@/components/ui/PageCenterSpinner";
import { useGuestModuleRedirect } from "@/hooks/useGuestModuleRedirect";

export default function GuestEventRidesPage() {
  const params = useParams<{ code: string }>();
  const code = params.code ?? "";
  const gate = useGuestModuleRedirect(code, "carpooling");

  if (gate !== "ok") {
    return <PageCenterSpinner fixed />;
  }

  return (
    <div className="min-w-0 px-4 pb-8 pt-6 sm:px-6 lg:mx-auto lg:max-w-lg">
      <h1 className="text-2xl font-bold text-white">Carpool</h1>
      <p className="mt-1 text-sm text-eh-text-secondary">Offer or request rides — coordinate simply, no DMs.</p>
      <div className="mt-8 min-w-0">{code ? <GuestEventRidesContent accessCode={code} /> : null}</div>
    </div>
  );
}
