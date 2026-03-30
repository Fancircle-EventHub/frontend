"use client";

import { notFound, useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useEventEntryByCodeQuery } from "@/apis/event.api";
import {
  useGuestEventMeetupsQuery,
  useGuestEventNotificationsQuery,
  useGuestEventOnboardingQuery,
  useGuestEventRidesQuery,
  useGuestSessionQuery,
} from "@/apis/guest.api";
import { GuestEventHomeStaticSections } from "@/components/guest-event/GuestEventHomeStaticSections";
import { PageCenterSpinner } from "@/components/ui/PageCenterSpinner";
import { useHydrated } from "@/hooks/useHydrated";
import { guestHub } from "@/lib/guest-event-branding";
import { isModuleEnabled } from "@/lib/event-modules";
import { sortMeetupsOrganizerFirst } from "@/lib/guest-meetups";

export default function GuestEventAccessPage() {
  const router = useRouter();
  const { isLoading: sessionLoading, isSuccess: sessionOk } = useGuestSessionQuery();
  const params = useParams<{ code: string }>();
  const code = params.code;
  const skipContext = !code || code === "no-context";

  const { data: eventEnvelope, isLoading: eventLoading } = useEventEntryByCodeQuery(code ?? "", {
    skip: skipContext || !code,
  });

  const event = eventEnvelope?.data;
  const hydrated = useHydrated();
  const showHeroLogo = hydrated && Boolean(event?.logo_url);
  const meetupsEnabled = isModuleEnabled(event?.modules ?? null, "meetups");
  const ridesEnabled = isModuleEnabled(event?.modules ?? null, "carpooling");
  const notificationsEnabled = isModuleEnabled(event?.modules ?? null, "notifications");
  const eventInfoEnabled = isModuleEnabled(event?.modules ?? null, "event_info");

  const { data: meetupsEnvelope, isLoading: meetupsLoading, isFetching: meetupsFetching } = useGuestEventMeetupsQuery(
    code ?? "",
    { skip: skipContext || !code || !sessionOk || !meetupsEnabled },
  );
  const { data: ridesEnvelope, isLoading: ridesLoading, isFetching: ridesFetching } = useGuestEventRidesQuery(
    code ?? "",
    { skip: skipContext || !code || !sessionOk || !ridesEnabled },
  );
  const { data: notificationsEnvelope, isLoading: notificationsLoading, isFetching: notificationsFetching } =
    useGuestEventNotificationsQuery(code ?? "", {
      skip: skipContext || !code || !sessionOk || !notificationsEnabled,
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

  const showHero = Boolean(event?.hero_image_url);
  const meetupsPreview = sortMeetupsOrganizerFirst(meetupsEnvelope?.data?.meetups ?? []).slice(0, 2);
  const ridesPreview = (ridesEnvelope?.data?.ride_posts ?? []).slice(0, 2);
  const notificationsPreview = (notificationsEnvelope?.data?.notifications ?? []).slice(0, 2);

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
      <div className="relative min-h-[38vh] w-full min-w-0 overflow-hidden sm:min-h-[40vh] lg:min-h-[44vh]">
        {showHero ? (
          <>
            <img src={event!.hero_image_url!} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--guest-bg)] via-[color:var(--guest-bg)]/55 to-transparent" />
          </>
        ) : (
          <div className="min-h-[38vh] bg-gradient-to-br from-[color:var(--guest-card)] to-[color:var(--guest-bg)] sm:min-h-[40vh]" />
        )}
        <div className="absolute inset-x-0 bottom-0 max-w-full p-5 sm:p-6">
          {showHeroLogo && event?.logo_url ? (
            <div className="mb-3">
              <img
                src={event.logo_url}
                alt=""
                className="h-10 max-h-12 w-auto max-w-[min(220px,85vw)] object-contain object-left drop-shadow-md"
              />
            </div>
          ) : (
            <p className={`text-[11px] font-semibold uppercase tracking-[0.25em] ${guestHub.accent}`}>Fancircle EventHub</p>
          )}
          <h1
            className={`${showHeroLogo ? "mt-0" : "mt-2"} text-3xl font-bold leading-tight drop-shadow-md sm:text-4xl ${guestHub.fg} ${guestHub.wrap}`}
          >
            {eventLoading ? "Loading event…" : (event?.title ?? "Event")}
          </h1>
          {eventInfoEnabled && event?.artist ? (
            <p className={`mt-2 text-lg font-semibold opacity-95 ${guestHub.fg} ${guestHub.wrap}`}>{event.artist}</p>
          ) : null}
          {eventInfoEnabled && (event?.venue || event?.city || event?.address) ? (
            <p className={`mt-2 text-sm ${guestHub.fgMuted} ${guestHub.wrap}`}>
              <span className={`${guestHub.accent} mr-1.5 inline`} aria-hidden>
                ●
              </span>
              {[event?.venue, event?.address, event?.city].filter(Boolean).join(" · ")}
            </p>
          ) : null}
        </div>
      </div>

      <div className="relative z-10 -mt-3 min-w-0">
        <div className="mx-auto max-w-3xl rounded-t-2xl border border-white/10 border-b-0 bg-[color:var(--guest-elevated)]/90 px-4 py-5 backdrop-blur-md sm:px-6 lg:max-w-4xl">
          <h2 translate="no" className={`text-lg font-semibold ${guestHub.fg} ${guestHub.wrap}`}>
            Eventroom
          </h2>
          <p className={`mt-1 text-sm ${guestHub.fgMuted} ${guestHub.wrap}`}>Welcome in — explore updates and community below.</p>
          {event?.access_code ? (
            <p className={`mt-3 break-all text-[11px] uppercase tracking-wide ${guestHub.fgMuted}`}>
              Access · {event.access_code}
            </p>
          ) : null}
        </div>

        <GuestEventHomeStaticSections
          eventCode={code}
          event={event}
          eventLoading={eventLoading}
          meetupsPreview={meetupsPreview}
          ridesPreview={ridesPreview}
          notificationsPreview={notificationsPreview}
          meetupsLoading={meetupsEnabled && (meetupsLoading || meetupsFetching)}
          ridesLoading={ridesEnabled && (ridesLoading || ridesFetching)}
          notificationsLoading={notificationsEnabled && (notificationsLoading || notificationsFetching)}
        />
      </div>
    </>
  );
}
