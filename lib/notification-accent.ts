import type { NotificationAccentId } from "@/types/event-notification.types";

export const NOTIFICATION_ACCENT_OPTIONS: { id: NotificationAccentId; label: string }[] = [
  { id: "amber", label: "Amber" },
  { id: "emerald", label: "Green" },
  { id: "rose", label: "Rose" },
  { id: "sky", label: "Sky" },
  { id: "violet", label: "Violet" },
  { id: "slate", label: "Slate" },
];

const BORDER: Record<NotificationAccentId, string> = {
  amber: "border-amber-400/55",
  emerald: "border-emerald-400/55",
  rose: "border-rose-400/55",
  sky: "border-sky-400/55",
  violet: "border-violet-400/55",
  slate: "border-slate-400/45",
};

const RING_DOT: Record<NotificationAccentId, string> = {
  amber: "bg-amber-400",
  emerald: "bg-emerald-400",
  rose: "bg-rose-400",
  sky: "bg-sky-400",
  violet: "bg-violet-400",
  slate: "bg-slate-400",
};

function resolveAccentId(color: string | null | undefined): NotificationAccentId {
  if (color === "amber" || color === "emerald" || color === "rose" || color === "sky" || color === "violet" || color === "slate") {
    return color;
  }
  return "amber";
}

/** Full card border class for guest / org list items. */
export function notificationCardBorderClass(color: string | null | undefined): string {
  const id = resolveAccentId(color);
  return `border-2 ${BORDER[id]}`;
}

export function notificationSwatchClass(color: string | null | undefined): string {
  const id = resolveAccentId(color);
  return RING_DOT[id];
}
