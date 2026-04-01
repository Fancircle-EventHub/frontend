"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";
import { useEventEntryByCodeQuery } from "@/apis/event.api";
import { GuestEventGalleryContent } from "@/components/guest-event/GuestEventGalleryContent";
import { PageCenterSpinner } from "@/components/ui/PageCenterSpinner";
import { guestEventAuthPaths } from "@/lib/guest-event-auth-paths";
import { guestEventBrandingVars, guestHub } from "@/lib/guest-event-branding";
import { isModuleEnabled } from "@/lib/event-modules";
import { getAuthFromStorage } from "@/lib/auth-storage";
import { useAppDispatch } from "@/store/hooks";
import { setEventContext } from "@/slices/session.slice";

type Phase = "pending" | "public" | "redirecting";

export default function PublicEventGalleryPage() {
  const params = useParams<{ code: string }>();
  const code = params.code;
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [phase, setPhase] = useState<Phase>("pending");

  const { data: entryEnvelope, isLoading } = useEventEntryByCodeQuery(code ?? "", {
    skip: !code || phase !== "public",
  });

  const event = entryEnvelope?.data;
  const isLive = event?.status === "live";
  const galleryEnabled = isModuleEnabled(event?.modules ?? null, "fan_gallery");

  useLayoutEffect(() => {
    queueMicrotask(() => {
      if (!code) {
        setPhase("public");
        return;
      }
      const { token, domain } = getAuthFromStorage();
      if (token && domain === "guest") {
        dispatch(setEventContext(code));
        router.replace(`/guest/event-access/${code}/gallery`);
        setPhase("redirecting");
        return;
      }
      setPhase("public");
    });
  }, [code, dispatch, router]);

  useEffect(() => {
    if (phase === "public" && code) dispatch(setEventContext(code));
  }, [phase, code, dispatch]);

  const brandStyle = guestEventBrandingVars(event);
  const joinHref = code ? guestEventAuthPaths.login(code) : "/guest";

  if (phase === "pending" || phase === "redirecting") {
    return <PageCenterSpinner fixed />;
  }

  return (
    <div
      className="min-h-dvh bg-[color:var(--guest-bg)] pb-28 text-[color:var(--guest-fg)] antialiased sm:pb-32"
      style={brandStyle}
    >
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#14161c]/90 px-4 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <Link
            href={`/event/${code}`}
            className={`text-sm font-semibold uppercase tracking-wide ${guestHub.accent}`}
            aria-label="Back to event preview"
          >
            ← Event
          </Link>
          <h1 className={`min-w-0 flex-1 text-lg font-bold ${guestHub.fg} ${guestHub.wrap}`}>Fan gallery</h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        {isLoading ? (
          <PageCenterSpinner />
        ) : !event ? (
          <p className={guestHub.fgMuted}>Event not found.</p>
        ) : !isLive ? (
          <p className={guestHub.fgMuted}>This event isn’t available for public viewing.</p>
        ) : !galleryEnabled ? (
          <p className={guestHub.fgMuted}>The fan gallery isn’t enabled for this event.</p>
        ) : (
          <GuestEventGalleryContent accessCode={code!} mode="public" />
        )}
      </main>

      {event && isLive ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#14161c]/95 px-4 py-3 backdrop-blur-md supports-[padding:max(0px)]:pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="pointer-events-auto mx-auto flex max-w-lg flex-col gap-2 sm:flex-row sm:gap-3">
            <Link
              href={joinHref}
              className={`inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl py-3 text-center text-sm font-bold uppercase tracking-widest text-[#0a0a0a] transition hover:brightness-95 ${guestHub.accentBg}`}
            >
              Join to upload
            </Link>
            <Link
              href={guestEventAuthPaths.register(code!)}
              className={`inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl border border-white/15 py-3 text-center text-sm font-semibold uppercase tracking-wide transition hover:border-white/30 ${guestHub.fgMuted}`}
            >
              Create account
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
