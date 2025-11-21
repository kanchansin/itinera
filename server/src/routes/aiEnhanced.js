import express from "express";
import { suggestDestinations, generateItinerary } from "../controllers/aiEnhancedController.js";

const router = express.Router();

router.post("/suggest-destinations", suggestDestinations);
router.post("/generate-itinerary", generateItinerary);

export default router;