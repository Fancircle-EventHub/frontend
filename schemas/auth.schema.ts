import { z } from "zod";

export const otpSchema = z.object({
  email: z.email(),
  otp: z.string().regex(/^\d{6}$/),
});

export const forgotPasswordSchema = z.object({
  email: z.email(),
});

export const resetPasswordSchema = z
  .object({
    email: z.email(),
    otp: z.string().regex(/^\d{6}$/),
    password: z.string().min(8),
    password_confirmation: z.string().min(8),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Password confirmation does not match",
    path: ["password_confirmation"],
  });
