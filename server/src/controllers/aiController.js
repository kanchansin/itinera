// server/src/controllers/aiController.js - UPDATED VERSION
import axios from "axios"

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY

const callGemini = async (prompt) => {
  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      },
      { timeout: 120000 }
    )
    // Validate response
    if (!response.data || !response.data.candidates || response.data.candidates.length === 0) {
      console.error("Invalid Gemini response:", JSON.stringify(response.data, null, 2));
      throw new Error("Invalid API response structure");
    }
    return response.data.candidates[0].content.parts[0].text.trim()
  } catch (error) {
    console.error("Gemini API Error:", error.message)
    throw new Error("Failed to get AI response")
  }
}

export const generateFullTripPlan = async (req, res) => {
  try {
    const { mood, locationType, travelerType, timeAvailable, budget, latitude, longitude } = req.body

    if (!mood || !locationType || !travelerType || !timeAvailable || !budget) {
      return res.status(400).json({ error: "All preferences required" })
    }

    // Fetch nearby places from Google Places
    const placesResponse = await axios.get(
      "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
      {
        params: {
          location: `${latitude},${longitude}`,
          radius: 15000,
          type: locationType === 'food_streets' ? 'restaurant' : locationType,
          key: GOOGLE_PLACES_API_KEY,
        },
      }
    )

    const nearbyPlaces = placesResponse.data.results || []

    const prompt = `You are an expert travel planner. Create a detailed day trip itinerary based on these preferences:

Mood: ${mood}
Location Type: ${locationType}
Traveler Type: ${travelerType}
Time Available: ${timeAvailable} hours
Budget: ${budget}
Starting Coordinates: ${latitude}, ${longitude}

Available nearby places (from Google Places):
${nearbyPlaces.slice(0, 20).map(p => `- ${p.name} (${p.types?.join(', ')}), Rating: ${p.rating || 'N/A'}`).join('\n')}

Generate a complete trip plan in JSON format with this exact structure:
{
  "title": "Catchy trip title",
  "summary": "2-3 sentence overview",
  "stops": [
    {
      "name": "Place name",
      "placeId": "google_place_id",
      "type": "attraction/restaurant/viewpoint/activity",
      "duration": 60,
      "arrival": "10:00 AM",
      "departure": "11:00 AM",
      "description": "What to do here",
      "tips": ["Tip 1", "Tip 2"],
      "photoSpots": ["Best angle 1", "Best angle 2"]
    }
  ],
  "mealBreaks": [
    {
      "time": "1:00 PM",
      "type": "lunch",
      "suggestions": ["Restaurant 1", "Restaurant 2"]
    }
  ],
  "warnings": ["Warning about traffic/weather/crowds"],
  "alternatives": ["Backup plan if weather changes"],
  "estimatedCost": {
    "min": 500,
    "max": 1500
  }
}

Ensure:
- Logical sequence considering travel time
- Realistic timings with 15-30 min travel buffer between stops
- Mix of activities matching mood
- Budget-appropriate suggestions (budget: ₹500-1000, moderate: ₹1000-3000, luxury: ₹3000+)
- Include 4-6 main stops
- Safety warnings if needed
- Return timing within ${timeAvailable} hours`

    const response = await callGemini(prompt)
    const jsonMatch = response.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      return res.status(500).json({ error: "Invalid AI response format" })
    }

    const tripPlan = JSON.parse(jsonMatch[0])
    res.json(tripPlan)
  } catch (error) {
    console.error("Generate Full Trip Plan Error:", error.message)
    res.status(500).json({ error: error.message })
  }
}

export const improveSearchQuery = async (req, res) => {
  try {
    const { query } = req.body

    if (!query) {
      return res.status(400).json({ error: "Search query required" })
    }

    const prompt = `Convert this vague search query into precise location search keywords for Google Places API:

User query: "${query}"

Return only the improved search query, nothing else. Make it specific and searchable.
Examples:
"peaceful night drive" → "scenic viewpoints night drive quiet"
"romantic dinner" → "romantic restaurants candlelight dinner"
"fun with kids" → "family entertainment activities parks"
"spiritual places" → "temples meditation centers peaceful"

Improved query:`

    const response = await callGemini(prompt)
    res.json({ improvedQuery: response.replace(/^["']|["']$/g, '').trim() })
  } catch (error) {
    console.error("Improve Search Query Error:", error.message)
    res.status(500).json({ error: error.message })
  }
}

export const rankPlacesByPreferences = async (req, res) => {
  try {
    const { places, preferences } = req.body

    if (!places || !Array.isArray(places) || !preferences) {
      return res.status(400).json({ error: "Places array and preferences required" })
    }

    const prompt = `Rank these places based on user preferences:

Preferences:
- Mood: ${preferences.mood}
- Location Type: ${preferences.locationType}
- Traveler Type: ${preferences.travelerType}

Places:
${places.map((p, i) => `${i}. ${p.name} - ${p.types?.join(', ')}, Rating: ${p.rating || 'N/A'}`).join('\n')}

Return ONLY a JSON array of place indices in ranked order (best to worst):
[0, 2, 1, 3, ...]

No other text, just the array.`

    const response = await callGemini(prompt)
    const jsonMatch = response.match(/\[[\s\S]*?\]/)

    if (!jsonMatch) {
      return res.json({ rankedIndices: places.map((_, i) => i) })
    }

    const rankedIndices = JSON.parse(jsonMatch[0])
    res.json({ rankedIndices })
  } catch (error) {
    console.error("Rank Places Error:", error.message)
    res.status(500).json({ error: error.message })
  }
}

export const optimizeTripSequence = async (req, res) => {
  try {
    const { stops, startTime, curfewTime, travelTimes } = req.body

    if (!stops || !startTime || !curfewTime) {
      return res.status(400).json({ error: "Stops, start time, and curfew time required" })
    }

    const prompt = `Optimize this trip sequence for maximum efficiency:

Stops:
${stops.map((s, i) => `${i}. ${s.name} (${s.duration || 60} min visit)`).join('\n')}

Travel times between stops (minutes): ${travelTimes?.join(', ') || 'Not provided'}
Start Time: ${startTime}
Must return by: ${curfewTime}

Generate optimized sequence in JSON:
{
  "optimizedStops": [0, 2, 1, 3],
  "timeline": [
    {
      "stopIndex": 0,
      "arrival": "10:00 AM",
      "departure": "11:00 AM",
      "activity": "Visit location"
    }
  ],
  "feasible": true,
  "warnings": ["Warning if tight schedule", "Traffic expected at 5 PM"]
}

Consider:
- Minimize backtracking
- Group nearby locations
- Account for travel time
- Warn if schedule is too tight
- Ensure return by curfew`

    const response = await callGemini(prompt)
    const jsonMatch = response.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      return res.status(500).json({ error: "Invalid optimization response" })
    }

    const optimization = JSON.parse(jsonMatch[0])
    res.json(optimization)
  } catch (error) {
    console.error("Optimize Trip Sequence Error:", error.message)
    res.status(500).json({ error: error.message })
  }
}

export const generateGuidePost = async (req, res) => {
  try {
    const userId = req.user?.userId
    const { userTrips, userPreferences } = req.body

    if (!userTrips || !Array.isArray(userTrips)) {
      return res.status(400).json({ error: "User trips data required" })
    }

    const prompt = `Based on this user's travel history, create a personalized guide post:

Previous Trips:
${userTrips.map(t => `- ${t.tripName || t.title} to ${t.destination}`).join('\n')}

User Preferences: ${JSON.stringify(userPreferences || {})}

Generate a guide post in JSON:
{
  "title": "Compelling title",
  "description": "2-3 sentences about this experience",
  "spots": [
    {
      "name": "Place name",
      "why": "Why visit",
      "bestTime": "When to go",
      "insiderTip": "Pro tip"
    }
  ],
  "tags": ["Adventure", "Nature", "Weekend"]
}

Create 4-6 spots that match their travel style.`

    const response = await callGemini(prompt)
    const jsonMatch = response.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      return res.status(500).json({ error: "Invalid guide post response" })
    }

    const guidePost = JSON.parse(jsonMatch[0])
    res.json(guidePost)
  } catch (error) {
    console.error("Generate Guide Post Error:", error.message)
    res.status(500).json({ error: error.message })
  }
}

export const getDiscoverRecommendations = async (req, res) => {
  try {
    const { latitude, longitude, userPreferences } = req.body

    if (!latitude || !longitude) {
      return res.status(400).json({ error: "Location coordinates required" })
    }

    const currentMonth = new Date().toLocaleString('default', { month: 'long' })
    const season = ['December', 'January', 'February'].includes(currentMonth) ? 'Winter' :
      ['March', 'April', 'May'].includes(currentMonth) ? 'Spring' :
        ['June', 'July', 'August'].includes(currentMonth) ? 'Summer' : 'Autumn'

    const prompt = `Generate location and experience recommendations:

User Location: ${latitude}, ${longitude}
Preferences: ${JSON.stringify(userPreferences || {})}
Current Season: ${season}

Generate recommendations in JSON:
{
  "trending": [
    {
      "name": "Place/Experience",
      "reason": "Why it's trending",
      "category": "food/adventure/culture",
      "distance": "5 km"
    }
  ],
  "budgetFriendly": [
    {
      "name": "Place/Experience",
      "reason": "Why budget-friendly",
      "category": "food/adventure/culture",
      "estimatedCost": "₹200-500"
    }
  ],
  "seasonal": [
    {
      "name": "Place/Experience",
      "reason": "Perfect for ${season}",
      "category": "food/adventure/culture"
    }
  ],
  "hiddenGems": [
    {
      "name": "Place/Experience",
      "reason": "Why it's special",
      "category": "food/adventure/culture"
    }
  ]
}

4-5 items per category. Focus on real, accessible places near the coordinates.`

    const response = await callGemini(prompt)
    const jsonMatch = response.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      return res.status(500).json({ error: "Invalid recommendations response" })
    }

    const recommendations = JSON.parse(jsonMatch[0])
    res.json(recommendations)
  } catch (error) {
    console.error("Get Discover Recommendations Error:", error.message)
    res.status(500).json({ error: error.message })
  }
}

export const getLiveNavigationGuidance = async (req, res) => {
  try {
    const { currentLatitude, currentLongitude, remainingStops, traffic, weather } = req.body

    if (!currentLatitude || !currentLongitude || !remainingStops) {
      return res.status(400).json({ error: "Current location and remaining stops required" })
    }

    const prompt = `Provide real-time navigation guidance:

Current Location: ${currentLatitude}, ${currentLongitude}
Remaining Stops: ${remainingStops.map(s => s.name).join(', ')}
Traffic Conditions: ${traffic?.heavy ? 'Heavy delays reported' : 'Normal'}
Weather: ${weather?.description || 'Clear'}

Analyze and provide guidance in JSON:
{
  "reorderedStops": [/* If reordering needed, provide new indices */],
  "warnings": ["Delays expected at X", "Weather alert for Y"],
  "suggestions": ["Take alternate route via Z", "Skip crowded location A"],
  "estimatedDelays": 15
}

Only suggest reordering if there are significant issues.`

    const response = await callGemini(prompt)
    const jsonMatch = response.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      return res.status(500).json({ error: "Invalid guidance response" })
    }

    const guidance = JSON.parse(jsonMatch[0])
    res.json(guidance)
  } catch (error) {
    console.error("Live Navigation Guidance Error:", error.message)
    res.status(500).json({ error: error.message })
  }
}

// Keep existing functions from original
export const generateTripSummary = async (req, res) => {
  try {
    const { title, destination, stops, duration, transport } = req.body
    if (!title || !destination) {
      return res.status(400).json({ error: "Title and destination are required" })
    }

    const prompt = `Generate a brief, engaging travel summary for a trip:

Title: ${title}
Destination: ${destination}
Stops: ${stops?.join(", ") || 'Various locations'}
Duration: ${duration || 'Full day'}
Transport: ${transport || 'driving'}

Keep it to 2-3 sentences and make it appealing for sharing on social media.`

    const summary = await callGemini(prompt)
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

    const prompt = `Based on reviews and information about ${placeName}, estimate the typical visit duration in minutes:

Reviews: ${reviews?.join(" | ") || 'No reviews provided'}

Respond with just a number representing minutes (e.g., 60, 90, 120).`

    const response = await callGemini(prompt)
    const duration = parseInt(response.match(/\d+/)?.[0] || '60')
    res.json({ duration: isNaN(duration) ? 60 : duration })
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

    const prompt = `Analyze the sentiment of this review and respond with only "positive", "negative", or "neutral": "${text}"`

    const sentiment = await callGemini(prompt)
    res.json({ sentiment: sentiment.toLowerCase().trim() })
  } catch (error) {
    console.error("Analyze Sentiment Error:", error.message)
    res.status(500).json({ error: error.message })
  }
}