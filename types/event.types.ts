export type EventStatus = "draft" | "live";

export type Event = {
  id: string;
  organization_id: string;
  status: EventStatus;
  title: string;
  description: string | null;
  artist: string | null;
  venue: string | null;
  address: string | null;
  city: string | null;
  event_date: string | null;
  start_time: string | null;
  doors_time: string | null;
  hero_image_url: string | null;
  logo_url: string | null;
  hero_image_path?: string | null;
  logo_path?: string | null;
  background_color: string | null;
  font_color: string | null;
  button_color: string | null;
  modules: Record<string, boolean> | null;
  access_code: string;
  join_link: string;
  shot_of_the_night?: {
    id: string;
    kind: "image" | "video";
    url: string;
    username: string | null;
  } | null;
  created_at?: string;
  updated_at?: string;
};

export type HubSummaryEmailResult = {
  sent: boolean;
  already_sent: boolean;
};

export type CreateEventPayload = {
  title: string;
  description?: string | null;
  artist: string;
  venue: string;
  address: string;
  city: string;
  event_date: string;
  start_time: string;
  doors_time: string;
  hero_image_url?: string | null;
};

export type UpdateEventPayload = {
  title?: string;
  description?: string | null;
  artist?: string | null;
  venue?: string | null;
  address?: string | null;
  city?: string | null;
  event_date?: string | null;
  start_time?: string | null;
  doors_time?: string | null;
  hero_image_url?: string | null;
  logo_url?: string | null;
  background_color?: string | null;
  font_color?: string | null;
  button_color?: string | null;
  modules?: Record<string, boolean> | null;
  status?: EventStatus;
  shot_of_the_night_media_id?: string | null;
};
