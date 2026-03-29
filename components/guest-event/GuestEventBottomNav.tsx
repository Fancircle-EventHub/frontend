"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_H = "h-[4.25rem] sm:h-[4.5rem]";

type Item = {
  href: string;
  label: string;
  match: (path: string) => boolean;
  icon: (active: boolean) => ReactNode;
};

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
}: {
  href: string;
  label: string;
  active: boolean;
  icon: (active: boolean) => ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex min-w-0 flex-col items-center justify-end gap-1 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide transition sm:text-[11px]"
    >
      <span className="flex h-8 w-8 items-center justify-center sm:h-9 sm:w-9">{icon(active)}</span>
      <span className={active ? "text-eh-accent" : "text-eh-text-tertiary"}>{label}</span>
    </Link>
  );
}

export type GuestEventBottomNavProps = {
  eventCode: string;
};

/**
 * Fixed bottom navigation for the in-event guest experience.
 * Responsive: full-width on phones; content capped and centered on tablet/desktop.
 */
export function GuestEventBottomNav({ eventCode }: GuestEventBottomNavProps) {
  const pathname = usePathname();
  const base = `/guest/event-access/${eventCode}`;

  const items: Item[] = [
    {
      href: base,
      label: "Home",
      match: (p) => p === base || p === `${base}/`,
      icon: (a) => <HomeIcon active={a} />,
    },
    {
      href: `${base}/community`,
      label: "Community",
      match: (p) => p.startsWith(`${base}/community`),
      icon: (a) => <CommunityIcon active={a} />,
    },
    {
      href: `${base}/gallery`,
      label: "Gallery",
      match: (p) => p.startsWith(`${base}/gallery`),
      icon: (a) => <GalleryIcon active={a} />,
    },
    {
      href: `${base}/more`,
      label: "More",
      match: (p) => p.startsWith(`${base}/more`),
      icon: (a) => <MoreIcon active={a} />,
    },
  ];

  const uploadHref = `${base}/upload`;
  const uploadActive = pathname.startsWith(uploadHref);

  return (
    <nav
      className="pointer-events-auto fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#14161c]/95 backdrop-blur-md supports-[padding:max(0px)]:pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      aria-label="Event navigation"
    >
      <div
        className={`mx-auto grid w-full max-w-3xl grid-cols-5 items-end px-0.5 sm:px-3 md:max-w-4xl lg:max-w-5xl ${NAV_H}`}
      >
        <SideNavLink href={items[0].href} label={items[0].label} active={items[0].match(pathname)} icon={items[0].icon} />
        <SideNavLink href={items[1].href} label={items[1].label} active={items[1].match(pathname)} icon={items[1].icon} />

        <div className="flex flex-col items-center justify-end pb-1">
          <Link
            href={uploadHref}
            className="-mt-7 mb-0.5 flex size-14 items-center justify-center rounded-full bg-eh-accent text-[#0a0a0a] shadow-[0_4px_20px_rgba(253,220,83,0.35)] transition hover:brightness-95 active:scale-[0.98] sm:-mt-8 sm:size-16"
            aria-label="Upload"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
              <path d="M12 5v14M5 12h14" />
            </svg>
          </Link>
          <span
            className={`text-[10px] font-semibold uppercase tracking-wide sm:text-[11px] ${uploadActive ? "text-eh-accent" : "text-eh-text-tertiary"}`}
          >
            Upload
          </span>
        </div>

        <SideNavLink href={items[2].href} label={items[2].label} active={items[2].match(pathname)} icon={items[2].icon} />
        <SideNavLink href={items[3].href} label={items[3].label} active={items[3].match(pathname)} icon={items[3].icon} />
      </div>
    </nav>
  );
}

/** Bottom padding so main content clears the fixed nav (safe area + bar). */
export const GUEST_EVENT_NAV_BOTTOM_PADDING = "pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:pb-[calc(6rem+env(safe-area-inset-bottom))]";
