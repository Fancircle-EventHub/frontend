"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEventEntryByCodeQuery } from "@/apis/event.api";
import { useGuestChatRoomsQuery } from "@/apis/guestChat.api";
import { GuestChatCardShell } from "@/components/guest-event/GuestChatCardShell";
import { GuestChatThread } from "@/components/guest-event/GuestChatThread";
import { useGuestChatHubRedirect } from "@/hooks/useGuestChatHubRedirect";
import { PageCenterSpinner } from "@/components/ui/PageCenterSpinner";
import { guestHub } from "@/lib/guest-event-branding";

export default function GuestChatRoomPage() {
  const params = useParams<{ code: string; roomId: string }>();
  const code = params.code ?? "";
  const roomId = params.roomId ?? "";
  const base = `/guest/event-access/${code}`;
  const gate = useGuestChatHubRedirect(code);
  const { data: roomsEnvelope } = useGuestChatRoomsQuery(code, { skip: !code || gate !== "ok" });
  const { data: entryEnvelope } = useEventEntryByCodeQuery(code, { skip: !code || gate !== "ok" });

  if (!code || code === "no-context" || !roomId) {
    notFound();
  }

  if (gate !== "ok") {
    return <PageCenterSpinner fixed />;
  }

  const rooms = roomsEnvelope?.data?.rooms ?? [];
  const room = rooms.find((r) => r.id === roomId);
  const city = entryEnvelope?.data?.city?.trim();
  const headerTitle =
    room?.title != null && room.title.trim() !== ""
      ? `Event chat: ${room.title.trim()}`
      : city
        ? `Event chat: ${city}`
        : "Event chat";

  return (
    <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-4 sm:px-6 lg:mx-auto lg:max-w-xl">
      <div className="mb-3 flex shrink-0 items-center gap-3">
        <Link
          href={`${base}/chat`}
          className={`text-xs font-semibold uppercase tracking-wide hover:underline ${guestHub.accent}`}
        >
          ← All chats
        </Link>
      </div>
      <GuestChatCardShell
        title={headerTitle}
        maxHeightClassName="max-h-[min(78vh,600px)]"
        minHeightClassName="min-h-[320px]"
      >
        <GuestChatThread key={`${code}-${roomId}`} accessCode={code} roomId={roomId} />
      </GuestChatCardShell>
    </div>
  );
}
