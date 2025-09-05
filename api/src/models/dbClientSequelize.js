import "dotenv/config";
import { Sequelize } from "sequelize";

// Utilise DATABASE_URL (standard) ou PG_URL (votre variable locale)
const databaseUrl = process.env.DATABASE_URL || process.env.PG_URL;

if (!databaseUrl) {
    throw new Error('Aucune URL de base de données trouvée ! Définissez DATABASE_URL ou PG_URL');
}

export const sequelize = new Sequelize(databaseUrl, {
    define: {
        createdAt: "created_at",
        updatedAt: "updated_at",
    },
    // Configuration SSL pour la production
    dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? {
            require: true,
            rejectUnauthorized: false
        } : false
    },
    // logging: false
});