import { registerUser, userExists, insertRefreshToken, getUserWithRefreshToken, deleteRefreshToken, deleteUserCompletely } from "../models/userModel.js";
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
    const dbUser = await userExists(email)
    if (dbUser.rows.length > 0) return next (new ApiError("Account already registered for this email", 400))

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
        return next(new ApiError("Something went wrong during registration"))
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

            const token = sign({email: dbUser.email}, process.env.JWT_SECRET_KEY,{expiresIn: '15m'})
            const refreshToken = sign({email: dbUser.email}, process.env.JWT_REFRESH_SECRET_KEY,{expiresIn: '15d'})

            insertRefreshToken(refreshToken,dbUser.email)

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                maxAge: 7*24*60*60*1000,
                sameSite: "none", // suojaa CSRF tämä pitää asettaa none kun siirretään palvelimelle
                secure: true // aseta True kun vaihdetaan localahostista muualle, True siis tekee sen että cookie lähtee vain https yhdteyden yli
            })

            res.header("Access-Control-Expose-Headers","Authorization")
            .header("Authorization","Bearer " + token)
            .status(200).json({
                    id: dbUser.id,
                    email: dbUser.email,
                    username: dbUser.username
            }
            )})
        
    } catch (error) {
        console.error(error)
        return next(error)
    }
}

const logout = async (req, res, next) => {
    // client puolella pitää nollata myös access tokeni
    const cookies = req.cookies
    if (!cookies?.refreshToken) return next(new ApiError("No refresh token", 401))
    const refreshToken = cookies.refreshToken
    const foundUser =  await getUserWithRefreshToken(refreshToken)
    if (!foundUser) {
        res.clearCookie('refreshToken', 
            {httpOnly: true,
            maxAge: 7*24*60*60*1000,
            sameSite: "none",
            secure: true})
        return res.sendStatus(204)
    }
    await deleteRefreshToken(refreshToken)
    res.clearCookie('refreshToken', 
            {httpOnly: true,
            maxAge: 7*24*60*60*1000,
            sameSite: "none",
            secure: true})
    return res.sendStatus(204)
}

const deleteAccount = async (req, res, next) => {
    try {
        const userEmail = req.user.email

        if(!userEmail) {
            return next(new ApiError("Unauthorized", 401))
        }
        
        const deleted = await deleteUserCompletely(userEmail)
        if (!deleted) {
            return next(new ApiError("Account not found", 404))
        }
        
        res.clearCookie('refreshToken', {
            httpOnly: true,
            sameSite: 'none',
            secure: true
        })
        return res.sendStatus(204)
    } catch (err) {
        return next(new ApiError("Failed to delete account", 500))
    }
}

export { register, login, logout, deleteAccount };