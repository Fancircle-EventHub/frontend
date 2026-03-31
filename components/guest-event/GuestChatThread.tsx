"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  useDeleteGuestChatMessageMutation,
  useGuestChatMessagesQuery,
  useMarkGuestChatReadMutation,
  useSendGuestChatMessageMutation,
} from "@/apis/guestChat.api";
import { useGuestSessionQuery } from "@/apis/guest.api";
import { Button } from "@/components/ui/button";
import { PageCenterSpinner } from "@/components/ui/PageCenterSpinner";
import { extractApiErrorMessage } from "@/lib/api-error";
import { guestHub } from "@/lib/guest-event-branding";
import type { GuestChatMessage } from "@/types/chat.types";

type Props = {
  accessCode: string;
  roomId: string;
};

type PendingMsg = GuestChatMessage & { _optimistic?: boolean };

const EMPTY_MESSAGES: GuestChatMessage[] = [];

function sortMessages(a: GuestChatMessage, b: GuestChatMessage): number {
  const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
  const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
  if (ta !== tb) return ta - tb;
  return a.id.localeCompare(b.id);
}

export function GuestChatThread({ accessCode, roomId }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const { data: sessionEnv } = useGuestSessionQuery();
  const myGuestId = sessionEnv?.data?.guest?.id ?? "";

  const [beforeId, setBeforeId] = useState<string | undefined>(undefined);
  const [stashedTail, setStashedTail] = useState<GuestChatMessage[] | null>(null);
  const [hiddenIds, setHiddenIds] = useState<Record<string, true>>({});
  const [pending, setPending] = useState<PendingMsg[]>([]);
  const [composer, setComposer] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);

  const PAGE_SIZE = 50;

  const { data, isLoading, isError, error, refetch, isFetching } = useGuestChatMessagesQuery(
    { accessCode, roomId, beforeId, limit: PAGE_SIZE },
    { skip: !accessCode || !roomId },
  );

  const pageMessages = useMemo(() => data?.data?.messages ?? EMPTY_MESSAGES, [data]);

  const [sendMessage, { isLoading: sending }] = useSendGuestChatMessageMutation();
  const [deleteMessage, { isLoading: deletingId }] = useDeleteGuestChatMessageMutation();

  const nextBeforeId = data?.data?.next_before_id ?? null;

  const merged = useMemo(() => {
    if (beforeId === undefined) {
      if (pageMessages.length === 0) return [];
      return [...pageMessages].sort(sortMessages);
    }
    if (stashedTail === null) return [];
    const ids = new Set(stashedTail.map((m) => m.id));
    const add = pageMessages.filter((m) => !ids.has(m.id));
    if (add.length === 0) return stashedTail;
    return [...add, ...stashedTail].sort(sortMessages);
  }, [pageMessages, beforeId, stashedTail]);

  const mergedVisible = useMemo(
    () => merged.filter((m) => !hiddenIds[m.id]),
    [merged, hiddenIds],
  );

  const display = useMemo(() => {
    const map = new Map<string, GuestChatMessage>();
    for (const m of mergedVisible) {
      map.set(m.id, m);
    }
    for (const m of pending) {
      map.set(m.id, m);
    }
    return Array.from(map.values()).sort(sortMessages);
  }, [mergedVisible, pending]);

  const lastMessageId = display.length > 0 ? display[display.length - 1]?.id : null;

  const [markRead] = useMarkGuestChatReadMutation();

  useEffect(() => {
    if (!lastMessageId || lastMessageId.startsWith("temp-") || !accessCode || !roomId) return;
    void markRead({ accessCode, roomId, lastMessageId }).catch(() => {});
  }, [lastMessageId, accessCode, roomId, markRead]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [display.length]);

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    const text = composer.trim();
    if (!text) return;
    setSendError(null);
    const tempId = `temp-${Date.now()}`;
    const optimistic: PendingMsg = {
      id: tempId,
      guest_id: myGuestId,
      username: null,
      body: text,
      created_at: new Date().toISOString(),
      _optimistic: true,
    };
    setPending((p) => [...p, optimistic]);
    setComposer("");
    try {
      await sendMessage({ accessCode, roomId, body: text }).unwrap();
      setPending((p) => p.filter((m) => m.id !== tempId));
      setBeforeId(undefined);
      setStashedTail(null);
      await refetch();
    } catch (err) {
      setPending((p) => p.filter((m) => m.id !== tempId));
      setComposer(text);
      setSendError(extractApiErrorMessage(err));
    }
  }

  async function onDelete(messageId: string) {
    if (messageId.startsWith("temp-")) return;
    try {
      await deleteMessage({ accessCode, roomId, messageId }).unwrap();
      setHiddenIds((prev) => ({ ...prev, [messageId]: true }));
    } catch {
      /* ignore */
    }
  }

  function loadOlder() {
    if (!nextBeforeId || pageMessages.length < PAGE_SIZE) return;
    setStashedTail(merged);
    setBeforeId(nextBeforeId);
  }

  if (isLoading && merged.length === 0 && pending.length === 0 && beforeId === undefined) {
    return <PageCenterSpinner />;
  }

  if (isError) {
    const status =
      typeof error === "object" && error !== null && "status" in error
        ? (error as { status?: number }).status
        : undefined;
    const msg =
      status === 403 ? "You don’t have access to this chat." : extractApiErrorMessage(error);
    return (
      <div className={`rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center ${guestHub.fgMuted}`}>
        <p className="text-sm text-red-300">{msg}</p>
        <Button type="button" variant="secondary" className="mt-4" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const showLoadOlder = pageMessages.length >= PAGE_SIZE && Boolean(nextBeforeId);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {showLoadOlder ? (
        <div className="flex shrink-0 justify-center py-2">
          <button
            type="button"
            onClick={() => loadOlder()}
            disabled={isFetching}
            className={`text-xs font-semibold uppercase tracking-wide hover:underline disabled:opacity-50 ${guestHub.accent}`}
          >
            {isFetching ? "Loading…" : "Load older messages"}
          </button>
        </div>
      ) : null}

      <ul className="min-h-0 flex-1 space-y-3 overflow-y-auto px-1 py-2">
        {display.length === 0 ? (
          <li className={`text-center text-sm ${guestHub.fgMuted}`}>No messages yet — say hello.</li>
        ) : (
          display.map((m) => {
            const mine = Boolean(myGuestId && m.guest_id === myGuestId);
            const avatarUrl = m.avatar_url?.trim() || null;
            const initial = (m.username?.trim()?.[0] ?? "?").toUpperCase();
            return (
              <li key={m.id} className={`flex gap-2 ${mine ? "justify-end" : "justify-start"}`}>
                {!mine ? (
                  <div className="relative size-9 shrink-0 overflow-hidden rounded-full border border-white/10 bg-white/10">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" className="size-full object-cover" />
                    ) : (
                      <span className={`flex size-full items-center justify-center text-xs font-bold ${guestHub.fgMuted}`}>
                        {initial}
                      </span>
                    )}
                  </div>
                ) : null}
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    mine ? "bg-eh-accent/25 text-eh-text-primary" : `${guestHub.surface} ${guestHub.fg}`
                  }`}
                >
                  {!mine ? (
                    <p className={`text-[10px] font-bold uppercase tracking-wide ${guestHub.fgMuted}`}>
                      {m.username ? `@${m.username}` : "Fan"}
                    </p>
                  ) : null}
                  <p className="mt-0.5 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{m.body}</p>
                  {mine && !m.id.startsWith("temp-") ? (
                    <button
                      type="button"
                      onClick={() => void onDelete(m.id)}
                      disabled={deletingId}
                      className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-red-400/90 hover:underline"
                    >
                      Delete
                    </button>
                  ) : null}
                </div>
              </li>
            );
          })
        )}
        <div ref={bottomRef} />
      </ul>

      <form onSubmit={(e) => void onSend(e)} className="shrink-0 border-t border-white/10 bg-[color:var(--guest-bg)] p-3">
        {sendError ? <p className="mb-2 text-center text-xs text-red-400">{sendError}</p> : null}
        <div className="flex gap-2">
          <textarea
            value={composer}
            onChange={(e) => setComposer(e.target.value)}
            placeholder="Message…"
            rows={2}
            maxLength={2000}
            className="min-h-[44px] flex-1 resize-y rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/35"
          />
          <Button type="submit" disabled={sending || !composer.trim()} className="self-end px-5 py-2.5 min-w-[5.5rem]">
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}
