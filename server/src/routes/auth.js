import express from "express"
import { googleAuth, refreshToken } from "../controllers/authController.js"

const router = express.Router()

router.post("/google", googleAuth)
router.post("/refresh-token", refreshToken)

export default router
