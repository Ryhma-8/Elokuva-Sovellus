import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRouter from './routes/userRouter.js';

dotenv.config();

const port = process.env.PORT
const app = express();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/user', userRouter);
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
