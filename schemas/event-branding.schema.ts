import { optionalStoragePathOrLegacyUrl } from "@/lib/storage-path";
import { z } from "zod";

const hex6 = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Use a 6-digit hex color (e.g. #23272F)");

export const eventBrandingSchema = z.object({
  title: z.string().min(1, "Heading is required").max(180),
  description: z
    .string()
    .max(5000)
    .optional()
    .transform((s) => (s === undefined || s.trim() === "" ? undefined : s.trim())),
  logo_url: optionalStoragePathOrLegacyUrl,
  hero_image_url: optionalStoragePathOrLegacyUrl,
  background_color: hex6,
  font_color: hex6,
  button_color: hex6,
});

export type EventBrandingFormValues = z.infer<typeof eventBrandingSchema>;
