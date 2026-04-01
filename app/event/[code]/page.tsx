"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";
import { useEventEntryByCodeQuery, useEventPublicPreviewQuery } from "@/apis/event.api";
import { GuestEventHomeStaticSections } from "@/components/guest-event/GuestEventHomeStaticSections";
import { PageCenterSpinner } from "@/components/ui/PageCenterSpinner";
import { useHydrated } from "@/hooks/useHydrated";
import { guestEventAuthPaths } from "@/lib/guest-event-auth-paths";
import { guestEventBrandingVars, guestHub } from "@/lib/guest-event-branding";
import { isModuleEnabled } from "@/lib/event-modules";
import { sortMeetupsOrganizerFirst } from "@/lib/guest-meetups";
import { getAuthFromStorage } from "@/lib/auth-storage";
import { useAppDispatch } from "@/store/hooks";
import { setEventContext } from "@/slices/session.slice";

type EntryPhase = "pending" | "public" | "redirecting";

function formatTime(t: string | null | undefined) {
  if (!t) return null;
  return t.length >= 5 ? t.slice(0, 5) : t;
}

export default function EventEntryPage() {
  const params = useParams<{ code: string }>();
  const code = params.code;
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [phase, setPhase] = useState<EntryPhase>("pending");

  const { data: entryEnvelope, isLoading: entryLoading, isError: entryError } = useEventEntryByCodeQuery(code ?? "", {
    skip: !code || phase !== "public",
  });

  const event = entryEnvelope?.data;
  const isLive = event?.status === "live";

  const { data: previewEnvelope, isLoading: previewLoading } = useEventPublicPreviewQuery(
    { code: code ?? "", galleryLimit: 24 },
    { skip: !code || phase !== "public" || !isLive },
  );

  const preview = previewEnvelope?.data;

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

  const brandStyle = guestEventBrandingVars(event);
  const hydrated = useHydrated();
  const showHeroLogo = hydrated && Boolean(event?.logo_url);
  const eventInfoEnabled = isModuleEnabled(event?.modules ?? null, "event_info");
  const joinHref = code ? guestEventAuthPaths.login(code) : "/guest";

  const meetupsPreview = sortMeetupsOrganizerFirst(preview?.meetups ?? []).slice(0, 2);
  const ridesPreview = (preview?.ride_posts ?? []).slice(0, 2);
  const notificationsPreview = (preview?.notifications ?? []).slice(0, 2);

  if (phase === "pending" || phase === "redirecting") {
    return <PageCenterSpinner fixed />;
  }

  const venueLine = [event?.venue, event?.address, event?.city].filter(Boolean).join(" · ") || null;
  const doors = formatTime(event?.doors_time);
  const start = formatTime(event?.start_time);
  const community = preview?.community;
  const showCommunityPreview = community && isModuleEnabled(event?.modules ?? null, "community");

  return (
    <div
      className="min-h-dvh bg-[color:var(--guest-bg)] pb-[max(14rem,calc(13rem+env(safe-area-inset-bottom)))] text-[color:var(--guest-fg)] antialiased"
      style={brandStyle}
    >
      <div className="relative min-h-[38vh] w-full min-w-0 overflow-hidden sm:min-h-[40vh] lg:min-h-[44vh]">
        {event?.hero_image_url ? (
          <>
            <img src={event.hero_image_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
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
            {entryLoading ? "Loading event…" : entryError ? "Event not found" : (event?.title ?? "Event")}
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
        {!entryError && event && isLive ? (
          <div className="border-b border-white/10 bg-[color:var(--guest-elevated)]/80 px-4 py-3 backdrop-blur-md sm:px-6">
            <p className={`text-center text-[11px] font-semibold uppercase tracking-[0.2em] ${guestHub.accent}`}>Preview</p>
            <p className={`mt-1 text-center text-sm ${guestHub.fgMuted}`}>
              You’re viewing this event as a visitor. Join to chat, post, RSVP, and upload.
            </p>
          </div>
        ) : null}

        {entryError ? (
          <div className="mx-auto max-w-lg px-4 py-10 text-center">
            <p className={guestHub.fgMuted}>We couldn’t load this event. Check the link and try again.</p>
          </div>
        ) : null}

        {!entryLoading && event && !isLive ? (
          <div className="mx-auto max-w-lg px-4 py-10 text-center">
            <p className={`text-lg font-semibold ${guestHub.fg}`}>This event isn’t public yet</p>
            <p className={`mt-2 text-sm ${guestHub.fgMuted}`}>Check back later or contact the organizer.</p>
          </div>
        ) : null}

        {!entryLoading && event && isLive ? (
          <>
            <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:max-w-4xl">
              {preview?.organizer_name ? (
                <p className={`text-sm ${guestHub.fgMuted}`}>
                  <span className="font-semibold text-[color:var(--guest-fg)]">Presented by</span> {preview.organizer_name}
                </p>
              ) : null}

              <div className={`mt-5 space-y-5 rounded-2xl border border-white/10 p-5 ${guestHub.surface}`}>
                {event.event_date ? (
                  <div>
                    <h2 className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${guestHub.fgMuted}`}>Date</h2>
                    <p className={`mt-2 text-sm ${guestHub.fg}`}>{event.event_date}</p>
                  </div>
                ) : null}
                {(doors || start) && (
                  <div>
                    <h2 className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${guestHub.fgMuted}`}>Schedule</h2>
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
                    <h2 className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${guestHub.fgMuted}`}>Venue & location</h2>
                    <p className={`mt-2 text-sm leading-relaxed ${guestHub.fg} ${guestHub.wrap}`}>{venueLine}</p>
                  </div>
                ) : null}
                {event.description ? (
                  <div>
                    <h2 className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${guestHub.fgMuted}`}>About</h2>
                    <p
                      className={`mt-2 whitespace-pre-wrap text-sm leading-relaxed ${guestHub.fgMuted} ${guestHub.wrap} [word-break:break-word]`}
                    >
                      {event.description}
                    </p>
                  </div>
                ) : null}
              </div>

              {showCommunityPreview ? (
                <div className={`mt-6 rounded-2xl border border-white/10 p-5 ${guestHub.surface}`}>
                  <h2 className={`${guestHub.sectionHeading}`}>Community</h2>
                  <p className={`mt-2 text-sm ${guestHub.fg}`}>
                    <span className="font-semibold text-[color:var(--guest-fg)]">{community.fan_count}</span> fans with a
                    profile in this event hub
                  </p>
                  {community.top_image_uploaders.length > 0 ? (
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {community.top_image_uploaders.map((u) => (
                        <li
                          key={u.guest_id}
                          className="flex items-center gap-2 rounded-full border border-white/10 bg-black/20 py-1 pl-1 pr-3"
                        >
                          {u.avatar_url ? (
                            <img src={u.avatar_url} alt="" className="size-8 rounded-full object-cover" />
                          ) : (
                            <span className="flex size-8 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white/70">
                              {(u.username ?? "?").slice(0, 1).toUpperCase()}
                            </span>
                          )}
                          <span className={`text-xs ${guestHub.fgMuted}`}>
                            {u.username ? `@${u.username}` : "Fan"} · {u.image_upload_count} photos
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <p className={`mt-3 text-xs ${guestHub.fgMuted}`}>Join to react, chat, and share your own shots.</p>
                </div>
              ) : null}
            </div>

            {previewLoading ? (
              <div className="py-8">
                <PageCenterSpinner />
              </div>
            ) : (
              <GuestEventHomeStaticSections
                eventCode={code!}
                event={event}
                eventLoading={entryLoading}
                meetupsPreview={meetupsPreview}
                ridesPreview={ridesPreview}
                notificationsPreview={notificationsPreview}
                meetupsLoading={false}
                ridesLoading={false}
                notificationsLoading={false}
                interactionMode="preview"
                joinInteractHref={joinHref}
                galleryPreviewItems={preview?.gallery?.length ? preview.gallery : undefined}
              />
            )}
          </>
        ) : null}
      </div>

      {!entryLoading && event && isLive ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#14161c]/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md">
          <div className="pointer-events-auto mx-auto flex max-w-lg flex-col gap-2 sm:flex-row sm:gap-3">
            <Link
              href={joinHref}
              className={`inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl py-3 text-center text-sm font-bold uppercase tracking-widest text-[#0a0a0a] transition hover:brightness-95 ${guestHub.accentBg}`}
            >
              Join event
            </Link>
            <Link
              href={guestEventAuthPaths.register(code!)}
              className={`inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl border border-white/15 py-3 text-center text-sm font-semibold uppercase tracking-wide transition hover:border-white/30 ${guestHub.fgMuted}`}
            >
              Create account
            </Link>
          </div>
          <p className={`pointer-events-auto mt-2 text-center text-[10px] uppercase tracking-wide ${guestHub.fgMuted}`}>
            Sign in to interact ·{" "}
            <Link href={`/event/${code}/gallery`} className={`underline ${guestHub.accent}`}>
              Browse public gallery
            </Link>
          </p>
          <p
            className={`pointer-events-auto mx-auto mt-3 max-w-lg border-t border-white/10 pt-3 text-center text-[10px] uppercase leading-snug tracking-wide ${guestHub.fgMuted}`}
          >
            By continuing, you agree to our terms of service and privacy policy.
          </p>
        </div>
      ) : null}
    </div>
  );
}
