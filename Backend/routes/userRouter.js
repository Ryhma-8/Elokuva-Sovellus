import { Router } from "express";
import { login, register, logout, deleteAccount } from "../controllers/userController.js";
import { handleTokenRefresh } from "../controllers/refreshTokenController.js";
import { auth } from "../helpers/auth.js"

const router = Router();

router.post("/register", register)

router.post("/login", login)

router.get("/logout", auth, logout)

router.get("/refresh", handleTokenRefresh)

router.delete("/delete", auth, deleteAccount)
    

export default router;