import Link from "next/link";
import type { Event } from "@/types/event.types";
import type { GuestEventNotificationItem } from "@/types/event-notification.types";
import type { GuestMeetupItem } from "@/types/guest-meetup.types";
import type { GuestRidePostItem } from "@/types/guest-ride.types";
import { GuestExternalPromoSection } from "@/components/guest-event/GuestExternalPromoSection";
import { formatMeetupSchedule } from "@/lib/datetime-form";
import { guestHub } from "@/lib/guest-event-branding";
import { isModuleEnabled } from "@/lib/event-modules";
import { partitionMeetupsByHost } from "@/lib/guest-meetups";
import { notificationCardBorderClass } from "@/lib/notification-accent";

function rideRouteLine(p: GuestRidePostItem) {
  const d = p.destination_area?.trim();
  return d ? `${p.origin_area} → ${d}` : p.origin_area;
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
  const externalPromoItems = (event?.external_promo_items ?? [])
    .filter((i) => i.is_active)
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order || a.id.localeCompare(b.id));
  const showExternalPromo = showTour && externalPromoItems.length > 0;

  const title = eventLoading ? "Loading…" : (event?.title ?? "Event");
  const shot = event?.shot_of_the_night;

  return (
    <div className="min-w-0 space-y-8 px-4 pb-4 sm:px-6 lg:mx-auto lg:max-w-3xl">
      {showNotifications ? (
        <section aria-labelledby="notifications-preview">
          <div className="flex min-w-0 items-start justify-between gap-3">
            <h2 id="notifications-preview" className={`min-w-0 flex-1 ${guestHub.sectionHeading} ${guestHub.wrap}`}>
              Updates
            </h2>
            <Link
              href={`${base}/notifications`}
              className={`shrink-0 text-[11px] font-semibold uppercase tracking-wide hover:underline ${guestHub.accent}`}
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
                    className={`block min-w-0 rounded-2xl p-4 text-left transition hover:brightness-[1.03] ${guestHub.surface} ${notificationCardBorderClass(n.color)}`}
                  >
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${guestHub.fgMuted} ${guestHub.wrap}`}>
                      {n.created_at ? new Date(n.created_at).toLocaleString(undefined, { dateStyle: "medium" }) : "Update"}
                      {n.category ? ` · ${n.category}` : ""}
                    </p>
                    <p className={`mt-1 text-sm font-semibold ${guestHub.fg} ${guestHub.wrap}`}>{n.title}</p>
                    <p className={`mt-1 line-clamp-2 text-xs ${guestHub.fgMuted} ${guestHub.wrap}`}>{n.body}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {showExternalPromo ? (
        <GuestExternalPromoSection items={externalPromoItems} heading={event?.external_promo_section_label} />
      ) : null}

      {showMeetups ? (
        <section aria-labelledby="meetups-preview">
          <div className="flex min-w-0 items-start justify-between gap-3">
            <h2 id="meetups-preview" className={`min-w-0 flex-1 ${guestHub.sectionHeading} ${guestHub.wrap}`}>
              Meetups
            </h2>
            <Link
              href={`${base}/meetups`}
              className={`shrink-0 text-[11px] font-semibold uppercase tracking-wide hover:underline ${guestHub.accent}`}
            >
              View all
            </Link>
          </div>
          {meetupsLoading ? (
            <p className={`mt-3 text-sm ${guestHub.fgMuted}`}>Loading meetups…</p>
          ) : meetupsPreview.length === 0 ? (
            <p className={`mt-3 text-sm ${guestHub.fgMuted}`}>No meetups posted yet.</p>
          ) : (
            (() => {
              const { organizer, guestHosts } = partitionMeetupsByHost(meetupsPreview);
              const row = (m: GuestMeetupItem) => (
                <li key={m.id}>
                  <Link
                    href={`${base}/meetups`}
                    className={`flex min-w-0 gap-3 rounded-2xl border border-white/10 p-3 text-left transition hover:brightness-[1.03] sm:p-4 ${guestHub.surface} ${guestHub.cardHoverBorder}`}
                  >
                    <div className="relative size-11 shrink-0 overflow-hidden rounded-full bg-white/10">
                      {m.display_image_url ? (
                        <img src={m.display_image_url} alt="" className="size-full object-cover" />
                      ) : (
                        <span className={`flex size-full items-center justify-center text-xs font-bold ${guestHub.fgMuted}`}>
                          {m.title.trim().slice(0, 1).toUpperCase() || "?"}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-semibold leading-snug ${guestHub.fg} ${guestHub.wrap}`}>{m.title}</p>
                      <p className={`mt-0.5 line-clamp-3 text-xs ${guestHub.fgMuted} ${guestHub.wrap}`}>{m.location}</p>
                      <p className={`mt-1 text-xs font-semibold ${guestHub.accent} ${guestHub.wrap}`}>
                        {formatMeetupSchedule(m.meetup_at)}
                      </p>
                    </div>
                  </Link>
                </li>
              );
              return (
                <div className="mt-3 space-y-3">
                  {organizer.length > 0 ? <ul className="space-y-3">{organizer.map(row)}</ul> : null}
                  {guestHosts.length > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3" role="separator" aria-label="Guest hosts">
                        <hr className="min-w-0 flex-1 border-white/15" />
                        <span className={`shrink-0 text-[10px] font-bold uppercase tracking-[0.18em] ${guestHub.fgMuted}`}>
                          GUEST HOSTS
                        </span>
                        <hr className="min-w-0 flex-1 border-white/15" />
                      </div>
                      <ul className="space-y-3">{guestHosts.map(row)}</ul>
                    </div>
                  ) : null}
                </div>
              );
            })()
          )}
        </section>
      ) : null}

      {showRides ? (
        <section aria-labelledby="rides-preview">
          <div className="flex min-w-0 items-start justify-between gap-3">
            <h2 id="rides-preview" className={`min-w-0 flex-1 ${guestHub.sectionHeading} ${guestHub.wrap}`}>
              Carpool
            </h2>
            <Link
              href={`${base}/rides`}
              className={`shrink-0 text-[11px] font-semibold uppercase tracking-wide hover:underline ${guestHub.accent}`}
            >
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
                    className={`flex min-w-0 gap-3 rounded-2xl border border-white/10 p-4 text-left transition ${guestHub.surface} ${guestHub.cardHoverBorder}`}
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
                      <p className={`text-sm font-semibold leading-snug ${guestHub.fg} ${guestHub.wrap}`}>{rideRouteLine(r)}</p>
                      <p className={`mt-1 text-xs font-semibold ${guestHub.accent} ${guestHub.wrap}`}>{formatDateTime(r.departure_at)}</p>
                      <p className={`mt-0.5 text-[10px] uppercase tracking-wide ${guestHub.fgMuted} ${guestHub.wrap}`}>
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
          <div className="flex min-w-0 items-start justify-between gap-3">
            <h2 id="spotlight-heading" className={`min-w-0 flex-1 ${guestHub.sectionHeading} ${guestHub.wrap}`}>
              Shot of the night
            </h2>
            <Link
              href={`${base}/gallery`}
              className={`shrink-0 text-[11px] font-semibold uppercase tracking-wide hover:underline ${guestHub.accent}`}
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
                <div className="min-w-0">
                  <p className={`text-sm font-medium ${guestHub.fg} ${guestHub.wrap}`}>
                    {shot.username ? `@${shot.username}` : "Fan highlight"}
                  </p>
                  <p className={`text-xs ${guestHub.fgMuted} ${guestHub.wrap}`}>Picked by the organizer</p>
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
        <p className={`mx-auto mt-6 max-w-full px-1 text-[10px] ${guestHub.fgMuted} ${guestHub.wrap}`}>
          {title} · Fancircle EventHub · {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
