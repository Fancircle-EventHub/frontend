"use client";

import type { ReactNode } from "react";
import { notFound, useParams } from "next/navigation";
import { useEventEntryByCodeQuery } from "@/apis/event.api";
import { useGuestSessionQuery } from "@/apis/guest.api";
import { useAuthGuard, useRedirectWhenGuestSessionFails } from "@/lib/auth-guard";
import { guestEventBrandingVars } from "@/lib/guest-event-branding";
import { GUEST_INVALID_SESSION_PATH, guestEventAuthPaths } from "@/lib/guest-event-auth-paths";
import { GuestEventBottomNav, GUEST_EVENT_NAV_BOTTOM_PADDING } from "./GuestEventBottomNav";
import { GuestEventInAppHeader } from "./GuestEventInAppHeader";

export function GuestEventAccessLayout({ children }: { children: ReactNode }) {
  const params = useParams<{ code: string }>();
  const code = typeof params?.code === "string" ? params.code : "";
  const loginRedirect =
    code && code !== "no-context" ? guestEventAuthPaths.login(code) : GUEST_INVALID_SESSION_PATH;

  useAuthGuard("guest", loginRedirect);
  const { isError: guestSessionError } = useGuestSessionQuery();
  useRedirectWhenGuestSessionFails(guestSessionError, code);

  const { data: eventEnvelope } = useEventEntryByCodeQuery(code, { skip: !code || code === "no-context" });
  const brandStyle = guestEventBrandingVars(eventEnvelope?.data);

  if (!code || code === "no-context") {
    notFound();
  }

  return (
    <div className="flex min-h-dvh flex-col bg-black text-eh-text-primary">
      <GuestEventInAppHeader eventCode={code} logoUrl={eventEnvelope?.data?.logo_url ?? null} />
      <main
        className={`min-w-0 flex-1 min-h-0 overflow-x-clip ${GUEST_EVENT_NAV_BOTTOM_PADDING} bg-[color:var(--guest-bg)] text-[color:var(--guest-fg)] antialiased`}
        style={brandStyle}
      >
        {children}
      </main>
      <GuestEventBottomNav eventCode={code} />
    </div>
  );
}
