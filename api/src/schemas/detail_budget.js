import { z } from "zod";

export const detailBudgetSchema = z.object({
  amount: z.number(),
  title: z.string().max(255).optional(),
  date: z.string().length(7),
  budget_id: z.coerce.number().int().positive(),
});


export const updateDetailBudgetSchema = detailBudgetSchema.partial();