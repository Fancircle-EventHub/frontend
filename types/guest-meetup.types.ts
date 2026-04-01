export type GuestMeetupItem = {
  id: string;
  title: string;
  description: string | null;
  meetup_at: string;
  location: string;
  max_capacity: number | null;
  participant_count: number;
  spots_left: number | null;
  joined: boolean;
  image_url: string | null;
  created_by_guest_id: string | null;
  display_image_url: string | null;
};

export type OrganizationMeetupItem = {
  id: string;
  title: string;
  description: string | null;
  meetup_at: string;
  location: string;
  max_capacity: number | null;
  participant_count: number;
  image_url: string | null;
  created_by_guest_id: string | null;
  display_image_url: string | null;
};
