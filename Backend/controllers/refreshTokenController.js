import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import { ApiError } from "../helpers/apiErrorClass.js";
import  { getUserWithRefreshToken} from "../models/userModel.js"

dotenv.config()
const {sign} = jwt

const handleTokenRefresh = async (req,res,next) => {
    const cookies = req.cookies
    if (!cookies?.jwt) return next(new ApiError("No refresh token", 401))
    console.log(cookies)
    const refreshToken = cookies.jwt

    const dbUser = await getUserWithRefreshToken(refreshToken)
    if (!dbUser) return next(new ApiError("Forbidden", 403))
    
    console.log(dbUser)

    jwt.verify(refreshToken,process.env.JWT_REFRESH_SECRET_KEY,
        (err, decoded) => {
            if (err || decoded.email === dbUser.email) return next(new ApiError("Forbidden", 403))
        
        const token = sign({user: dbUser.email}, process.env.JWT_SECRET_KEY,{expiresIn: '30m'})
        res.header("Access-Control-Expose-Headers","Authorization")
            .header("Authorization","Bearer " + token)
            .status(200).json({ message : "Token refreshed"})
        } 
    )
}
    
export {handleTokenRefresh}