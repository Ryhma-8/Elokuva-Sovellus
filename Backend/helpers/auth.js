import jwt from "jsonwebtoken"
import { ApiError } from "./apiErrorClass.js"
import dotenv from "dotenv"

dotenv.config()
const {verify} = jwt

const auth = (req,res,next) => {
    
    if (!req.headers.authorization) return next(new ApiError("Unauthorized", 401))
    try {
        const token = req.headers.authorization.split(" ")[1]
        const decodeUser = verify(token,process.env.JWT_SECRET_KEY)
        console.log("Decode failed, returning 401")
        if (!decodeUser) return next(new ApiError("Unauthorized",401))
        req.user = decodeUser;
        next()
    } catch (err) {
        console.log("Error in auth middleware:", err)
        return next(new ApiError("Unauthorized", 401))
        
    }
    
}

export {auth}