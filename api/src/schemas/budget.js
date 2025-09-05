import { z } from "zod";

export const budgetSchema = z.object({
  title: z.string().max(255),
  user_id: z.coerce.number().int().positive(),
  limit: z.number().nullable(),
  date: z.string().length(7),
  account_id: z.coerce.number().int().positive(),
});

export const updateBudgetSchema = budgetSchema.partial();