import express from "express"
import { verifyFirebaseToken } from "../middlewares/auth.js"
import {
  createTrip,
  getTrips,
  getActiveTrip,
  getTripById,
  updateTrip,
  deleteTrip,
  endTrip,
  getPublicTrips,
  calculateTripDuration,
  calculateTripRoute,
} from "../controllers/tripController.js"

const router = express.Router()

router.post("/calculate-duration", calculateTripDuration)
router.post("/calculate-route", calculateTripRoute)
router.get("/explore/feed", getPublicTrips)

router.post("/", verifyFirebaseToken, createTrip)
router.get("/", verifyFirebaseToken, getTrips)
router.get("/active", verifyFirebaseToken, getActiveTrip)
router.get("/:id", verifyFirebaseToken, getTripById)
router.put("/:id", verifyFirebaseToken, updateTrip)
router.post("/:id/end", verifyFirebaseToken, endTrip)
router.delete("/:id", verifyFirebaseToken, deleteTrip)

export default router