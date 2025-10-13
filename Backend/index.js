import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRouter from './routes/userRouter.js';
import cookieParser from 'cookie-parser';
import favoriteRouter from './routes/favoriteRouter.js';
import reviewRouter from './routes/reviewRouter.js';
import groupRouter from './routes/groupRouter.js';
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

dotenv.config();

const port = process.env.PORT;
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("__dirname:", __dirname);

// Listaa kaikki tiedostot nykyisessä hakemistossa
fs.readdir(__dirname, (err, files) => {
  if (err) console.error(err);
  else console.log("Files in __dirname:", files);
});

// Listaa build-hakemiston sisältö
const buildPath = path.join(__dirname, "../build");
fs.readdir(buildPath, (err, files) => {
  if (err) console.error("Cannot read build folder:", err.message);
  else console.log("Files in build folder:", files);
});

app.use(cors({
     credentials: true,
     origin: [
        "http://localhost:5173",
        "https://elokuva-sovellus.onrender.com"
     ]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/user', userRouter);
app.use('/api/favorites', favoriteRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/group', groupRouter);

// Tarkistettu staattinen polku
app.use(express.static(buildPath));

// Käytetään aina build/index.html fallbackina
app.use((req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

app.use((err, req, res, next) => {
    const statusCode = err.status || 500;
    const message = err.message || "Internal server error";
    res.status(statusCode).json({
        err: {
            message: message,
            status: statusCode
        }
    });
});
