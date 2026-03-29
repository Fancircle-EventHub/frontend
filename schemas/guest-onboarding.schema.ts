import { z } from "zod";

export const guestEventUsernameSchema = z
  .string()
  .trim()
  .min(3, "Use at least 3 characters")
  .max(20, "Use at most 20 characters")
  .regex(/^[a-zA-Z0-9._]+$/, "Only letters, numbers, dots, and underscores")
  .transform((s) => s.toLowerCase());

export const guestEventOnboardingFormSchema = z.object({
  username: guestEventUsernameSchema,
  avatar_key: z.string().min(1, "Add a profile photo"),
});

export type GuestEventOnboardingFormValues = z.infer<typeof guestEventOnboardingFormSchema>;
