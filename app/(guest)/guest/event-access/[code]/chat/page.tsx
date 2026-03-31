"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useGuestChatRoomsQuery } from "@/apis/guestChat.api";
import { PageCenterSpinner } from "@/components/ui/PageCenterSpinner";
import { useGuestChatHubRedirect } from "@/hooks/useGuestChatHubRedirect";
import { guestHub } from "@/lib/guest-event-branding";

export default function GuestChatRoomsPage() {
  const params = useParams<{ code: string }>();
  const code = params.code ?? "";
  const gate = useGuestChatHubRedirect(code);
  const { data, isLoading, isError, refetch } = useGuestChatRoomsQuery(code, { skip: !code || gate !== "ok" });

  if (!code || code === "no-context") {
    notFound();
  }

  if (gate !== "ok") {
    return <PageCenterSpinner fixed />;
  }

  const rooms = data?.data?.rooms ?? [];

  return (
    <div className="flex min-h-0 flex-1 flex-col px-4 pb-8 pt-6 sm:px-6 lg:mx-auto lg:max-w-xl">
      <h1 className={`text-2xl font-bold ${guestHub.fg}`}>Chats</h1>
      <p className={`mt-1 text-sm ${guestHub.fgMuted}`}>Channel, meetups, and carpool conversations.</p>

      {isLoading ? (
        <div className="mt-12 flex justify-center">
          <PageCenterSpinner />
        </div>
      ) : isError ? (
        <div className={`mt-8 text-center text-sm ${guestHub.fgMuted}`}>
          <p>Couldn&apos;t load chats.</p>
          <button
            type="button"
            onClick={() => void refetch()}
            className={`mt-3 text-xs font-semibold uppercase tracking-wide hover:underline ${guestHub.accent}`}
          >
            Retry
          </button>
        </div>
      ) : rooms.length === 0 ? (
        <p className={`mt-8 text-sm ${guestHub.fgMuted}`}>No chats available yet.</p>
      ) : (
        <ul className="mt-6 space-y-2">
          {rooms.map((r) => (
            <li key={r.id}>
              <Link
                href={`/guest/event-access/${code}/chat/${r.id}`}
                className={`flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-white/10 p-4 text-left transition ${guestHub.surface} ${guestHub.cardHoverBorder}`}
              >
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-semibold ${guestHub.fg} ${guestHub.wrap}`}>{r.title}</p>
                  <p className={`mt-0.5 text-xs capitalize ${guestHub.fgMuted}`}>
                    {r.scope === "event" ? "Channel" : r.scope}
                  </p>
                  {r.last_message_preview ? (
                    <p className={`mt-1 line-clamp-2 text-xs ${guestHub.fgMuted}`}>{r.last_message_preview}</p>
                  ) : null}
                </div>
                {r.unread_count > 0 ? (
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-eh-accent text-[11px] font-bold text-[#0a0a0a]">
                    {r.unread_count > 99 ? "99+" : r.unread_count}
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
