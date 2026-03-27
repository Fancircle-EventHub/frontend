export type Event = {
  id: string;
  organization_id: string;
  title: string;
  description: string | null;
  access_code: string;
  join_link: string;
};

export type CreateEventPayload = {
  title: string;
  description?: string;
};
