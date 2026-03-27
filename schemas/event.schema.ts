import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().min(1).max(180),
  description: z.string().max(1000).optional().or(z.literal("")),
});
