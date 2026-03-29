"use client";

import type { ReactNode } from "react";
import { notFound, useParams } from "next/navigation";
import { useGuestSessionQuery } from "@/apis/guest.api";
import { useAuthGuard, useRedirectWhenGuestSessionFails } from "@/lib/auth-guard";
import { GUEST_INVALID_SESSION_PATH, guestEventAuthPaths } from "@/lib/guest-event-auth-paths";
import { GuestEventBottomNav, GUEST_EVENT_NAV_BOTTOM_PADDING } from "./GuestEventBottomNav";
import { GuestEventInAppHeader } from "./GuestEventInAppHeader";

/**
 * Wraps in-event guest routes: top bar + main scroll area + fixed bottom nav.
 */
export function GuestEventAccessLayout({ children }: { children: ReactNode }) {
  const params = useParams<{ code: string }>();
  const code = typeof params?.code === "string" ? params.code : "";
  const loginRedirect =
    code && code !== "no-context" ? guestEventAuthPaths.login(code) : GUEST_INVALID_SESSION_PATH;

  useAuthGuard("guest", loginRedirect);
  const { isError: guestSessionError } = useGuestSessionQuery();
  useRedirectWhenGuestSessionFails(guestSessionError, code);

  if (!code || code === "no-context") {
    notFound();
  }

  return (
    <div className="min-h-dvh bg-black text-eh-text-primary">
      <GuestEventInAppHeader eventCode={code} />
      <main className={GUEST_EVENT_NAV_BOTTOM_PADDING}>{children}</main>
      <GuestEventBottomNav eventCode={code} />
    </div>
  );
}
