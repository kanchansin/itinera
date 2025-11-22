import express from "express"
import {
    createGuide,
    getGuides,
    getGuideById,
    updateGuide,
    deleteGuide,
    likeGuide,
    saveGuide,
    startTripFromGuide,
    getSavedGuides,
} from "../controllers/guideController.js"
import { verifyFirebaseToken } from "../middlewares/auth.js"

const router = express.Router()

router.post("/", verifyFirebaseToken, createGuide)
router.get("/", getGuides)
router.get("/saved", verifyFirebaseToken, getSavedGuides)
router.get("/:id", getGuideById)
router.put("/:id", verifyFirebaseToken, updateGuide)
router.delete("/:id", verifyFirebaseToken, deleteGuide)
router.post("/:id/like", verifyFirebaseToken, likeGuide)
router.post("/:id/save", verifyFirebaseToken, saveGuide)
router.post("/:id/start", verifyFirebaseToken, startTripFromGuide)

export default router
