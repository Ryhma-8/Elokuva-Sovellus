import jwt from "jsonwebtoken"
import { ApiError } from "./apiErrorClass.js"
import dotenv from "dotenv"

dotenv.config()
const {verify} = jwt

const auth = (req,res,next) => {
    const token = req.headers["authorization"]
    if (!token){
        return next(ApiError("No token provided!", 401))
    }
    verify(token,process.env.JWT_SECRET_KEY, (err,decode) => {
        
        if (err) {
            return next(ApiError("Failed to authenticate token", 401))
        }

        next()
    })
}

export {auth}