"use client";

import { useEventEntryByCodeQuery } from "@/apis/event.api";
import { useGuestChatRoomsQuery } from "@/apis/guestChat.api";
import { GuestChatCardShell } from "@/components/guest-event/GuestChatCardShell";
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
    <GuestChatCardShell
      title={headerLabel}
      maxHeightClassName="max-h-[min(70vh,520px)]"
      minHeightClassName="min-h-[280px]"
    >
      <GuestChatThread key={`${accessCode}-${roomId}`} accessCode={accessCode} roomId={roomId} />
    </GuestChatCardShell>
  );
}
