import type { CSSProperties } from "react";
import type { Event } from "@/types/event.types";

/** Defaults aligned with `EventBrandingScreen` (branding wizard). */
export const GUEST_BRANDING_DEFAULTS = {
  background: "#23272F",
  font: "#FFFFFF",
  button: "#FDDC53",
} as const;

function normalizeHex(input: string | null | undefined): string | null {
  if (!input?.trim()) return null;
  let s = input.trim();
  if (!s.startsWith("#")) s = `#${s.replace(/^#/, "")}`;
  const hex = s.replace(/[^0-9A-Fa-f]/g, "").slice(0, 6);
  if (hex.length !== 6) return null;
  return `#${hex.toUpperCase()}`;
}

/**
 * CSS variables consumed by guest hub UI (`GuestEventAccessLayout` and children).
 * Organizer branding colors from PATCH / organization event → `GET /events/:code/entry`.
 */
export function guestEventBrandingVars(event: Event | undefined | null): CSSProperties {
  const bg = normalizeHex(event?.background_color) ?? GUEST_BRANDING_DEFAULTS.background;
  const fg = normalizeHex(event?.font_color) ?? GUEST_BRANDING_DEFAULTS.font;
  const btn = normalizeHex(event?.button_color) ?? GUEST_BRANDING_DEFAULTS.button;

  return {
    "--guest-bg": bg,
    "--guest-fg": fg,
    "--guest-btn": btn,
    "--guest-card": `color-mix(in srgb, ${bg} 76%, #0a0a0f)`,
    "--guest-elevated": `color-mix(in srgb, ${bg} 88%, #000)`,
    "--guest-nav": `color-mix(in srgb, ${bg} 92%, #000)`,
  } as CSSProperties;
}

/** Tailwind-friendly fragments (parent must set `guestEventBrandingVars`). */
export const guestHub = {
  fg: "text-[color:var(--guest-fg)]",
  fgMuted: "text-[color:var(--guest-fg)]/70",
  navInactive: "text-[color:var(--guest-fg)]/45",
  accent: "text-[color:var(--guest-btn)]",
  accentBg: "bg-[color:var(--guest-btn)]",
  accentBorder: "border-[color:var(--guest-btn)]",
  accentBorderSubtle: "border-[color:color-mix(in_srgb,var(--guest-btn)_40%,transparent)]",
  accentBorderHover: "hover:border-[color:var(--guest-btn)]",
  accentRing: "focus-visible:ring-[color:var(--guest-btn)]",
  /** Muted accent border on cards (replaces `border-eh-accent/35–40`). */
  cardHoverBorder: "hover:border-[color:color-mix(in_srgb,var(--guest-btn)_38%,transparent)]",
  surface: "bg-[color:var(--guest-card)]",
  elevated: "bg-[color:var(--guest-elevated)]",
  nav: "bg-[color:var(--guest-nav)]",
  /**
   * Use on text inside grids/flex rows so long compounds (e.g. German) wrap instead of overflowing.
   * Parent grid/flex items should also use `min-w-0` where needed.
   */
  wrap: "min-w-0 max-w-full break-words [overflow-wrap:anywhere]",
} as const;
