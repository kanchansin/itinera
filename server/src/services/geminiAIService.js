import axios from "axios"

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"

export const estimateVisitDuration = async (placeName, reviews) => {
  try {
    const prompt = `Based on the following reviews and information about ${placeName}, estimate the typical visit duration in minutes that a tourist should spend at this location. Consider the type of attraction and review sentiment.

Reviews: ${reviews.join(" | ")}

Respond with just a number representing the estimated duration in minutes.`

    const response = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    })

    const duration = Number.parseInt(response.data.candidates[0].content.parts[0].text.trim())
    return isNaN(duration) ? 60 : duration
  } catch (error) {
    console.error("Error estimating visit duration:", error)
    return 60 // Default to 60 minutes on error
  }
}

export const generateTripSummary = async (tripData) => {
  try {
    const prompt = `Generate a brief, engaging travel summary for a trip with the following details:

Title: ${tripData.title}
Destination: ${tripData.destination}
Stops: ${tripData.stops.join(", ")}
Duration: ${tripData.duration} hours
Transport: ${tripData.transport}

Keep it to 2-3 sentences and make it appealing for sharing on social media.`

    const response = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    })

    return response.data.candidates[0].content.parts[0].text.trim()
  } catch (error) {
    console.error("Error generating trip summary:", error)
    return "Check out my amazing trip!"
  }
}

export const analyzeSentiment = async (text) => {
  try {
    const prompt = `Analyze the sentiment of this review and respond with only "positive", "negative", or "neutral": "${text}"`

    const response = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    })

    return response.data.candidates[0].content.parts[0].text.trim().toLowerCase()
  } catch (error) {
    console.error("Error analyzing sentiment:", error)
    return "neutral"
  }
}
