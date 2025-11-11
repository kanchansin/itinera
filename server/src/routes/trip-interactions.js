import express from "express"
import { verifyToken } from "../middlewares/auth.js"
import {
  likeTrip,
  unlikeTrip,
  saveTrip,
  unsaveTrip,
  getSavedTrips,
  addComment,
  getComments,
} from "../controllers/tripInteractionController.js"

const router = express.Router()

router.post("/:tripId/like", verifyToken, likeTrip)
router.delete("/:tripId/like", verifyToken, unlikeTrip)
router.post("/:tripId/save", verifyToken, saveTrip)
router.delete("/:tripId/save", verifyToken, unsaveTrip)
router.get("/saved", verifyToken, getSavedTrips)
router.post("/:tripId/comments", verifyToken, addComment)
router.get("/:tripId/comments", getComments)

export default router
