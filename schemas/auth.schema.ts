import { z } from "zod";

export const otpSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
  remember: z.boolean().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
});

export const resetPasswordSchema = z
  .object({
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
    otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
    password: z.string().min(1, "Password is required").min(8, "Password must be at least 8 characters"),
    password_confirmation: z
      .string()
      .min(1, "Please confirm your password")
      .min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Password confirmation does not match",
    path: ["password_confirmation"],
  });
