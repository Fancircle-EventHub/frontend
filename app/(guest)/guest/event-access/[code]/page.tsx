"use client";

import { notFound, useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useEventEntryByCodeQuery } from "@/apis/event.api";
import { useGuestEventOnboardingQuery, useGuestSessionQuery } from "@/apis/guest.api";
import { GuestEventHomeStaticSections } from "@/components/guest-event/GuestEventHomeStaticSections";
import { PageCenterSpinner } from "@/components/ui/PageCenterSpinner";

export default function GuestEventAccessPage() {
  const router = useRouter();
  const { isLoading: sessionLoading, isSuccess: sessionOk } = useGuestSessionQuery();
  const params = useParams<{ code: string }>();
  const code = params.code;
  const skipContext = !code || code === "no-context";

  const { data: eventEnvelope, isLoading: eventLoading } = useEventEntryByCodeQuery(code ?? "", {
    skip: skipContext || !code,
  });

  const {
    data: onboardingEnvelope,
    isLoading: onboardingLoading,
    isFetching: onboardingFetching,
  } = useGuestEventOnboardingQuery(code ?? "", {
    skip: skipContext || !sessionOk || !code,
  });

  useEffect(() => {
    if (!code) return;
    if (skipContext) return;
    if (!sessionOk) return;
    if (onboardingLoading || onboardingFetching) return;
    const profile = onboardingEnvelope?.data.profile;
    if (profile && !profile.is_complete) {
      router.replace(`/guest/onboarding/${code}`);
    }
  }, [code, skipContext, sessionOk, onboardingLoading, onboardingFetching, onboardingEnvelope, router]);

  if (skipContext) {
    notFound();
  }

  const event = eventEnvelope?.data;
  const showHero = Boolean(event?.hero_image_url);

  if (sessionLoading) {
    return <PageCenterSpinner fixed />;
  }

  if (sessionOk && (onboardingLoading || onboardingFetching)) {
    return <PageCenterSpinner fixed />;
  }

  if (sessionOk && onboardingEnvelope?.data.profile && !onboardingEnvelope.data.profile.is_complete) {
    return <PageCenterSpinner fixed />;
  }

  return (
    <>
      <div className="relative min-h-[38vh] w-full overflow-hidden sm:min-h-[40vh] lg:min-h-[44vh]">
        {showHero ? (
          <>
            <img src={event!.hero_image_url!} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" />
          </>
        ) : (
          <div className="min-h-[38vh] bg-gradient-to-br from-[#1a1a1a] to-black sm:min-h-[40vh]" />
        )}
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-eh-accent">Fancircle EventHub</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight text-white drop-shadow-md sm:text-4xl">
            {eventLoading ? "Loading event…" : (event?.title ?? "Event")}
          </h1>
          {event?.artist ? <p className="mt-2 text-lg font-semibold text-white/95">{event.artist}</p> : null}
          {event?.venue || event?.city || event?.address ? (
            <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-eh-text-secondary">
              <span className="text-eh-accent" aria-hidden>
                ●
              </span>
              {[event?.venue, event?.address, event?.city].filter(Boolean).join(" · ")}
            </p>
          ) : null}
        </div>
      </div>

      <div className="relative z-10 -mt-3">
        <div className="mx-auto max-w-3xl rounded-t-2xl border border-white/10 border-b-0 bg-black/80 px-4 py-5 backdrop-blur-md sm:px-6 lg:max-w-4xl">
          <h2 className="text-lg font-semibold text-white">Event room</h2>
          <p className="mt-1 text-sm text-eh-text-secondary">Welcome in — explore updates and community below.</p>
          {event?.access_code ? (
            <p className="mt-3 text-[11px] uppercase tracking-wide text-eh-text-tertiary">Access · {event.access_code}</p>
          ) : null}
        </div>

        <GuestEventHomeStaticSections eventCode={code} event={event} eventLoading={eventLoading} />
      </div>
    </>
  );
}
