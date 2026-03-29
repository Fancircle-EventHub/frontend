export const EVENT_MODULE_LIST = [
  { id: "event_info", title: "Event info", description: "Dates, venue, and essential details for your guests." },
  { id: "community", title: "Community", description: "Discussion and social feed inside the hub." },
  { id: "meetups", title: "Meetups", description: "Let fans coordinate informal meetups before the show." },
  { id: "carpooling", title: "Carpooling", description: "Share rides and reduce traffic around the venue." },
  { id: "fan_gallery", title: "Fan gallery", description: "Photo wall curated from fan uploads." },
  { id: "voting", title: "Voting", description: "Polls and quick votes to drive engagement." },
  { id: "merch", title: "Merch", description: "Highlight merchandise and pre-order links." },
  { id: "tour_promotion", title: "Tour promotion", description: "Promote other dates and tour content." },
  { id: "social_links", title: "Social links", description: "Official profiles and hashtag in one place." },
  { id: "streaming_links", title: "Streaming links", description: "Pre-save and streaming destinations." },
  { id: "maps", title: "Maps & wayfinding", description: "Venue map, parking, and accessibility notes." },
  { id: "notifications", title: "Notifications", description: "Push-style updates for ticket holders." },
] as const;

export type EventModuleId = (typeof EVENT_MODULE_LIST)[number]["id"];

export const EVENT_MODULE_TOTAL = EVENT_MODULE_LIST.length;
