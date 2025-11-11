import express from "express"
import { verifyToken } from "../middlewares/auth.js"
import {
  getDestinations,
  getDestinationById,
  getDestinationReviews,
  addReview,
  searchDestinations,
} from "../controllers/destinationController.js"

const router = express.Router()

router.get("/", getDestinations)
router.get("/search", searchDestinations)
router.get("/:id", getDestinationById)
router.get("/:id/reviews", getDestinationReviews)
router.post("/:id/reviews", verifyToken, addReview)

export default router
