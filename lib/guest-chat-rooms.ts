import type { GuestChatRoomSummary } from "@/types/chat.types";

export function guestChatRoomIdForEvent(rooms: GuestChatRoomSummary[]): string | null {
  const r = rooms.find((x) => x.scope === "event");
  return r?.id ?? null;
}

export function guestChatRoomIdForMeetup(rooms: GuestChatRoomSummary[], meetupId: string): string | null {
  const r = rooms.find((x) => x.scope === "meetup" && x.context.meetup_id === meetupId);
  return r?.id ?? null;
}

export function guestChatRoomIdForRide(rooms: GuestChatRoomSummary[], ridePostId: string): string | null {
  const r = rooms.find((x) => x.scope === "ride" && x.context.ride_post_id === ridePostId);
  return r?.id ?? null;
}
