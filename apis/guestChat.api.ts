import { TAG_TYPES } from "@/constants/tagTypes";
import { baseApi } from "@/services/api/baseApi";
import type { ApiEnvelope } from "@/types/api.types";
import type { GuestChatMessage, GuestChatRoomSummary } from "@/types/chat.types";

export const guestChatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    guestChatRooms: builder.query<ApiEnvelope<{ rooms: GuestChatRoomSummary[] }>, string>({
      query: (accessCode) => ({ url: `/guest/events/${accessCode}/chat/rooms` }),
      providesTags: [TAG_TYPES.GuestChat, TAG_TYPES.EventEntry],
    }),
    guestChatUnread: builder.query<
      ApiEnvelope<{ total_unread: number; by_room_id: Record<string, number> }>,
      string
    >({
      query: (accessCode) => ({ url: `/guest/events/${accessCode}/chat/unread` }),
      providesTags: [TAG_TYPES.GuestChat],
    }),
    guestChatMessages: builder.query<
      ApiEnvelope<{ messages: GuestChatMessage[]; next_before_id: string | null }>,
      { accessCode: string; roomId: string; limit?: number; beforeId?: string }
    >({
      query: ({ accessCode, roomId, limit, beforeId }) => ({
        url: `/guest/events/${accessCode}/chat/rooms/${roomId}/messages`,
        params: {
          limit: limit ?? 50,
          ...(beforeId ? { before_id: beforeId } : {}),
        },
      }),
      providesTags: (_r, _e, arg) => [{ type: TAG_TYPES.GuestChat, id: `messages-${arg.roomId}` }],
    }),
    sendGuestChatMessage: builder.mutation<
      ApiEnvelope<{ message: GuestChatMessage | null }>,
      { accessCode: string; roomId: string; body: string }
    >({
      query: ({ accessCode, roomId, body }) => ({
        url: `/guest/events/${accessCode}/chat/rooms/${roomId}/messages`,
        method: "POST",
        body: { body },
      }),
      invalidatesTags: (_r, _e, arg) => [
        TAG_TYPES.GuestChat,
        { type: TAG_TYPES.GuestChat, id: `messages-${arg.roomId}` },
        TAG_TYPES.EventEntry,
      ],
    }),
    deleteGuestChatMessage: builder.mutation<
      ApiEnvelope<null>,
      { accessCode: string; roomId: string; messageId: string }
    >({
      query: ({ accessCode, roomId, messageId }) => ({
        url: `/guest/events/${accessCode}/chat/rooms/${roomId}/messages/${messageId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, arg) => [
        TAG_TYPES.GuestChat,
        { type: TAG_TYPES.GuestChat, id: `messages-${arg.roomId}` },
        TAG_TYPES.EventEntry,
      ],
    }),
    markGuestChatRead: builder.mutation<
      ApiEnvelope<{ unread_count: number }>,
      { accessCode: string; roomId: string; lastMessageId: string }
    >({
      query: ({ accessCode, roomId, lastMessageId }) => ({
        url: `/guest/events/${accessCode}/chat/rooms/${roomId}/read`,
        method: "POST",
        body: { last_message_id: lastMessageId },
      }),
      invalidatesTags: [TAG_TYPES.GuestChat],
    }),
  }),
});

export const {
  useGuestChatRoomsQuery,
  useGuestChatUnreadQuery,
  useGuestChatMessagesQuery,
  useSendGuestChatMessageMutation,
  useDeleteGuestChatMessageMutation,
  useMarkGuestChatReadMutation,
} = guestChatApi;
