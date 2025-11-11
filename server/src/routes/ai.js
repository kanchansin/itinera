import express from "express"
import {
  generateTripSummary,
  estimateVisitDuration,
  analyzeSentiment,
} from "../controllers/aiController.js"

const router = express.Router()

router.post("/generate-summary", generateTripSummary)
router.post("/estimate-duration", estimateVisitDuration)
router.post("/analyze-sentiment", analyzeSentiment)

export default router
