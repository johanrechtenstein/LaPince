import { z } from "zod";

export const userSchema = z.object({
  pseudo: z.string().min(1).max(255),
  email: z.string().email().max(255),
  password: z.string().min(1),
  role: z.string().min(1).max(255),
});

export const updateUserSchema = userSchema.partial();
