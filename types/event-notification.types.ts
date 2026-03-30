export type NotificationAccentId = "amber" | "emerald" | "rose" | "sky" | "violet" | "slate";

export type OrganizationEventNotificationItem = {
  id: string;
  title: string;
  body: string;
  category: string | null;
  color?: NotificationAccentId;
  created_at: string | null;
  updated_at: string | null;
};

export type GuestEventNotificationItem = {
  id: string;
  title: string;
  body: string;
  category: string | null;
  color?: NotificationAccentId;
  created_at: string | null;
};
