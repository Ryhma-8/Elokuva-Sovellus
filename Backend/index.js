import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRouter from './routes/userRouter.js';
import cookieParser from 'cookie-parser';
import favoriteRouter from './routes/favoriteRouter.js';

dotenv.config();

const port = process.env.PORT
const app = express();


app.use(cors({
     credentials: true,
     origin: "http://localhost:5173",
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser())

app.use('/user', userRouter);
app.use('/api/favorites', favoriteRouter);

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