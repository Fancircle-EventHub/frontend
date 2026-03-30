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
};

export type OrganizationMeetupItem = {
  id: string;
  title: string;
  description: string | null;
  meetup_at: string;
  location: string;
  max_capacity: number | null;
  participant_count: number;
};
