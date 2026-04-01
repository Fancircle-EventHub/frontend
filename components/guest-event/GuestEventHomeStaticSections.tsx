"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Event } from "@/types/event.types";
import type { GuestEventNotificationItem } from "@/types/event-notification.types";
import type { GuestEventMediaItem } from "@/types/guest-media.types";
import type { GuestMeetupItem } from "@/types/guest-meetup.types";
import type { GuestRidePostItem } from "@/types/guest-ride.types";
import { GuestExternalPromoSection } from "@/components/guest-event/GuestExternalPromoSection";
import { MediaLightbox, type MediaLightboxItem } from "@/components/guest-event/MediaLightbox";
import { GUEST_EXTERNAL_PROMO_HOME_LIMIT } from "@/constants/guestExternalPromo";
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
  interactionMode?: "full" | "preview";
  joinInteractHref?: string;
  galleryPreviewItems?: GuestEventMediaItem[];
};

function formatDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

function toLightboxItems(items: { id: string; kind: "image" | "video"; url: string; username?: string | null }[]): MediaLightboxItem[] {
  return items.map((item) => ({
    id: item.id,
    kind: item.kind,
    url: item.url,
    username: item.username,
  }));
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
  interactionMode = "full",
  joinInteractHref,
  galleryPreviewItems,
}: Props) {
  const base = `/guest/event-access/${eventCode}`;
  const preview = interactionMode === "preview" && Boolean(joinInteractHref);
  const hub = (suffix: string) => (preview && joinInteractHref ? joinInteractHref : `${base}${suffix}`);

  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

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
  const externalPromoHomeItems = externalPromoItems.slice(0, GUEST_EXTERNAL_PROMO_HOME_LIMIT);
  const externalPromoShowMoreHref =
    showExternalPromo && externalPromoItems.length > GUEST_EXTERNAL_PROMO_HOME_LIMIT
      ? preview && joinInteractHref
        ? joinInteractHref
        : `${base}/promo`
      : undefined;

  const title = eventLoading ? "Loading…" : (event?.title ?? "Event");
  const shot = event?.shot_of_the_night;

  const spotlightLightboxItems = useMemo((): MediaLightboxItem[] => {
    if (!shot?.url) return [];
    return [{ id: shot.id, kind: shot.kind, url: shot.url, username: shot.username }];
  }, [shot]);

  const galleryLightboxItems = useMemo(
    () => (galleryPreviewItems?.length ? toLightboxItems(galleryPreviewItems) : []),
    [galleryPreviewItems],
  );

  const showGalleryGrid = Boolean(galleryPreviewItems && galleryPreviewItems.length > 0);

  return (
    <div className="min-w-0 space-y-8 px-4 pb-4 sm:px-6 lg:mx-auto lg:max-w-3xl">
      {showNotifications ? (
        <section aria-labelledby="notifications-preview">
          <div className="flex min-w-0 items-start justify-between gap-3">
            <h2 id="notifications-preview" className={`min-w-0 flex-1 ${guestHub.sectionHeading} ${guestHub.wrap}`}>
              Updates
            </h2>
            <Link
              href={hub("/notifications")}
              className={`shrink-0 text-[11px] font-semibold uppercase tracking-wide hover:underline ${guestHub.accent}`}
            >
              {preview ? "Join to view" : "View all"}
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
                    href={hub("/notifications")}
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
        <GuestExternalPromoSection
          items={externalPromoHomeItems}
          heading={event?.external_promo_section_label}
          showMoreHref={externalPromoShowMoreHref}
        />
      ) : null}

      {showMeetups ? (
        <section aria-labelledby="meetups-preview">
          <div className="flex min-w-0 items-start justify-between gap-3">
            <h2 id="meetups-preview" className={`min-w-0 flex-1 ${guestHub.sectionHeading} ${guestHub.wrap}`}>
              Meetups
            </h2>
            <Link
              href={hub("/meetups")}
              className={`shrink-0 text-[11px] font-semibold uppercase tracking-wide hover:underline ${guestHub.accent}`}
            >
              {preview ? "Join to view" : "View all"}
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
                    href={hub("/meetups")}
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
              href={hub("/rides")}
              className={`shrink-0 text-[11px] font-semibold uppercase tracking-wide hover:underline ${guestHub.accent}`}
            >
              {preview ? "Join to view" : "View all"}
            </Link>
          </div>
          {ridesLoading ? (
            <p className={`mt-3 text-sm ${guestHub.fgMuted}`}>Loading rides…</p>
          ) : ridesPreview.length === 0 ? (
            <p className={`mt-3 text-sm ${guestHub.fgMuted}`}>
              {preview ? "No ride posts yet." : "No ride posts yet — add one from Carpool."}
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {ridesPreview.map((r) => (
                <li key={r.id}>
                  <Link
                    href={hub("/rides")}
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
              href={hub("/gallery")}
              className={`shrink-0 text-[11px] font-semibold uppercase tracking-wide hover:underline ${guestHub.accent}`}
            >
              {preview ? "Join for gallery" : "View all"}
            </Link>
          </div>
          {shot?.url ? (
            <div className={`mt-3 overflow-hidden rounded-2xl border border-white/10 ${guestHub.surface}`}>
              <button
                type="button"
                onClick={() => setSpotlightOpen(true)}
                className="block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-eh-accent"
              >
                <div className="relative aspect-[16/10] w-full bg-black">
                  {shot.kind === "video" ? (
                    <>
                      <video
                        src={shot.url}
                        className="pointer-events-none size-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                        tabIndex={-1}
                        aria-hidden
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/25" aria-hidden>
                        <span className="flex size-16 items-center justify-center rounded-full bg-black/55 text-3xl text-white shadow-lg">
                          ▶
                        </span>
                      </div>
                    </>
                  ) : (
                    <img src={shot.url} alt="" className="size-full object-cover" />
                  )}
                </div>
              </button>
              <div className="flex items-center justify-between gap-2 p-3">
                <div className="min-w-0">
                  <p className={`text-sm font-medium ${guestHub.fg} ${guestHub.wrap}`}>
                    {shot.username ? `@${shot.username}` : "Fan highlight"}
                  </p>
                  <p className={`text-xs ${guestHub.fgMuted} ${guestHub.wrap}`}>Picked by the organizer · tap to view</p>
                </div>
              </div>
            </div>
          ) : (
            <div className={`mt-3 overflow-hidden rounded-2xl border border-dashed border-white/15 p-6 text-center ${guestHub.surface}`}>
              <p className={`text-sm ${guestHub.fgMuted}`}>
                When your organizer selects a shot of the night from fan uploads, it will appear here.
              </p>
              <Link
                href={hub("/gallery")}
                className={`mt-3 inline-block text-xs font-semibold uppercase tracking-wide hover:underline ${guestHub.accent}`}
              >
                {preview ? "Join to open gallery" : "Open gallery"}
              </Link>
            </div>
          )}
        </section>
      ) : null}

      {showFanGallery && showGalleryGrid ? (
        <section aria-labelledby="fan-gallery-preview-heading">
          <div className="flex min-w-0 items-start justify-between gap-3">
            <h2 id="fan-gallery-preview-heading" className={`min-w-0 flex-1 ${guestHub.sectionHeading} ${guestHub.wrap}`}>
              Fan gallery
            </h2>
            <Link
              href={hub("/gallery")}
              className={`shrink-0 text-[11px] font-semibold uppercase tracking-wide hover:underline ${guestHub.accent}`}
            >
              {preview ? "Join for full gallery" : "View all"}
            </Link>
          </div>
          <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {galleryPreviewItems!.slice(0, 8).map((item, i) => (
              <li key={item.id} className="overflow-hidden rounded-xl border border-white/10 bg-black/30">
                <button
                  type="button"
                  onClick={() => {
                    setGalleryIndex(i);
                    setGalleryOpen(true);
                  }}
                  className="relative block aspect-square w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-eh-accent"
                >
                  {item.kind === "video" ? (
                    <>
                      <video
                        src={item.url}
                        className="pointer-events-none size-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                        tabIndex={-1}
                        aria-hidden
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30" aria-hidden>
                        <span className="text-2xl text-white/95">▶</span>
                      </div>
                    </>
                  ) : (
                    <img src={item.url} alt="" className="size-full object-cover" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <footer className="border-t border-white/10 pt-6 text-center">
        <p className={`mx-auto mt-6 max-w-full px-1 text-[10px] ${guestHub.fgMuted} ${guestHub.wrap}`}>
          {title} · Fancircle EventHub · {new Date().getFullYear()}
        </p>
      </footer>

      <MediaLightbox
        key={spotlightOpen ? "spotlight-open" : "spotlight-closed"}
        open={spotlightOpen}
        items={spotlightLightboxItems}
        initialIndex={0}
        onClose={() => setSpotlightOpen(false)}
      />
      <MediaLightbox
        key={galleryOpen ? `gallery-${galleryIndex}` : "gallery-closed"}
        open={galleryOpen}
        items={galleryLightboxItems}
        initialIndex={galleryIndex}
        onClose={() => setGalleryOpen(false)}
      />
    </div>
  );
}
