import { registerUser, userExists } from "../models/user.js";
import { hash, compare } from "bcrypt";
import jwt from "jsonwebtoken";
import { ApiError } from "../helpers/apiErrorClass.js";
import dotenv from "dotenv"

dotenv.config()
const {sign} = jwt

const register = async (req, res, next) => {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password || !email.includes('@')) {
        return next(new ApiError("Username, email and password are required",400))
    }

    try {
        const passwordHash = await hash(password, 11);
        const result = await registerUser(username, email, passwordHash);
        return res.status(201).json({id: result.rows[0].id, email: result.rows[0].email});
    } catch (error) {
        console.error(error)
        return next(error)
    }
};


const login = async (req, res, next) => {

    const {email, password} = req.body

    if (!email || !password) {
        return next(new ApiError("Email and password are required!", 400))
    }

    try {

        const result = await userExists(email)

        if (result.rows.length === 0) {
            return next(new ApiError("Email or password is wrong!", 401))
        }

        const dbUser = result.rows[0]

        compare(password,dbUser.password,(err,isMatch) => {
            if(!isMatch){
                return next(new ApiError("Email or password is wrong!",401))
            }

            const token = sign({user: dbUser.email}, process.env.JWT_SECRET_KEY)
            res.status(200).json({
                    id: dbUser.id,
                    email: dbUser.email,
                    token,
            }
            )})
        
    } catch (error) {
        console.error(error)
        return next(error)
    }
}

export { register, login };