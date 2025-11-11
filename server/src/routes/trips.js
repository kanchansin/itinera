import express from "express"
import { verifyToken } from "../middlewares/auth.js"
import {
  createTrip,
  getTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  getPublicTrips,
  calculateTripDuration,
} from "../controllers/tripController.js"

const router = express.Router()

// Protected routes
router.post("/", verifyToken, createTrip)
router.get("/", verifyToken, getTrips)
router.get("/:id", verifyToken, getTripById)
router.put("/:id", verifyToken, updateTrip)
router.delete("/:id", verifyToken, deleteTrip)
router.post("/calculate-duration", calculateTripDuration)

// Public routes
router.get("/explore/feed", getPublicTrips)

export default router
