import express from "express"
import { verifyFirebaseToken, refreshToken } from "../controllers/authController.js"

const router = express.Router()

const asyncHandler = (fn) => (req, res, next) => {
  try {
    Promise.resolve(fn(req, res, next)).catch(next)
  } catch (err) {
    next(err)
  }
}

router.post("/firebase", asyncHandler(verifyFirebaseToken))
router.post("/refresh-token", asyncHandler(refreshToken))

export default router