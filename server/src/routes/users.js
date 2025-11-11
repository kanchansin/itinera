import express from "express"
import { verifyToken } from "../middlewares/auth.js"
import { getUserProfile, updateUserProfile } from "../controllers/userController.js"

const router = express.Router()

router.get("/profile", verifyToken, getUserProfile)
router.put("/profile", verifyToken, updateUserProfile)

export default router
