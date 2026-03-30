import Link from "next/link";
import type { Event } from "@/types/event.types";
import type { GuestEventNotificationItem } from "@/types/event-notification.types";
import type { GuestMeetupItem } from "@/types/guest-meetup.types";
import type { GuestRidePostItem } from "@/types/guest-ride.types";
import { GuestTourPromotionSection } from "@/components/guest-event/GuestTourPromotionSection";
import { guestHub } from "@/lib/guest-event-branding";
import { isModuleEnabled } from "@/lib/event-modules";
import { notificationCardBorderClass } from "@/lib/notification-accent";

function rideRouteLine(p: GuestRidePostItem) {
  const d = p.destination_area?.trim();
  return d ? `${p.origin_area} → ${d}` : p.origin_area;
}

function meetupInitial(title: string) {
  const t = title.trim();
  return t ? t.slice(0, 1).toUpperCase() : "M";
}

function formatMeetupPreviewTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" });
  } catch {
    return iso;
  }
}

type Props = {
  eventCode: string;
  event: Event | undefined;
  eventLoading: boolean;
  meetupsPreview?: GuestMeetupItem[];
  ridesPreview?: GuestRidePostItem[];
  notificationsPreview?: GuestEventNotificationItem[];
  meetupsLoading?: boolean;
  ridesLoading?: boolean;
  notificationsLoading?: boolean;
};

function formatDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

export function GuestEventHomeStaticSections({
  eventCode,
  event,
  eventLoading,
  meetupsPreview = [],
  ridesPreview = [],
  notificationsPreview = [],
  meetupsLoading,
  ridesLoading,
  notificationsLoading,
}: Props) {
  const base = `/guest/event-access/${eventCode}`;
  const modules = event?.modules ?? null;

  const showMeetups = isModuleEnabled(modules, "meetups");
  const showRides = isModuleEnabled(modules, "carpooling");
  const showFanGallery = isModuleEnabled(modules, "fan_gallery");
  const showNotifications = isModuleEnabled(modules, "notifications");
  const showTour = isModuleEnabled(modules, "tour_promotion");
  const relatedEvents = (event?.related_events ?? []).filter(Boolean);
  const showRelatedTour = showTour && relatedEvents.length > 0;

  const title = eventLoading ? "Loading…" : (event?.title ?? "Event");
  const shot = event?.shot_of_the_night;

  const quickLinks: { id: string; title: string; subtitle: string; href: string }[] = [];
  if (isModuleEnabled(modules, "event_info")) {
    quickLinks.push({ id: "info", title: "Event info", subtitle: "Schedule, venue & details", href: `${base}/info` });
  }
  if (isModuleEnabled(modules, "community")) {
    quickLinks.push({ id: "c", title: "Community", subtitle: "Who's here", href: `${base}/community` });
  }
  if (showFanGallery) {
    quickLinks.push(
      { id: "u", title: "Upload", subtitle: "Share your moments", href: `${base}/upload` },
      { id: "g", title: "Gallery", subtitle: "Fan photos & video", href: `${base}/gallery` },
    );
  }
  if (showMeetups) {
    quickLinks.push({ id: "m", title: "Meetups", subtitle: "Plan fan meetups", href: `${base}/meetups` });
  }
  if (showRides) {
    quickLinks.push({ id: "r", title: "Carpool", subtitle: "Offers & requests", href: `${base}/rides` });
  }
  if (showNotifications) {
    quickLinks.push({ id: "n", title: "Updates", subtitle: "Organizer announcements", href: `${base}/notifications` });
  }

  return (
    <div className="space-y-8 px-4 pb-4 sm:px-6 lg:mx-auto lg:max-w-3xl">
      {quickLinks.length > 0 ? (
        <section aria-labelledby="quick-actions-heading">
          <h2 id="quick-actions-heading" className="sr-only">
            Quick links
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {quickLinks.map((action) => (
              <Link
                key={action.id}
                href={action.href}
                className={`block rounded-2xl border border-white/10 p-4 text-left transition ${guestHub.surface} ${guestHub.cardHoverBorder}`}
              >
                <p className={`text-sm font-semibold ${guestHub.fg}`}>{action.title}</p>
                <p className={`mt-1 text-xs ${guestHub.fgMuted}`}>{action.subtitle}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {showNotifications ? (
        <section aria-labelledby="notifications-preview">
          <div className="flex items-center justify-between gap-2">
            <h2 id="notifications-preview" className={`text-lg font-semibold ${guestHub.fg}`}>
              Updates
            </h2>
            <Link
              href={`${base}/notifications`}
              className={`text-[11px] font-semibold uppercase tracking-wide hover:underline ${guestHub.accent}`}
            >
              View all
            </Link>
          </div>
          {notificationsLoading ? (
            <p className={`mt-3 text-sm ${guestHub.fgMuted}`}>Loading updates…</p>
          ) : notificationsPreview.length === 0 ? (
            <p className={`mt-3 text-sm ${guestHub.fgMuted}`}>No announcements yet.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {notificationsPreview.slice(0, 2).map((n) => (
                <li key={n.id}>
                  <Link
                    href={`${base}/notifications`}
                    className={`block rounded-2xl p-4 transition hover:brightness-[1.03] ${guestHub.surface} ${notificationCardBorderClass(n.color)}`}
                  >
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${guestHub.fgMuted}`}>
                      {n.created_at ? new Date(n.created_at).toLocaleString(undefined, { dateStyle: "medium" }) : "Update"}
                      {n.category ? ` · ${n.category}` : ""}
                    </p>
                    <p className={`mt-1 text-sm font-semibold ${guestHub.fg}`}>{n.title}</p>
                    <p className={`mt-1 line-clamp-2 text-xs ${guestHub.fgMuted}`}>{n.body}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {showRelatedTour ? <GuestTourPromotionSection related={relatedEvents} /> : null}

      {showMeetups ? (
        <section aria-labelledby="meetups-preview">
          <div className="flex items-center justify-between gap-2">
            <h2 id="meetups-preview" className={`text-lg font-semibold ${guestHub.fg}`}>
              Meetups
            </h2>
            <Link href={`${base}/meetups`} className={`text-[11px] font-semibold uppercase tracking-wide hover:underline ${guestHub.accent}`}>
              View all
            </Link>
          </div>
          {meetupsLoading ? (
            <p className={`mt-3 text-sm ${guestHub.fgMuted}`}>Loading meetups…</p>
          ) : meetupsPreview.length === 0 ? (
            <p className={`mt-3 text-sm ${guestHub.fgMuted}`}>No meetups posted yet.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {meetupsPreview.map((m) => (
                <li key={m.id}>
                  <Link
                    href={`${base}/meetups`}
                    className={`flex gap-3 rounded-2xl border border-white/10 p-3 transition hover:brightness-[1.03] sm:p-4 ${guestHub.surface} ${guestHub.cardHoverBorder}`}
                  >
                    <div className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5 text-xs font-bold sm:size-12">
                      <span className={guestHub.fg}>{meetupInitial(m.title)}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-semibold leading-snug ${guestHub.fg}`}>{m.title}</p>
                      <p className={`mt-0.5 line-clamp-1 text-xs ${guestHub.fgMuted}`}>{m.location}</p>
                      <p className={`mt-1 text-xs font-semibold ${guestHub.accent}`}>{formatMeetupPreviewTime(m.meetup_at)}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {showRides ? (
        <section aria-labelledby="rides-preview">
          <div className="flex items-center justify-between gap-2">
            <h2 id="rides-preview" className={`text-lg font-semibold ${guestHub.fg}`}>
              Carpool
            </h2>
            <Link href={`${base}/rides`} className={`text-[11px] font-semibold uppercase tracking-wide hover:underline ${guestHub.accent}`}>
              View all
            </Link>
          </div>
          {ridesLoading ? (
            <p className={`mt-3 text-sm ${guestHub.fgMuted}`}>Loading rides…</p>
          ) : ridesPreview.length === 0 ? (
            <p className={`mt-3 text-sm ${guestHub.fgMuted}`}>No ride posts yet — add one from Carpool.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {ridesPreview.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`${base}/rides`}
                    className={`flex gap-3 rounded-2xl border border-white/10 p-4 transition ${guestHub.surface} ${guestHub.cardHoverBorder}`}
                  >
                    <div className="relative size-11 shrink-0 overflow-hidden rounded-full bg-white/10">
                      {r.author_avatar_url ? (
                        <img src={r.author_avatar_url} alt="" className="size-full object-cover" />
                      ) : (
                        <span className={`flex size-full items-center justify-center text-xs font-bold ${guestHub.fgMuted}`}>
                          {(r.author_username ?? "?").slice(0, 1).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-semibold leading-snug ${guestHub.fg}`}>{rideRouteLine(r)}</p>
                      <p className={`mt-1 text-xs font-semibold ${guestHub.accent}`}>{formatDateTime(r.departure_at)}</p>
                      <p className={`mt-0.5 text-[10px] uppercase tracking-wide ${guestHub.fgMuted}`}>
                        {r.type === "offer" ? "Offer" : "Request"}
                        {r.type === "offer" && r.seats_available != null ? ` · ${r.seats_available} seats` : ""}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {showFanGallery ? (
        <section aria-labelledby="spotlight-heading">
          <div className="flex items-center justify-between gap-2">
            <h2 id="spotlight-heading" className={`text-lg font-semibold ${guestHub.fg}`}>
              Shot of the night
            </h2>
            <Link
              href={`${base}/gallery`}
              className={`text-[11px] font-semibold uppercase tracking-wide hover:underline ${guestHub.accent}`}
            >
              View all
            </Link>
          </div>
          {shot?.url ? (
            <div className={`mt-3 overflow-hidden rounded-2xl border border-white/10 ${guestHub.surface}`}>
              <div className="aspect-[16/10] w-full bg-black">
                {shot.kind === "video" ? (
                  <video src={shot.url} className="size-full object-cover" controls playsInline preload="metadata" />
                ) : (
                  <img src={shot.url} alt="" className="size-full object-cover" />
                )}
              </div>
              <div className="flex items-center justify-between gap-2 p-3">
                <div>
                  <p className={`text-sm font-medium ${guestHub.fg}`}>
                    {shot.username ? `@${shot.username}` : "Fan highlight"}
                  </p>
                  <p className={`text-xs ${guestHub.fgMuted}`}>Picked by the organizer</p>
                </div>
              </div>
            </div>
          ) : (
            <div className={`mt-3 overflow-hidden rounded-2xl border border-dashed border-white/15 p-6 text-center ${guestHub.surface}`}>
              <p className={`text-sm ${guestHub.fgMuted}`}>
                When your organizer selects a shot of the night from fan uploads, it will appear here.
              </p>
              <Link
                href={`${base}/gallery`}
                className={`mt-3 inline-block text-xs font-semibold uppercase tracking-wide hover:underline ${guestHub.accent}`}
              >
                Open gallery
              </Link>
            </div>
          )}
        </section>
      ) : null}

      <footer className="border-t border-white/10 pt-6 text-center">
        <p className={`mt-6 text-[10px] ${guestHub.fgMuted}`}>
          {title} · Fancircle EventHub · {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
