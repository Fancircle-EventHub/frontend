"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useGuestChatRoomsQuery } from "@/apis/guestChat.api";
import { GuestChatCardShell } from "@/components/guest-event/GuestChatCardShell";
import { PageCenterSpinner } from "@/components/ui/PageCenterSpinner";
import { useGuestChatHubRedirect } from "@/hooks/useGuestChatHubRedirect";
import { guestHub } from "@/lib/guest-event-branding";

function scopeLabel(scope: "event" | "meetup" | "ride"): string {
  if (scope === "event") return "Channel";
  if (scope === "meetup") return "Meetup";
  return "Carpool";
}

export default function GuestChatRoomsPage() {
  const params = useParams<{ code: string }>();
  const code = params.code ?? "";
  const base = `/guest/event-access/${code}`;
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
      <GuestChatCardShell title="All chats">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center py-16">
            <PageCenterSpinner />
          </div>
        ) : isError ? (
          <div className={`flex flex-1 flex-col items-center justify-center px-4 py-10 text-center text-sm ${guestHub.fgMuted}`}>
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
          <p className={`flex flex-1 items-center justify-center px-4 py-10 text-center text-sm ${guestHub.fgMuted}`}>
            No chats available yet.
          </p>
        ) : (
          <nav className="flex min-h-0 flex-1 flex-col overflow-hidden" aria-label="Chat rooms">
            <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3 [scrollbar-gutter:stable]">
              {rooms.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`${base}/chat/${r.id}`}
                    className={`flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-left transition ${guestHub.cardHoverBorder}`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-bold uppercase tracking-[0.12em] text-eh-accent ${guestHub.wrap}`}>
                        {r.title}
                      </p>
                      <p className={`mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/45`}>
                        {scopeLabel(r.scope)}
                      </p>
                      {r.last_message_preview ? (
                        <p className={`mt-1.5 line-clamp-2 text-xs leading-relaxed text-white/55 ${guestHub.wrap}`}>
                          {r.last_message_preview}
                        </p>
                      ) : null}
                    </div>
                    {r.unread_count > 0 ? (
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-eh-accent text-[11px] font-bold text-[#0a0a0a]">
                        {r.unread_count > 99 ? "99+" : r.unread_count}
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </GuestChatCardShell>
    </div>
  );
}
