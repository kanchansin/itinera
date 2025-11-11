import {
  generateTripSummary as aiGenerateSummary,
  estimateVisitDuration as aiEstimateDuration,
  analyzeSentiment as aiAnalyzeSentiment,
} from "../services/geminiAIService.js"
export const generateTripSummary = async (req, res) => {
  try {
    const { title, destination, stops, duration, transport } = req.body
    if (!title || !destination) {
      return res.status(400).json({ error: "Title and destination are required" })
    }
    const summary = await aiGenerateSummary({
      title,
      destination,
      stops: stops || [],
      duration: duration || 0,
      transport: transport || "driving",
    })
    res.json({ summary })
  } catch (error) {
    console.error("Generate Trip Summary Error:", error.message)
    res.status(500).json({ error: error.message })
  }
}
export const estimateVisitDuration = async (req, res) => {
  try {
    const { placeName, reviews } = req.body
    if (!placeName) {
      return res.status(400).json({ error: "Place name is required" })
    }
    const duration = await aiEstimateDuration(placeName, reviews || [])
    res.json({ duration })
  } catch (error) {
    console.error("Estimate Visit Duration Error:", error.message)
    res.status(500).json({ error: error.message })
  }
}
export const analyzeSentiment = async (req, res) => {
  try {
    const { text } = req.body
    if (!text) {
      return res.status(400).json({ error: "Text is required" })
    }
    const sentiment = await aiAnalyzeSentiment(text)
    res.json({ sentiment })
  } catch (error) {
    console.error("Analyze Sentiment Error:", error.message)
    res.status(500).json({ error: error.message })
  }
}