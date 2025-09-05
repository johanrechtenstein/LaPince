import "dotenv/config";
import express from "express";
import cors from "cors";
import { router } from "./src/router.js";
import { xss } from "express-xss-sanitizer";
import cookieParser from "cookie-parser";
// import session from "express-session";

const app = express();

const corsOptions = {
  origin: true, // Remplacez par l'origine de votre application
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(xss());

app.use("/api", router);


const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
