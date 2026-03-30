"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";
import { useEventEntryByCodeQuery } from "@/apis/event.api";
import { getAuthFromStorage } from "@/lib/auth-storage";
import { useAppDispatch } from "@/store/hooks";
import { setEventContext } from "@/slices/session.slice";
import { guestEventAuthPaths } from "@/lib/guest-event-auth-paths";
import { guestEventBrandingVars, guestHub } from "@/lib/guest-event-branding";
import { useHydrated } from "@/hooks/useHydrated";
import { PageCenterSpinner } from "@/components/ui/PageCenterSpinner";

type EntryPhase = "pending" | "public" | "redirecting";

export default function EventEntryPage() {
  const params = useParams<{ code: string }>();
  const code = params.code;
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [phase, setPhase] = useState<EntryPhase>("pending");

  const { data, isLoading, isError } = useEventEntryByCodeQuery(code ?? "", {
    skip: !code || phase !== "public",
  });

  useLayoutEffect(() => {
    queueMicrotask(() => {
      if (!code) {
        setPhase("public");
        return;
      }
      const { token, domain } = getAuthFromStorage();
      if (token && domain === "guest") {
        dispatch(setEventContext(code));
        router.replace(`/guest/event-access/${code}`);
        setPhase("redirecting");
        return;
      }
      setPhase("public");
    });
  }, [code, dispatch, router]);

  useEffect(() => {
    if (phase === "public" && code) dispatch(setEventContext(code));
  }, [phase, code, dispatch]);

  const event = data?.data;
  const brandStyle = guestEventBrandingVars(event);
  const hydrated = useHydrated();
  const showHeroLogo = hydrated && Boolean(event?.logo_url);

  if (phase === "pending" || phase === "redirecting") {
    return <PageCenterSpinner fixed />;
  }

  return (
    <div className="min-h-dvh bg-[color:var(--guest-bg)] text-[color:var(--guest-fg)] antialiased" style={brandStyle}>
      <div className="relative min-h-[38vh] w-full overflow-hidden">
        {event?.hero_image_url ? (
          <>
            <img src={event.hero_image_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--guest-bg)] via-[color:var(--guest-bg)]/55 to-transparent" />
          </>
        ) : (
          <div className="min-h-[38vh] bg-gradient-to-br from-[color:var(--guest-card)] to-[color:var(--guest-bg)]" />
        )}
        <div className="relative z-10 flex min-h-[38vh] flex-col justify-end p-6 pb-10">
          {showHeroLogo && event?.logo_url ? (
            <div className="mb-4">
              <img
                src={event.logo_url}
                alt=""
                className="h-10 max-h-12 w-auto max-w-[min(220px,85vw)] object-contain object-left drop-shadow-md"
              />
            </div>
          ) : (
            <p className={`text-[11px] font-semibold uppercase tracking-[0.3em] ${guestHub.accent}`}>Fancircle EventHub</p>
          )}
          <h1
            className={`${showHeroLogo ? "mt-0" : "mt-3"} max-w-xl text-3xl font-bold leading-tight sm:text-4xl ${guestHub.fg}`}
          >
            {isLoading ? "Loading…" : isError ? "Event not found" : (event?.title ?? "Event")}
          </h1>
          {event?.artist ? <p className={`mt-2 text-lg font-semibold opacity-95 ${guestHub.fg}`}>{event.artist}</p> : null}
          {event?.venue || event?.city || event?.address ? (
            <p className={`mt-3 flex flex-wrap items-center gap-2 text-sm ${guestHub.fgMuted}`}>
              <span className={guestHub.accent} aria-hidden>
                ●
              </span>
              {[event?.venue, event?.address, event?.city].filter(Boolean).join(" · ")}
            </p>
          ) : null}
        </div>
      </div>

      <div className="relative z-10 -mt-8 px-4 pb-16">
        <div className="mx-auto max-w-lg rounded-2xl border border-white/10 bg-[color:var(--guest-elevated)]/90 p-6 shadow-[0_8px_40px_rgba(0,0,0,0.55)] backdrop-blur-md">
          <h2 className={`text-lg font-semibold ${guestHub.fg}`}>Join the event community</h2>
          <p className={`mt-2 text-sm leading-relaxed ${guestHub.fgMuted}`}>
            Sign in or create a guest account to access Eventroom, community, and exclusive updates for this show.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={guestEventAuthPaths.login(code!)}
              className={`inline-flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-lg py-3.5 text-center text-sm font-bold uppercase tracking-widest text-[#0a0a0a] transition hover:brightness-95 ${guestHub.accentBg}`}
            >
              Sign in
            </Link>
            <Link
              href={guestEventAuthPaths.register(code!)}
              className={`inline-flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-lg border border-white/15 bg-transparent py-3.5 text-center text-sm font-semibold uppercase tracking-wide transition hover:border-white/30 ${guestHub.fgMuted}`}
            >
              Create account
            </Link>
          </div>
          <p className={`mt-6 text-center text-[11px] uppercase tracking-wide ${guestHub.fgMuted}`}>
            New here? Create an account, verify your email, then complete your event profile.
          </p>
        </div>
        <p className={`mx-auto mt-10 max-w-lg text-center text-[10px] uppercase tracking-wide ${guestHub.fgMuted}`}>
          By continuing, you agree to our terms of service and privacy policy.
        </p>
      </div>
    </div>
  );
}
