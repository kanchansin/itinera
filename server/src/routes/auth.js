import express from "express"
import { googleAuth, refreshToken, login, register } from "../controllers/authController.js"

const router = express.Router()

const asyncHandler = (fn) => (req, res, next) => {
  try {
    Promise.resolve(fn(req, res, next)).catch(next)
  } catch (err) {
    next(err)
  }
}

router.post("/google", asyncHandler(googleAuth))
router.post("/refresh-token", asyncHandler(refreshToken))
router.post("/login", asyncHandler(login))
router.post("/register", asyncHandler(register))

export default router
