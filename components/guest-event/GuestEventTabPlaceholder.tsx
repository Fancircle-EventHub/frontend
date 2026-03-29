import type { ReactNode } from "react";

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
      <h1 className="text-xl font-bold text-white sm:text-2xl">{title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-eh-text-secondary">{description}</p>
      <div className="mt-8 rounded-2xl border border-dashed border-eh-border/80 bg-[#1a1d24]/50 p-6 text-center text-xs text-eh-text-tertiary">
        Placeholder content — UI only
      </div>
      {children}
    </div>
  );
}
