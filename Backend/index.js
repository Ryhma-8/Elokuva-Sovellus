import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRouter from './routes/userRouter.js';
import cookieParser from 'cookie-parser';
import favoriteRouter from './routes/favoriteRouter.js';
import reviewRouter from './routes/reviewRouter.js';
import groupRouter from './routes/groupRouter.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const port = process.env.PORT || 3000;
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== Middleware =====

// Logataan kaikki requestit
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
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

// ===== API Routes =====
app.use('/user', userRouter);
app.use('/api/favorites', favoriteRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/group', groupRouter);

// ===== Static Files (React build) =====
app.use(express.static(path.join(__dirname, '../dist')));

// ===== SPA fallback =====
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, '../dist', 'index.html');
  console.log(`Serving SPA fallback for: ${req.originalUrl}`);
  res.sendFile(indexPath, err => {
    if (err) {
      console.error("Failed to send index.html:", err);
      res.status(500).send('Server error');
    }
  });
});

// ===== Error handling =====
app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  const message = err.message || "Internal server error";
  console.error(`Error: ${message}`);
  res.status(statusCode).json({
    err: {
      message: message,
      status: statusCode
    }
  });
});

// ===== Start server =====
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
