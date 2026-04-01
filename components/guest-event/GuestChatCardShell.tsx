"use client";

import type { ReactNode } from "react";
import { guestHub } from "@/lib/guest-event-branding";

const SHELL =
  "flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[color:var(--guest-elevated)] to-[color:var(--guest-bg)] shadow-inner";

type Props = {
  /** Shown in uppercase in the header (e.g. city or “All chats”). */
  title: string;
  children: ReactNode;
  /** Optional right control (e.g. settings link). */
  headerRight?: ReactNode;
  /** Scrollable body max height (Figma-style card). */
  maxHeightClassName?: string;
  minHeightClassName?: string;
};

/**
 * Shared chrome for guest chat: status dot, uppercase title, bordered card, bounded height.
 */
export function GuestChatCardShell({
  title,
  children,
  headerRight,
  maxHeightClassName = "max-h-[min(75vh,560px)]",
  minHeightClassName = "min-h-[200px]",
}: Props) {
  return (
    <section className={SHELL}>
      <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="size-2 shrink-0 rounded-full bg-eh-accent shadow-[0_0_8px_rgba(253,220,83,0.6)]"
            aria-hidden
          />
          <h2
            className={`truncate text-[11px] font-bold uppercase tracking-[0.18em] text-white ${guestHub.wrap}`}
          >
            {title}
          </h2>
        </div>
        {headerRight ? <div className="shrink-0">{headerRight}</div> : null}
      </div>
      <div className={`flex min-h-0 flex-1 flex-col ${maxHeightClassName} ${minHeightClassName}`}>{children}</div>
    </section>
  );
}
