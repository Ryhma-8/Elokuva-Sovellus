import { Router } from "express";
import { registerUser } from "../models/user.js";
import {hash, compare} from "bcrypt";
import jwt from "jsonwebtoken";

const {sign} = jwt
const router = Router();

router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password || !email.includes('@')) {
        return res.status(400).json({ message: "Username, email and password are required" });
    }

    try {
        const passwordHash = await hash(password, 11);
        const result = await registerUser(username, email, passwordHash);
        return res.status(201).json({id: result.rows[0].id, email: result.rows[0].email});
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Error registering user", error: error });
    }
});

export default router;