"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useDeleteGuestChatMessageMutation,
  useGuestChatMessagesQuery,
  useMarkGuestChatReadMutation,
  useSendGuestChatMessageMutation,
} from "@/apis/guestChat.api";
import { useGuestSessionQuery } from "@/apis/guest.api";
import { PageCenterSpinner } from "@/components/ui/PageCenterSpinner";
import { extractApiErrorMessage } from "@/lib/api-error";
import { guestHub } from "@/lib/guest-event-branding";
import { useGuestChatRealtime } from "@/hooks/useGuestChatRealtime";
import type { GuestChatMessage } from "@/types/chat.types";

type Props = {
  accessCode: string;
  roomId: string;
};

type PendingMsg = GuestChatMessage & { _optimistic?: boolean };

const EMPTY_MESSAGES: GuestChatMessage[] = [];

function SendPlaneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  );
}

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
  const [socketMessages, setSocketMessages] = useState<GuestChatMessage[]>([]);
  const seenIdsRef = useRef<Set<string>>(new Set());
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

  useEffect(() => {
    for (const m of merged) {
      seenIdsRef.current.add(m.id);
    }
  }, [merged]);

  const mergedIds = useMemo(() => new Set(merged.map((m) => m.id)), [merged]);
  const socketMessagesNotInRest = useMemo(
    () => socketMessages.filter((m) => !mergedIds.has(m.id)),
    [socketMessages, mergedIds],
  );

  const handleRealtimeMessage = useCallback((msg: GuestChatMessage) => {
    if (!msg.id || seenIdsRef.current.has(msg.id)) return;
    seenIdsRef.current.add(msg.id);
    setPending((p) =>
      p.filter((m) => !(m.id.startsWith("temp-") && m.guest_id === msg.guest_id && m.body === msg.body)),
    );
    setSocketMessages((prev) => (prev.some((x) => x.id === msg.id) ? prev : [...prev, msg]));
  }, []);

  const handleRealtimeDelete = useCallback((messageId: string) => {
    seenIdsRef.current.delete(messageId);
    setHiddenIds((prev) => ({ ...prev, [messageId]: true }));
    setSocketMessages((s) => s.filter((m) => m.id !== messageId));
  }, []);

  useGuestChatRealtime({
    roomId,
    enabled: Boolean(accessCode && roomId && !isError),
    onMessage: handleRealtimeMessage,
    onDeleteMessage: handleRealtimeDelete,
  });

  const display = useMemo(() => {
    const map = new Map<string, GuestChatMessage>();
    for (const m of mergedVisible) {
      map.set(m.id, m);
    }
    for (const m of pending) {
      map.set(m.id, m);
    }
    for (const m of socketMessagesNotInRest) {
      map.set(m.id, m);
    }
    return Array.from(map.values()).sort(sortMessages);
  }, [mergedVisible, pending, socketMessagesNotInRest]);

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
      const res = await sendMessage({ accessCode, roomId, body: text }).unwrap();
      const mid = res?.data?.message?.id;
      if (mid) seenIdsRef.current.add(mid);
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
    } catch {}
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
        <button
          type="button"
          className={`mt-4 rounded-lg border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/90 transition hover:bg-white/10`}
          onClick={() => void refetch()}
        >
          Retry
        </button>
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

      <ul className="min-h-0 flex-1 space-y-4 overflow-y-auto px-2 py-3 [scrollbar-gutter:stable]">
        {display.length === 0 ? (
          <li className={`text-center text-sm ${guestHub.fgMuted}`}>No messages yet — say hello.</li>
        ) : (
          display.map((m) => {
            const mine = Boolean(myGuestId && m.guest_id === myGuestId);
            const avatarUrl = m.avatar_url?.trim() || null;
            const initial = (m.username?.trim()?.[0] ?? "?").toUpperCase();
            const displayName = (m.username?.trim() || "Fan").toUpperCase();
            return (
              <li key={m.id} className={`flex gap-2 ${mine ? "justify-end" : "justify-start"}`}>
                {!mine ? (
                  <div className="relative size-9 shrink-0 overflow-hidden rounded-full border border-white/10 bg-zinc-800/80">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" className="size-full object-cover" />
                    ) : (
                      <span className={`flex size-full items-center justify-center text-xs font-bold text-eh-accent`}>
                        {initial}
                      </span>
                    )}
                  </div>
                ) : null}
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-snug ${
                    mine
                      ? "bg-eh-accent/20 text-white"
                      : "border border-white/10 bg-zinc-800/90 text-white/95"
                  }`}
                >
                  {!mine ? (
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-eh-accent">{displayName}</p>
                  ) : null}
                  <p className={`mt-1 whitespace-pre-wrap break-words [overflow-wrap:anywhere] ${!mine ? "text-white/90" : ""}`}>
                    {m.body}
                  </p>
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

      <form
        onSubmit={(e) => void onSend(e)}
        className="shrink-0 border-t border-white/10 bg-black/20 p-3 backdrop-blur-[2px]"
      >
        {sendError ? <p className="mb-2 text-center text-xs text-red-400">{sendError}</p> : null}
        <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-zinc-900/70 p-1.5 pl-3 shadow-inner">
          <textarea
            value={composer}
            onChange={(e) => setComposer(e.target.value)}
            placeholder="Write a message…"
            rows={1}
            maxLength={2000}
            className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border-0 bg-transparent px-2 py-2.5 text-base text-white placeholder:text-white/40 focus:outline-none focus:ring-0"
          />
          <button
            type="submit"
            disabled={sending || !composer.trim()}
            className={`flex shrink-0 items-center justify-center rounded-xl px-4 py-3.5 text-[#0a0a0a] shadow-sm transition hover:brightness-95 disabled:opacity-50 ${guestHub.accentBg}`}
            aria-label="Send"
          >
            {sending ? <span className="text-xs font-bold">…</span> : <SendPlaneIcon />}
          </button>
        </div>
      </form>
    </div>
  );
}
