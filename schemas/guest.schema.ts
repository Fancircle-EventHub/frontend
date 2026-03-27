import { z } from "zod";

export const guestRegisterSchema = z
  .object({
    name: z.string().min(1).max(120),
    email: z.email().max(160),
    password: z.string().min(8),
    password_confirmation: z.string().min(8),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Password confirmation does not match",
    path: ["password_confirmation"],
  });

export const guestLoginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});
