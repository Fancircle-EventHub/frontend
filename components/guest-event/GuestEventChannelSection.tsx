"use client";

import Link from "next/link";
import { useEventEntryByCodeQuery } from "@/apis/event.api";
import { useGuestChatRoomsQuery } from "@/apis/guestChat.api";
import { GuestChatThread } from "@/components/guest-event/GuestChatThread";
import { PageCenterSpinner } from "@/components/ui/PageCenterSpinner";
import { guestHub } from "@/lib/guest-event-branding";
import { guestChatRoomIdForEvent } from "@/lib/guest-chat-rooms";
import { isChannelEnabled } from "@/lib/event-modules";

type Props = {
  accessCode: string;
};

export function GuestEventChannelSection({ accessCode }: Props) {
  const { data: entryEnvelope } = useEventEntryByCodeQuery(accessCode, { skip: !accessCode });
  const modules = entryEnvelope?.data?.modules;
  const channelOn = isChannelEnabled(modules);
  const event = entryEnvelope?.data;

  const { data: roomsEnvelope, isLoading, isError, refetch } = useGuestChatRoomsQuery(accessCode, {
    skip: !accessCode || !channelOn,
  });

  const rooms = roomsEnvelope?.data?.rooms ?? [];
  const roomId = guestChatRoomIdForEvent(rooms);

  const cityOrTitle = (event?.city ?? event?.title ?? "Channel").trim();
  const headerLabel = `Event chat: ${cityOrTitle}`;

  if (!channelOn) {
    return null;
  }

  if (isLoading && rooms.length === 0) {
    return (
      <section className="rounded-2xl border border-white/10 bg-[color:var(--guest-card)] p-4">
        <PageCenterSpinner />
      </section>
    );
  }

  if (isError || !roomId) {
    return (
      <section className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center">
        <p className="text-sm text-red-300">
          {isError ? "Couldn't load event channel." : "Event channel isn't available yet."}
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          className={`mt-4 text-xs font-semibold uppercase tracking-wide hover:underline ${guestHub.accent}`}
        >
          Try again
        </button>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[color:var(--guest-elevated)] to-[color:var(--guest-bg)] shadow-inner">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="size-2 shrink-0 rounded-full bg-eh-accent shadow-[0_0_8px_rgba(253,220,83,0.6)]" aria-hidden />
          <h2 className={`truncate text-[11px] font-bold uppercase tracking-[0.18em] ${guestHub.fg}`}>{headerLabel}</h2>
        </div>
        <Link
          href={`/guest/event-access/${accessCode}/chat/${roomId}`}
          className={`shrink-0 rounded-lg p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white ${guestHub.wrap}`}
          aria-label="Open channel in full view"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        </Link>
      </div>
      <div className="flex max-h-[min(70vh,520px)] min-h-[280px] flex-col">
        <GuestChatThread key={`${accessCode}-${roomId}`} accessCode={accessCode} roomId={roomId} />
      </div>
    </section>
  );
}
