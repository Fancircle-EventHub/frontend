export type GuestEventMediaKind = "image" | "video";

export type GuestEventMediaItem = {
  id: string;
  event_id: string;
  guest_id: string;
  kind: GuestEventMediaKind;
  mime_type: string;
  url: string;
  username: string | null;
  created_at: string;
};

export type OrganizationGuestMediaPayload = {
  media: GuestEventMediaItem[];
  shot_of_the_night_media_id: string | null;
};
