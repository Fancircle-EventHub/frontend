export const EVENT_MODULE_LIST = [
  { id: "event_info", title: "Event info", description: "Dates, venue, and essential details for your guests." },
  { id: "community", title: "Community", description: "Discussion and social feed inside the hub." },
  { id: "meetups", title: "Meetups", description: "Let fans coordinate informal meetups before the show." },
  { id: "carpooling", title: "Carpooling", description: "Share rides and reduce traffic around the venue." },
  { id: "fan_gallery", title: "Fan gallery", description: "Photo wall curated from fan uploads." },
  { id: "tour_promotion", title: "Tour promotion", description: "Manual external links (tickets, partners) on the guest hub." },
  { id: "notifications", title: "Notifications", description: "Push-style updates for ticket holders." },
  {
    id: "channel",
    title: "Channel",
    description: "Event-wide guest conversation — one channel for everyone at the show.",
  },
  { id: "voting", title: "Voting", description: "Polls and quick votes to drive engagement." },
  { id: "merch", title: "Merch", description: "Highlight merchandise and pre-order links." },
  { id: "social_links", title: "Social links", description: "Official profiles and hashtag in one place." },
  { id: "streaming_links", title: "Streaming links", description: "Pre-save and streaming destinations." },
  { id: "maps", title: "Maps & wayfinding", description: "Venue map, parking, and accessibility notes." },
] as const;

export type EventModuleId = (typeof EVENT_MODULE_LIST)[number]["id"];

export const EVENT_MODULE_TOTAL = EVENT_MODULE_LIST.length;

export const MODULE_IMPLEMENTATION: Record<EventModuleId, "live" | "coming_soon"> = {
  event_info: "live",
  community: "live",
  meetups: "live",
  carpooling: "live",
  fan_gallery: "live",
  voting: "coming_soon",
  merch: "coming_soon",
  tour_promotion: "live",
  social_links: "coming_soon",
  streaming_links: "coming_soon",
  maps: "coming_soon",
  notifications: "live",
  channel: "live",
};

export const LIVE_MODULE_IDS = (
  Object.entries(MODULE_IMPLEMENTATION) as [EventModuleId, "live" | "coming_soon"][]
)
  .filter(([, status]) => status === "live")
  .map(([id]) => id);

export const LIVE_MODULE_TOTAL = LIVE_MODULE_IDS.length;
