import Link from "next/link";
import type { Event } from "@/types/event.types";

type Props = {
  eventCode: string;
  event: Event | undefined;
  eventLoading: boolean;
};

/**
 * STATIC PLACEHOLDER UI for the event home feed.
 * Replace with API-driven content when announcements, schedule, merch, and fan posts are implemented.
 */
export function GuestEventHomeStaticSections({ eventCode, event, eventLoading }: Props) {
  /* -------------------------------------------------------------------------- */
  /* STATIC: Organizer announcements — future: GET /events/:id/announcements    */
  /* -------------------------------------------------------------------------- */
  const staticAnnouncements = [
    {
      id: "a1",
      kind: "official" as const,
      title: "Official update",
      body: "Artist is ready for soundcheck — see you tonight!",
      timeLabel: "Posted 3 min ago",
    },
    {
      id: "a2",
      kind: "doors" as const,
      title: "Doors info",
      body: "Doors open in 30 minutes. Have your ticket ready.",
      timeLabel: "Posted 1h ago",
    },
  ];

  /* -------------------------------------------------------------------------- */
  /* STATIC: Suggested events — future: recommendations / related tours         */
  /* -------------------------------------------------------------------------- */
  const staticSuggestions = [
    { id: "s1", title: "Summer Nights Tour", subtitle: "Arena series 2026" },
    { id: "s2", title: "Acoustic Sessions", subtitle: "VIP only" },
    { id: "s3", title: "Fan weekend", subtitle: "Meet & greet" },
  ];

  /* -------------------------------------------------------------------------- */
  /* STATIC: Quick actions — future: modules toggled per event by organizer       */
  /* -------------------------------------------------------------------------- */
  const staticQuickActions = [
    { id: "q1", title: "Upload", subtitle: "Share your moments", href: `/guest/event-access/${eventCode}/upload` },
    { id: "q2", title: "Gallery", subtitle: "Exclusive backstage shots", href: `/guest/event-access/${eventCode}/gallery` },
    /* STATIC: Schedule / Merch — future: module routes or external URLs from organizer settings */
    { id: "q3", title: "Schedule", subtitle: "Setlist & timings", href: "#schedule" },
    { id: "q4", title: "Merch", subtitle: "Tour edition shop", href: "#merch" },
  ];

  const title = eventLoading ? "Loading…" : (event?.title ?? "Event");
  const shot = event?.shot_of_the_night;
  const venueLine = event?.venue
    ? [event.venue, event.city, event.address].filter(Boolean).join(" · ")
    : null;
  const dateLine = event?.event_date ?? null;

  return (
    <div className="space-y-8 px-4 pb-4 sm:px-6 lg:mx-auto lg:max-w-3xl">
      {/* STATIC: Primary CTAs — future: deep links / live state from event modules */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          className="w-full rounded-xl bg-eh-accent py-3.5 text-center text-sm font-bold uppercase tracking-widest text-[#0a0a0a] transition hover:brightness-95 sm:flex-1"
        >
          Route
        </button>
        <div className="flex gap-3 sm:flex-1">
          <button
            type="button"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-eh-accent py-3.5 text-xs font-bold uppercase tracking-wide text-[#0a0a0a] transition hover:brightness-95"
          >
            <span aria-hidden>▶</span> Join live
          </button>
          <button
            type="button"
            className="flex flex-1 items-center justify-center rounded-xl border border-eh-border bg-[#1a1d24] py-3.5 text-xs font-semibold uppercase tracking-wide text-eh-text-secondary transition hover:border-eh-text-tertiary"
          >
            Details
          </button>
        </div>
      </div>

      {dateLine || venueLine ? (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-eh-text-secondary">
          {dateLine ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="text-eh-accent" aria-hidden>
                ◆
              </span>
              {dateLine}
            </span>
          ) : null}
          {venueLine ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="text-eh-accent" aria-hidden>
                ●
              </span>
              {venueLine}
            </span>
          ) : null}
        </div>
      ) : null}

      {/* STATIC: Announcement feed */}
      <section aria-labelledby="feed-updates">
        <h2 id="feed-updates" className="sr-only">
          Updates
        </h2>
        <ul className="space-y-3">
          {staticAnnouncements.map((announcement) => (
            <li
              key={announcement.id}
              className="rounded-2xl border border-white/10 bg-[#1a1d24]/90 p-4 shadow-inner backdrop-blur-sm"
            >
              <div className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl ${
                    announcement.kind === "official" ? "bg-eh-accent/20 text-eh-accent" : "bg-sky-500/20 text-sky-300"
                  }`}
                  aria-hidden
                >
                  {announcement.kind === "official" ? "📣" : "🎟"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-eh-accent">{announcement.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-eh-text-primary">{announcement.body}</p>
                  <p className="mt-2 text-[11px] text-eh-text-tertiary">{announcement.timeLabel}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* STATIC: Horizontal suggestions */}
      <section aria-labelledby="suggestions-heading">
        <h2 id="suggestions-heading" className="text-[11px] font-semibold uppercase tracking-[0.2em] text-eh-text-tertiary">
          You might also like
        </h2>
        <div className="mt-3 -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 sm:overflow-visible">
          {staticSuggestions.map((s) => (
            <div
              key={s.id}
              className="min-w-[9.5rem] shrink-0 rounded-xl border border-white/10 bg-[#1f232a] p-3 sm:min-w-0 sm:flex-1"
            >
              <p className="text-sm font-semibold text-white">{s.title}</p>
              <p className="mt-1 text-xs text-eh-text-tertiary">{s.subtitle}</p>
            </div>
          ))}
        </div>
      </section>

      {/* STATIC: Action grid */}
      <section aria-labelledby="quick-actions-heading">
        <h2 id="quick-actions-heading" className="sr-only">
          Quick actions
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {staticQuickActions.map((action) => {
            const cardClass =
              "block rounded-2xl border border-white/10 bg-[#1a1d24]/90 p-4 text-left transition hover:border-eh-accent/40";
            const inner = (
              <>
                <p className="text-sm font-semibold text-white">{action.title}</p>
                <p className="mt-1 text-xs text-eh-text-tertiary">{action.subtitle}</p>
              </>
            );
            if (action.href.startsWith("#")) {
              return (
                <div key={action.id} className={`${cardClass} cursor-default opacity-90`} title="Coming soon">
                  {inner}
                </div>
              );
            }
            return (
              <Link key={action.id} href={action.href} className={cardClass}>
                {inner}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Shot of the night — chosen by organizers from fan uploads */}
      <section aria-labelledby="spotlight-heading">
        <div className="flex items-center justify-between gap-2">
          <h2 id="spotlight-heading" className="text-lg font-semibold text-white">
            Shot of the night
          </h2>
          <Link
            href={`/guest/event-access/${eventCode}/gallery`}
            className="text-[11px] font-semibold uppercase tracking-wide text-eh-accent hover:underline"
          >
            View all
          </Link>
        </div>
        {shot?.url ? (
          <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-[#252830]">
            <div className="aspect-[16/10] w-full bg-black">
              {shot.kind === "video" ? (
                <video src={shot.url} className="size-full object-cover" controls playsInline preload="metadata" />
              ) : (
                <img src={shot.url} alt="" className="size-full object-cover" />
              )}
            </div>
            <div className="flex items-center justify-between gap-2 p-3">
              <div>
                <p className="text-sm font-medium text-white">
                  {shot.username ? `@${shot.username}` : "Fan highlight"}
                </p>
                <p className="text-xs text-eh-text-tertiary">Picked by the organizer</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-3 overflow-hidden rounded-2xl border border-dashed border-white/15 bg-[#1a1d24]/80 p-6 text-center">
            <p className="text-sm text-eh-text-secondary">
              When your organizer selects a shot of the night from fan uploads, it will appear here.
            </p>
            <Link
              href={`/guest/event-access/${eventCode}/gallery`}
              className="mt-3 inline-block text-xs font-semibold uppercase tracking-wide text-eh-accent hover:underline"
            >
              Open gallery
            </Link>
          </div>
        )}
      </section>

      {/* STATIC: Presented by — future: sponsor logo from event branding */}
      <footer className="border-t border-white/10 pt-6 text-center">
        <p className="text-[10px] uppercase tracking-[0.25em] text-eh-text-tertiary">Presented by</p>
        <p className="mt-2 text-sm font-semibold text-eh-text-secondary">Live Nation</p>
        <p className="mt-6 text-[10px] text-eh-text-tertiary">
          {title} · Fancircle EventHub · {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
