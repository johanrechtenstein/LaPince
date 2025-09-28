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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(xss());



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