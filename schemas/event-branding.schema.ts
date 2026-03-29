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
  logo_url: z.preprocess(
    (raw) => {
      if (raw === undefined || raw === null || raw === "") return undefined;
      return typeof raw === "string" ? raw.trim() : undefined;
    },
    z.union([z.undefined(), z.string().url({ message: "Enter a valid logo URL" }).max(2048)]),
  ),
  hero_image_url: z.preprocess(
    (raw) => {
      if (raw === undefined || raw === null || raw === "") return undefined;
      return typeof raw === "string" ? raw.trim() : undefined;
    },
    z.union([z.undefined(), z.string().url({ message: "Enter a valid cover image URL" }).max(2048)]),
  ),
  background_color: hex6,
  font_color: hex6,
  button_color: hex6,
});

export type EventBrandingFormValues = z.infer<typeof eventBrandingSchema>;
