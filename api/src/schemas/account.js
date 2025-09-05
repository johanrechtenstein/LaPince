import { z } from "zod";

export const accountSchema = z.object({
  title: z.string().min(1).max(255),
  user_id: z.coerce.number().int().positive(),
});

export const updateAccountSchema = accountSchema.partial();