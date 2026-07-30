import Groq from "groq-sdk"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
const GROQ_MODEL = "llama-3.3-70b-versatile"

const callGroqInternal = async (prompt) => {
  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: GROQ_MODEL,
    temperature: 0.7,
    max_tokens: 4096,
  })
  const text = completion.choices[0]?.message?.content
  if (!text) throw new Error("No content in Groq response")
  return text.trim()
}

export const estimateVisitDuration = async (placeName, reviews) => {
  try {
    const prompt = `Based on the following reviews and information about ${placeName}, estimate the typical visit duration in minutes that a tourist should spend at this location. Consider the type of attraction and review sentiment.

Reviews: ${reviews.join(" | ")}

Respond with just a number representing the estimated duration in minutes.`

    const text = await callGroqInternal(prompt)
    const duration = Number.parseInt(text)
    return isNaN(duration) ? 60 : duration
  } catch (error) {
    console.error("Error estimating visit duration:", error.message)
    return 60
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

Keep it to 2-3 sentences and make it appealing for sharing on social media. Return only the summary text.`

    return await callGroqInternal(prompt)
  } catch (error) {
    console.error("Error generating trip summary:", error.message)
    return "Check out my amazing trip!"
  }
}

export const analyzeSentiment = async (text) => {
  try {
    const prompt = `Analyze the sentiment of this review and respond with only "positive", "negative", or "neutral": "${text}"`
    const result = await callGroqInternal(prompt)
    return result.toLowerCase()
  } catch (error) {
    console.error("Error analyzing sentiment:", error.message)
    return "neutral"
  }
}
