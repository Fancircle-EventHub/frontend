"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEventEntryByCodeQuery } from "@/apis/event.api";
import { guestHub } from "@/lib/guest-event-branding";
import { isModuleEnabled } from "@/lib/event-modules";

export default function GuestEventMorePage() {
  const params = useParams<{ code: string }>();
  const code = params.code ?? "";
  const base = `/guest/event-access/${code}`;
  const { data: entryEnvelope } = useEventEntryByCodeQuery(code, { skip: !code });
  const modules = entryEnvelope?.data?.modules;

  const showEventInfo = isModuleEnabled(modules, "event_info");
  const showMeetups = isModuleEnabled(modules, "meetups");
  const showRides = isModuleEnabled(modules, "carpooling");
  const showFanGallery = isModuleEnabled(modules, "fan_gallery");
  const showNotifications = isModuleEnabled(modules, "notifications");
  const showCommunity = isModuleEnabled(modules, "community");

  const shortcuts = [
    showEventInfo ? { href: `${base}/info`, label: "Event info" } : null,
    showCommunity ? { href: `${base}/community`, label: "Community" } : null,
    showFanGallery ? { href: `${base}/upload`, label: "Upload" } : null,
    showFanGallery ? { href: `${base}/gallery`, label: "Gallery" } : null,
    showMeetups ? { href: `${base}/meetups`, label: "Meetups" } : null,
    showRides ? { href: `${base}/rides`, label: "Carpool" } : null,
    showNotifications ? { href: `${base}/notifications`, label: "Updates" } : null,
  ].filter(Boolean) as { href: string; label: string }[];

  return (
    <div className="px-4 pb-8 pt-6 sm:px-6 lg:mx-auto lg:max-w-2xl">
      <h1 className={`text-xl font-bold sm:text-2xl ${guestHub.fg}`}>More</h1>
      <p className={`mt-2 text-sm ${guestHub.fgMuted}`}>Legal information and links to hub features for this event.</p>

      {shortcuts.length > 0 ? (
        <nav className="mt-6 flex flex-wrap gap-3" aria-label="Hub modules">
          {shortcuts.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className={`rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold transition ${guestHub.surface} ${guestHub.fg} ${guestHub.cardHoverBorder}`}
            >
              {s.label}
            </Link>
          ))}
        </nav>
      ) : null}

      <nav
        className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-2 border-t border-white/10 pt-8 text-[11px] font-semibold uppercase tracking-[0.2em]"
        aria-label="Legal"
      >
        <Link href={`${base}/legal`} className={`transition hover:underline ${guestHub.accent}`}>
          Legal notice
        </Link>
        <Link href={`${base}/privacy`} className={`transition hover:underline ${guestHub.accent}`}>
          Privacy policy
        </Link>
      </nav>
    </div>
  );
}
