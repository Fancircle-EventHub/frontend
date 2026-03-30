export type GuestRidePostItem = {
  id: string;
  type: "offer" | "request";
  origin_area: string;
  destination_area?: string | null;
  departure_at: string;
  seats_available: number | null;
  note: string | null;
  interest_count: number;
  is_author: boolean;
  interested: boolean;
  author_username: string | null;
  author_avatar_url?: string | null;
};
