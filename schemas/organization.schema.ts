import { z } from "zod";

export const organizationRegisterFormSchema = z
  .object({
    name: z.string().min(1, "Organization name is required").max(120),
    contact_person: z.string().min(1, "Contact person is required").max(120),
    website: z.union([z.literal(""), z.string().url("Enter a valid URL (https://…)")]),
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters"),
    password_confirmation: z
      .string()
      .min(1, "Please confirm your password")
      .min(8, "Password must be at least 8 characters"),
    termsAccepted: z.boolean().refine((v) => v === true, {
      message: "You must accept the terms and the selection process",
    }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Password confirmation does not match",
    path: ["password_confirmation"],
  });

/** Alias for API-aligned naming (same shape as form). */
export const organizationRegisterSchema = organizationRegisterFormSchema;

export const organizationLoginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});
