import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRouter from './routes/userRouter.js';
import cookieParser from 'cookie-parser';
import favoriteRouter from './routes/favoriteRouter.js';
import reviewRouter from './routes/reviewRouter.js';
import groupRouter from './routes/groupRouter.js'
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const port = process.env.PORT
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(cors({
     credentials: true,
     origin: [
        "http://localhost:5173",
        "https://elokuva-sovellus.onrender.com"
     ]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser())

app.use('/user', userRouter);
app.use('/api/favorites', favoriteRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/group', groupRouter);

app.use(express.static(path.join(__dirname, "dist"))); 

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
app.use((err,req,res,next)=> {
    const statusCode = err.status || 500
    const message = err.message || "Internal server error"
    res.status(statusCode).json({
        err: {
            message: message,
            status: statusCode
        }
    })
})