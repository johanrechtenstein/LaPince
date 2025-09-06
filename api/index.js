import "dotenv/config";
import express from "express";
import cors from "cors";
import { router } from "./src/router.js";
import { xss } from "express-xss-sanitizer";
import cookieParser from "cookie-parser";
import { sequelize } from "./src/models/dbClientSequelize.js";
import fs from 'fs';


const app = express();

const corsOptions = {
  origin: ['http://localhost:3000', 'http://192.168.1.36:3000', 'https://la-pince-iota.vercel.app'], // Remplacez par l'origine de votre application
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(xss());

// 👇 Route temporaire pour créer les tables
app.get('/api/init-db', async (req, res) => {
  try {
    console.log('🔧 Initialisation des tables...');
    const sqlFile = fs.readFileSync('./create_tables.sql', 'utf8');
    await sequelize.query(sqlFile);
    console.log('✅ Tables créées avec succès !');
    res.json({ message: 'Base de données initialisée avec succès !' });
  } catch (error) {
    console.error('❌ Erreur init DB:', error);
    res.status(500).json({ error: error.message });
  }
});

app.use("/api", router);


const port = process.env.PORT || 3001;

// 👇 Fonction de démarrage avec vérification de connexion
async function startServer() {
  try {
    // Vérifier la connexion à la base
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données réussie');

  
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
} catch (error) {
  console.error('❌ Erreur de connexion à la base:', error);
  process.exit(1);
}
}

startServer();