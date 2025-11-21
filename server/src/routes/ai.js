import express from "express"
import { verifyToken } from "../middlewares/auth.js"
import {
  generateTripSummary,
  estimateVisitDuration,
  analyzeSentiment,
  generateFullTripPlan,
  improveSearchQuery,
  rankPlacesByPreferences,
  optimizeTripSequence,
  generateGuidePost,
  getDiscoverRecommendations,
  getLiveNavigationGuidance,
} from "../controllers/aiController.js"

const router = express.Router()

router.post("/generate-summary", generateTripSummary)
router.post("/estimate-duration", estimateVisitDuration)
router.post("/analyze-sentiment", analyzeSentiment)
router.post("/generate-full-trip", generateFullTripPlan)
router.post("/improve-search", improveSearchQuery)
router.post("/rank-places", rankPlacesByPreferences)
router.post("/optimize-sequence", optimizeTripSequence)
router.post("/generate-guide", verifyToken, generateGuidePost)
router.post("/discover-recommendations", getDiscoverRecommendations)
router.post("/live-guidance", getLiveNavigationGuidance)

export default router