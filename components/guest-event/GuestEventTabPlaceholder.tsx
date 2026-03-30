import type { ReactNode } from "react";
import { guestHub } from "@/lib/guest-event-branding";

/**
 * STATIC placeholder body for secondary in-event tabs until real features ship.
 */
export function GuestEventTabPlaceholder({
  title,
  description,
  children,
}: {
  title: string;
  /** Explain what will replace this screen later */
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="px-4 pb-8 pt-6 sm:px-6 lg:mx-auto lg:max-w-2xl">
      <h1 className={`text-xl font-bold sm:text-2xl ${guestHub.fg}`}>{title}</h1>
      <p className={`mt-3 text-sm leading-relaxed ${guestHub.fgMuted}`}>{description}</p>
      <div className={`mt-8 rounded-2xl border border-dashed border-white/15 p-6 text-center text-xs ${guestHub.surface} ${guestHub.fgMuted}`}>
        Placeholder content — UI only
      </div>
      {children}
    </div>
  );
}
