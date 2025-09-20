import { registerUser, userExists, insertRefreshToken } from "../models/userModel.js";
import { hash, compare } from "bcrypt";
import jwt from "jsonwebtoken";
import { ApiError } from "../helpers/apiErrorClass.js";
import dotenv from "dotenv"
import Joi from "joi"

dotenv.config()
const {sign} = jwt

const register = async (req, res, next) => {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password || !email.includes('@')) {
        return next(new ApiError("Username, email and password are required",400))
    }

    const passwordSchema = Joi.string().min(8).pattern(new RegExp("^(?=.*[A-Z])(?=.*[0-9]).+$"))
    const {error} = passwordSchema.validate(password)

    if (error) {
        return next(new ApiError("Password didn't meet all of the requirements",400))
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

            const token = sign({user: dbUser.email}, process.env.JWT_SECRET_KEY,{expiresIn: '30m'})
            const refreshToken = sign({user: dbUser.email}, process.env.JWT_REFRESH_SECRET_KEY,{expiresIn: '15d'})

            insertRefreshToken(refreshToken,dbUser.email)

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                maxAge: 7*24*60*60*1000,
                sameSite: "lax", // suojaa CSRF
                secure: false // aseta True kun vaihdetaan localahostista muualle, True siis tekee sen että cookie lähtee vain https yhdteyden yli
            })

            res.header("Access-Control-Expose-Headers","Authorization")
            .header("Authorization","Bearer " + token)
            .status(200).json({
                    id: dbUser.id,
                    email: dbUser.email,
            }
            )})
        
    } catch (error) {
        console.error(error)
        return next(error)
    }
}

export { register, login };