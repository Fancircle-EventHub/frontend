"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";
import { useEventEntryByCodeQuery } from "@/apis/event.api";
import { getAuthFromStorage } from "@/lib/auth-storage";
import { useAppDispatch } from "@/store/hooks";
import { setEventContext } from "@/slices/session.slice";
import { guestEventAuthPaths } from "@/lib/guest-event-auth-paths";
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

  if (phase === "pending" || phase === "redirecting") {
    return <PageCenterSpinner fixed />;
  }

  return (
    <div className="min-h-dvh bg-black text-eh-text-primary">
      <div className="relative min-h-[38vh] w-full overflow-hidden">
        {event?.hero_image_url ? (
          <>
            <img src={event.hero_image_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/25" />
          </>
        ) : (
          <div className="min-h-[38vh] bg-gradient-to-br from-[#1f1f1f] to-black" />
        )}
        <div className="relative z-10 flex min-h-[38vh] flex-col justify-end p-6 pb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-eh-accent">Fancircle EventHub</p>
          <h1 className="mt-3 max-w-xl text-3xl font-bold leading-tight text-white sm:text-4xl">
            {isLoading ? "Loading…" : isError ? "Event not found" : (event?.title ?? "Event")}
          </h1>
          {event?.artist ? <p className="mt-2 text-lg font-semibold text-white/95">{event.artist}</p> : null}
          {event?.venue || event?.city || event?.address ? (
            <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-eh-text-secondary">
              <span className="text-eh-accent" aria-hidden>
                ●
              </span>
              {[event?.venue, event?.address, event?.city].filter(Boolean).join(" · ")}
            </p>
          ) : null}
        </div>
      </div>

      <div className="relative z-10 -mt-8 px-4 pb-16">
        <div className="mx-auto max-w-lg rounded-2xl border border-white/10 bg-eh-surface/90 p-6 shadow-[0_8px_40px_rgba(0,0,0,0.55)] backdrop-blur-md">
          <h2 className="text-lg font-semibold text-white">Join the event community</h2>
          <p className="mt-2 text-sm leading-relaxed text-eh-text-secondary">
            Sign in or create a guest account to access the event room, community, and exclusive updates for this show.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={guestEventAuthPaths.login(code!)}
              className="inline-flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-lg bg-eh-accent py-3.5 text-center text-sm font-bold uppercase tracking-widest text-[#0a0a0a] transition hover:brightness-95"
            >
              Sign in
            </Link>
            <Link
              href={guestEventAuthPaths.register(code!)}
              className="inline-flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-lg border border-eh-border bg-transparent py-3.5 text-center text-sm font-semibold uppercase tracking-wide text-eh-text-secondary transition hover:border-eh-text-tertiary hover:text-eh-text-primary"
            >
              Create account
            </Link>
          </div>
          <p className="mt-6 text-center text-[11px] uppercase tracking-wide text-eh-text-tertiary">
            New here? Create an account, verify your email, then complete your event profile.
          </p>
        </div>
        <p className="mx-auto mt-10 max-w-lg text-center text-[10px] uppercase tracking-wide text-eh-text-tertiary">
          By continuing, you agree to our terms of service and privacy policy.
        </p>
      </div>
    </div>
  );
}
