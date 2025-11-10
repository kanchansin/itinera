import express from "express"
import passport from "passport"
import { register, login, googleAuth, refreshToken } from "../controllers/authController.js"

const router = express.Router()

router.post("/register", register)
router.post("/login", login)
router.post("/refresh-token", refreshToken)

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }))

router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/login" }), googleAuth)

export default router
