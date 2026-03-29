import { optionalStoragePathOrLegacyUrl } from "@/lib/storage-path";
import { z } from "zod";

export const EVENT_VENUE_VALUES = ["arena", "club", "theater", "outdoor", "other"] as const;
export type EventVenue = (typeof EVENT_VENUE_VALUES)[number];

export const createEventSchema = z.object({
  title: z.string().min(1, "Title is required").max(180),
  description: z
    .string()
    .max(5000)
    .optional()
    .transform((s) => (s === undefined || s.trim() === "" ? undefined : s.trim())),
  artist: z.string().trim().min(1, "Artist is required").max(255),
  venue: z.enum(EVENT_VENUE_VALUES, { message: "Select a venue" }),
  city: z.string().trim().min(1, "City is required").max(120),
  event_date: z
    .string()
    .trim()
    .min(1, "Date is required")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date"),
  start_time: z
    .string()
    .trim()
    .min(1, "Start time is required")
    .transform((s) => (s.length >= 5 ? s.slice(0, 5) : s))
    .refine((s) => /^\d{2}:\d{2}$/.test(s), "Enter a valid start time"),
  doors_time: z
    .string()
    .trim()
    .min(1, "Doors time is required")
    .transform((s) => (s.length >= 5 ? s.slice(0, 5) : s))
    .refine((s) => /^\d{2}:\d{2}$/.test(s), "Enter a valid doors time"),
  hero_image_url: optionalStoragePathOrLegacyUrl,
});

export type CreateEventFormValues = z.infer<typeof createEventSchema>;
