export const TAG_TYPES = {
  OrganizationEvent: "OrganizationEvent",
  EventEntry: "EventEntry",
  OrganizationSession: "OrganizationSession",
  GuestSession: "GuestSession",
  GuestEventOnboarding: "GuestEventOnboarding",
  GuestEventMedia: "GuestEventMedia",
  GuestEventCommunity: "GuestEventCommunity",
} as const;

export type TagType = (typeof TAG_TYPES)[keyof typeof TAG_TYPES];
