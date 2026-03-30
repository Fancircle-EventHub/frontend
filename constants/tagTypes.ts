export const TAG_TYPES = {
  OrganizationEvent: "OrganizationEvent",
  EventEntry: "EventEntry",
  OrganizationSession: "OrganizationSession",
  GuestSession: "GuestSession",
  GuestEventOnboarding: "GuestEventOnboarding",
  GuestEventMedia: "GuestEventMedia",
  GuestEventCommunity: "GuestEventCommunity",
  GuestEventMeetups: "GuestEventMeetups",
  GuestEventRides: "GuestEventRides",
  OrganizationEventRelated: "OrganizationEventRelated",
  OrganizationEventMeetups: "OrganizationEventMeetups",
  GuestEventNotifications: "GuestEventNotifications",
  OrganizationEventNotifications: "OrganizationEventNotifications",
} as const;

export type TagType = (typeof TAG_TYPES)[keyof typeof TAG_TYPES];
