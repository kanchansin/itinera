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
  calculateTripRoute,
} from "../controllers/tripController.js"

const router = express.Router()

router.post("/calculate-duration", calculateTripDuration)
router.post("/calculate-route", calculateTripRoute)
router.get("/explore/feed", getPublicTrips)

router.post("/", verifyToken, createTrip)
router.get("/", verifyToken, getTrips)
router.get("/:id", verifyToken, getTripById)
router.put("/:id", verifyToken, updateTrip)
router.delete("/:id", verifyToken, deleteTrip)

export default router