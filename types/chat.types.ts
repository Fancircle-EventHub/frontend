export type GuestChatRoomSummary = {
  id: string;
  scope: "event" | "meetup" | "ride";
  title: string;
  context: {
    meetup_id: string | null;
    ride_post_id: string | null;
  };
  unread_count: number;
  last_message_at: string | null;
  last_message_preview: string | null;
};

export type GuestChatMessage = {
  id: string;
  guest_id: string;
  username: string | null;
  avatar_url?: string | null;
  body: string;
  created_at: string | null;
};
