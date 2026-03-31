"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { GuestChatThread } from "@/components/guest-event/GuestChatThread";
import { useGuestChatHubRedirect } from "@/hooks/useGuestChatHubRedirect";
import { PageCenterSpinner } from "@/components/ui/PageCenterSpinner";
import { guestHub } from "@/lib/guest-event-branding";

export default function GuestChatRoomPage() {
  const params = useParams<{ code: string; roomId: string }>();
  const code = params.code ?? "";
  const roomId = params.roomId ?? "";
  const gate = useGuestChatHubRedirect(code);

  if (!code || code === "no-context" || !roomId) {
    notFound();
  }

  if (gate !== "ok") {
    return <PageCenterSpinner fixed />;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col px-4 pb-2 pt-4 sm:px-6 lg:mx-auto lg:max-w-xl">
      <div className="mb-3 flex shrink-0 items-center gap-3">
        <Link
          href={`/guest/event-access/${code}/chat`}
          className={`text-xs font-semibold uppercase tracking-wide hover:underline ${guestHub.accent}`}
        >
          ← All chats
        </Link>
      </div>
      <GuestChatThread key={`${code}-${roomId}`} accessCode={code} roomId={roomId} />
    </div>
  );
}
