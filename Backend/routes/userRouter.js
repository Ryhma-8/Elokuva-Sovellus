import { Router } from "express";
import { login, register, logout } from "../controllers/userController.js";
import { handleTokenRefresh } from "../controllers/refreshTokenController.js";

const router = Router();

router.post("/register", register)

router.post("/login", login)

router.get("/logout", logout)

router.get("/refresh", handleTokenRefresh)
    

export default router;