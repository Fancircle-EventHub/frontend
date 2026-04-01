"use client";

import { useState } from "react";
import { useHydrated } from "@/hooks/useHydrated";
import { guestHub } from "@/lib/guest-event-branding";
import { GuestEventMenuDrawer } from "./GuestEventMenuDrawer";

export type GuestEventInAppHeaderProps = {
  eventCode: string;
  logoUrl?: string | null;
};

export function GuestEventInAppHeader({ eventCode, logoUrl }: GuestEventInAppHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const hydrated = useHydrated();
  const showLogo = Boolean(hydrated && logoUrl);

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-black/70 px-4 py-3 backdrop-blur-md sm:px-6">
        <button
          type="button"
          className="rounded-lg p-2 text-eh-accent transition hover:bg-white/5"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex min-w-0 flex-1 items-center justify-center px-2">
          {showLogo && logoUrl ? (
            <img
              src={logoUrl}
              alt=""
              className="h-8 max-h-9 w-auto max-w-[min(160px,calc(100vw-8rem))] object-contain object-center"
            />
          ) : (
            <p className={`text-center text-sm font-bold tracking-tight ${guestHub.wrap}`}>
              <span className="text-eh-accent">Fancircle</span> <span className="text-white">EventHub</span>
            </p>
          )}
        </div>
        <div className="w-10 shrink-0" aria-hidden />
      </header>
      <GuestEventMenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} eventCode={eventCode} />
    </>
  );
}
