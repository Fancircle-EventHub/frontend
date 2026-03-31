"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGuestChatUnreadQuery } from "@/apis/guestChat.api";
import { useEventEntryByCodeQuery } from "@/apis/event.api";
import { isChatHubAccessible, isModuleEnabled } from "@/lib/event-modules";
import { guestHub } from "@/lib/guest-event-branding";

const NAV_H = "h-[4.25rem] sm:h-[4.5rem]";

function HomeIcon({ active }: { active: boolean }) {
  const c = active ? "text-eh-accent" : "text-eh-text-tertiary";
  return (
    <svg className={c} width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  );
}

function CommunityIcon({ active }: { active: boolean }) {
  const c = active ? "text-eh-accent" : "text-eh-text-tertiary";
  return (
    <svg className={c} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function GalleryIcon({ active }: { active: boolean }) {
  const c = active ? "text-eh-accent" : "text-eh-text-tertiary";
  return (
    <svg className={c} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function MoreIcon({ active }: { active: boolean }) {
  const c = active ? "text-eh-accent" : "text-eh-text-tertiary";
  return (
    <svg className={c} width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  );
}

function SideNavLink({
  href,
  label,
  active,
  icon,
  badgeCount,
}: {
  href: string;
  label: string;
  active: boolean;
  icon: (active: boolean) => ReactNode;
  badgeCount?: number;
}) {
  return (
    <Link
      href={href}
      className="flex min-w-0 max-w-[5.5rem] flex-col items-center justify-end gap-1 pb-1 pt-2 text-center text-[10px] font-semibold uppercase leading-tight tracking-wide transition sm:max-w-[6.5rem] sm:text-[11px]"
    >
      <span className="relative flex h-8 w-8 shrink-0 items-center justify-center sm:h-9 sm:w-9">
        {icon(active)}
        {badgeCount != null && badgeCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex min-w-[1.1rem] items-center justify-center rounded-full bg-eh-accent px-[3px] py-px text-[9px] font-bold leading-none text-[#0a0a0a]">
            {badgeCount > 99 ? "99+" : badgeCount}
          </span>
        ) : null}
      </span>
      <span
        className={`line-clamp-2 w-full ${guestHub.wrap} ${active ? "text-eh-accent" : "text-eh-text-tertiary"}`}
      >
        {label}
      </span>
    </Link>
  );
}

export type GuestEventBottomNavProps = {
  eventCode: string;
};

/**
 * Fixed bottom navigation for the in-event guest experience.
 * Items respect `event.modules` from entry (community, fan gallery upload, gallery tab).
 */
export function GuestEventBottomNav({ eventCode }: GuestEventBottomNavProps) {
  const pathname = usePathname();
  const base = `/guest/event-access/${eventCode}`;
  const { data: entry } = useEventEntryByCodeQuery(eventCode, { skip: !eventCode });
  const modules = entry?.data?.modules;

  const showCommunity = isModuleEnabled(modules, "community");
  const showChatHub = isChatHubAccessible(modules);
  const showGallery = isModuleEnabled(modules, "fan_gallery");
  const showUploadFab = showGallery;
  const { data: unreadEnv } = useGuestChatUnreadQuery(eventCode, {
    skip: !eventCode || !showChatHub || !showCommunity,
  });
  const chatUnreadTotal = unreadEnv?.data?.total_unread ?? 0;

  const uploadHref = `${base}/upload`;
  const uploadActive = pathname.startsWith(uploadHref);

  const homeActive = pathname === base || pathname === `${base}/`;
  const communityActive = pathname.startsWith(`${base}/community`);
  const galleryActive = pathname.startsWith(`${base}/gallery`);
  const moreActive = pathname.startsWith(`${base}/more`);

  return (
    <nav
      className="pointer-events-auto fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#14161c]/95 backdrop-blur-md supports-[padding:max(0px)]:pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      aria-label="Event navigation"
    >
      <div
        className={`mx-auto flex w-full max-w-3xl flex-nowrap items-end justify-center gap-2 px-2 sm:gap-4 md:max-w-4xl lg:max-w-5xl ${NAV_H}`}
      >
        <SideNavLink href={base} label="Home" active={homeActive} icon={(a) => <HomeIcon active={a} />} />

        {showCommunity ? (
          <SideNavLink
            href={`${base}/community`}
            label="Community"
            active={communityActive}
            icon={(a) => <CommunityIcon active={a} />}
            badgeCount={showChatHub ? chatUnreadTotal : undefined}
          />
        ) : null}

        {showUploadFab ? (
          <div className="flex shrink-0 flex-col items-center justify-end pb-1">
            <Link
              href={uploadHref}
              className="-mt-6 mb-0.5 flex size-14 items-center justify-center rounded-full bg-eh-accent text-[#0a0a0a] shadow-[0_4px_20px_rgba(253,220,83,0.35)] transition hover:brightness-95 active:scale-[0.98] sm:-mt-8 sm:size-16"
              aria-label="Upload"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                <path d="M12 5v14M5 12h14" />
              </svg>
            </Link>
            <span
              className={`text-center text-[10px] font-semibold uppercase leading-tight tracking-wide sm:text-[11px] ${uploadActive ? "text-eh-accent" : "text-eh-text-tertiary"} ${guestHub.wrap}`}
            >
              Upload
            </span>
          </div>
        ) : null}

        {showGallery ? (
          <SideNavLink
            href={`${base}/gallery`}
            label="Gallery"
            active={galleryActive}
            icon={(a) => <GalleryIcon active={a} />}
          />
        ) : null}

        <SideNavLink href={`${base}/more`} label="More" active={moreActive} icon={(a) => <MoreIcon active={a} />} />
      </div>
    </nav>
  );
}

export const GUEST_EVENT_NAV_BOTTOM_PADDING = "pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:pb-[calc(6rem+env(safe-area-inset-bottom))]";
