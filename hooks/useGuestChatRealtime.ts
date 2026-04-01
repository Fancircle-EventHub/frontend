"use client";

import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { useEffect, useRef } from "react";
import { getAuthFromStorage } from "@/lib/auth-storage";
import type { GuestChatMessage } from "@/types/chat.types";

function assignPusherGlobal(): void {
  if (typeof window === "undefined") return;
  (window as unknown as { Pusher: typeof Pusher }).Pusher = Pusher;
}

type Params = {
  roomId: string;
  enabled: boolean;
  onMessage: (message: GuestChatMessage) => void;
  onDeleteMessage: (messageId: string) => void;
};

export function useGuestChatRealtime({ roomId, enabled, onMessage, onDeleteMessage }: Params) {
  const onMessageRef = useRef(onMessage);
  const onDeleteRef = useRef(onDeleteMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
    onDeleteRef.current = onDeleteMessage;
  }, [onMessage, onDeleteMessage]);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_REVERB_APP_KEY;
    if (!enabled || !roomId || !key) return;

    const token = getAuthFromStorage().token;
    if (!token) return;

    assignPusherGlobal();

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";
    const scheme = process.env.NEXT_PUBLIC_REVERB_SCHEME ?? "http";
    const port = Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080);
    const host = process.env.NEXT_PUBLIC_REVERB_HOST ?? "localhost";

    const echo = new Echo({
      broadcaster: "reverb",
      key,
      wsHost: host,
      wsPort: port,
      wssPort: port,
      forceTLS: scheme === "https",
      enabledTransports: ["ws", "wss"],
      authEndpoint: `${apiUrl}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      },
    });

    const channel = echo.private(`guest-chat.${roomId}`);
    channel.listen(".GuestChatMessageSent", (payload: { message?: GuestChatMessage }) => {
      const msg = payload?.message;
      if (msg?.id) onMessageRef.current(msg);
    });
    channel.listen(".GuestChatMessageDeleted", (payload: { message_id?: string }) => {
      const id = payload?.message_id;
      if (id) onDeleteRef.current(id);
    });

    return () => {
      echo.leave(`guest-chat.${roomId}`);
      echo.disconnect();
    };
  }, [enabled, roomId]);
}
