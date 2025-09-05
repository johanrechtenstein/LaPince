import { z } from "zod";

export const detailAccountSchema = z.object({
  date: z.string().min(1),
  amount: z.number(),
  title: z.string().min(1).max(255),
  type: z.string().min(1).max(255),
  account_id: z.coerce.number().int().positive(),
});

export const updateDetailAccountSchema = detailAccountSchema.partial();