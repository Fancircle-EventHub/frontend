"use client";

import { useParams } from "next/navigation";
import { useEventEntryByCodeQuery } from "@/apis/event.api";
import { PageCenterSpinner } from "@/components/ui/PageCenterSpinner";
import { useHydrated } from "@/hooks/useHydrated";
import { guestHub } from "@/lib/guest-event-branding";
import { useGuestModuleRedirect } from "@/hooks/useGuestModuleRedirect";

function formatTime(t: string | null | undefined) {
  if (!t) return null;
  return t.length >= 5 ? t.slice(0, 5) : t;
}

export default function GuestEventInfoPage() {
  const params = useParams<{ code: string }>();
  const code = params.code ?? "";
  const gate = useGuestModuleRedirect(code, "event_info");
  const { data: envelope, isLoading } = useEventEntryByCodeQuery(code, { skip: !code });
  const hydrated = useHydrated();

  const event = envelope?.data;

  if (gate !== "ok") {
    return <PageCenterSpinner fixed />;
  }

  if (isLoading || !event) {
    return <PageCenterSpinner fixed />;
  }
  const showHero = Boolean(event.hero_image_url);
  const showLogo = hydrated && Boolean(event.logo_url);

  const venueLine = [event.venue, event.address, event.city].filter(Boolean).join(" · ") || null;
  const start = formatTime(event.start_time);
  const doors = formatTime(event.doors_time);

  return (
    <div className="min-w-0 px-4 pb-8 pt-6 sm:px-6 lg:mx-auto lg:max-w-xl">
      <h1 className={`text-2xl font-bold ${guestHub.fg}`}>Event info</h1>
      <p className={`mt-1 text-sm ${guestHub.fgMuted}`}>Details for this show.</p>

      {showHero || showLogo ? (
        <div className="mt-6 space-y-4">
          {showHero ? (
            <div className={`overflow-hidden rounded-2xl border border-white/10 ${guestHub.surface}`}>
              <div className="relative aspect-[16/10] min-h-[140px] sm:min-h-[180px]">
                <img
                  src={event.hero_image_url!}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[color:var(--guest-bg)] via-[color:var(--guest-bg)]/45 to-transparent"
                  aria-hidden
                />
              </div>
            </div>
          ) : null}
          {showLogo ? (
            <div className="flex justify-center sm:justify-start">
              <img
                src={event.logo_url!}
                alt=""
                className="h-12 max-h-14 w-auto max-w-[min(240px,90vw)] object-contain object-left drop-shadow-md"
              />
            </div>
          ) : null}
        </div>
      ) : null}

      <div
        className={`mt-8 min-w-0 space-y-6 overflow-x-hidden rounded-2xl border border-white/10 p-5 ${guestHub.surface}`}
      >
        <div>
          <h2 className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${guestHub.fgMuted}`}>Event</h2>
          <p className={`mt-2 min-w-0 break-words text-xl font-semibold [overflow-wrap:anywhere] ${guestHub.fg}`}>
            {event.title}
          </p>
          {event.artist ? (
            <p className={`mt-1 min-w-0 break-words text-base [overflow-wrap:anywhere] ${guestHub.fgMuted}`}>{event.artist}</p>
          ) : null}
        </div>

        {event.event_date ? (
          <div>
            <h3 className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${guestHub.fgMuted}`}>Date</h3>
            <p className={`mt-2 text-sm ${guestHub.fg}`}>{event.event_date}</p>
          </div>
        ) : null}

        {(start || doors) && (
          <div>
            <h3 className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${guestHub.fgMuted}`}>Times</h3>
            <dl className="mt-2 space-y-1 text-sm">
              {doors ? (
                <div className="flex justify-between gap-4">
                  <dt className={guestHub.fgMuted}>Doors</dt>
                  <dd className={guestHub.fg}>{doors}</dd>
                </div>
              ) : null}
              {start ? (
                <div className="flex justify-between gap-4">
                  <dt className={guestHub.fgMuted}>Show</dt>
                  <dd className={guestHub.fg}>{start}</dd>
                </div>
              ) : null}
            </dl>
          </div>
        )}

        {venueLine ? (
          <div>
            <h3 className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${guestHub.fgMuted}`}>Venue & location</h3>
            <p className={`mt-2 min-w-0 break-words text-sm leading-relaxed [overflow-wrap:anywhere] ${guestHub.fg}`}>
              {venueLine}
            </p>
          </div>
        ) : null}

        {event.description ? (
          <div>
            <h3 className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${guestHub.fgMuted}`}>About</h3>
            <p
              className={`mt-2 min-w-0 whitespace-pre-wrap break-words text-sm leading-relaxed [overflow-wrap:anywhere] [word-break:break-word] ${guestHub.fgMuted}`}
            >
              {event.description}
            </p>
          </div>
        ) : null}

        {event.access_code ? (
          <p className={`text-[11px] uppercase tracking-wide ${guestHub.fgMuted}`}>Access · {event.access_code}</p>
        ) : null}
      </div>
    </div>
  );
}
