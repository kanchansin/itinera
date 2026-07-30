import Groq from "groq-sdk"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
const GROQ_MODEL = "llama-3.3-70b-versatile"

export const suggestDestinations = async (req, res) => {
  try {
    const { mood, startLocation, query } = req.body

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `Based on ${mood} mood travel preference from ${startLocation}, suggest 5 destinations similar to "${query}". Include distance estimates. Return ONLY a JSON array with name, distance, type fields. No markdown.`,
        },
      ],
      model: GROQ_MODEL,
      temperature: 0.7,
      max_tokens: 1024,
    })

    const text = completion.choices[0]?.message?.content || "[]"
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    res.json(jsonMatch ? JSON.parse(jsonMatch[0]) : [])
  } catch (error) {
    console.error("suggestDestinations Error:", error.message)
    res.status(500).json({ error: error.message })
  }
}

export const generateItinerary = async (req, res) => {
  try {
    const { mood, group, destination, startLocation, duration, transport } = req.body

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `Create a detailed ${duration}-day ${mood} itinerary for ${group} travelers from ${startLocation} to ${destination} using ${transport}. Include stops, timings, and descriptions. Return ONLY a JSON object. No markdown fences.`,
        },
      ],
      model: GROQ_MODEL,
      temperature: 0.7,
      max_tokens: 4096,
    })

    const text = completion.choices[0]?.message?.content || "{}"
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    res.json(jsonMatch ? JSON.parse(jsonMatch[0]) : {})
  } catch (error) {
    console.error("generateItinerary Error:", error.message)
    res.status(500).json({ error: error.message })
  }
}