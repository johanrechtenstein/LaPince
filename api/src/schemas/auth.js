// src/schemas/auth.js
import { z } from 'zod';

// Schéma pour la connexion
export const loginSchema = z.object({
    pseudo: z.string()
        .min(1, "Le pseudo est requis")
        .min(3, "Le pseudo doit contenir au moins 3 caractères")
        .max(50, "Le pseudo ne peut pas dépasser 50 caractères"),
    
    password: z.string()
        .min(1, "Le mot de passe est requis")
        .min(4, "Le mot de passe doit contenir au moins 4 caractères")
        .max(128, "Le mot de passe ne peut pas dépasser 128 caractères")
});