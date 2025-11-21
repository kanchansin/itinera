import axios from 'axios';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export interface TripPreferences {
  mood: string;
  locationType: string;
  travelerType: string;
  timeAvailable: number;
  budget: string;
  startLocation?: {
    latitude: number;
    longitude: number;
    name: string;
  };
}

export interface AITripPlan {
  title: string;
  summary: string;
  stops: Array<{
    name: string;
    type: string;
    duration: number;
    arrival: string;
    departure: string;
    description: string;
    tips: string[];
    photoSpots?: string[];
  }>;
  mealBreaks: Array<{
    time: string;
    type: string;
    suggestions: string[];
  }>;
  warnings: string[];
  alternatives: string[];
  estimatedCost: {
    min: number;
    max: number;
  };
}

const callGemini = async (prompt: string): Promise<string> => {
  try {
    const response = await axios.post<GeminiResponse>(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      },
      { timeout: 30000 }
    );

    return response.data.candidates[0].content.parts[0].text.trim();
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to get AI response');
  }
};

export const generateTripPlan = async (
  preferences: TripPreferences,
  nearbyPlaces: any[],
  weather?: any
): Promise<AITripPlan> => {
  const prompt = `You are an expert travel planner. Create a detailed day trip itinerary based on these preferences:

Mood: ${preferences.mood}
Location Type: ${preferences.locationType}
Traveler Type: ${preferences.travelerType}
Time Available: ${preferences.timeAvailable} hours
Budget: ${preferences.budget}
Starting Location: ${preferences.startLocation?.name || 'Current location'}

Available nearby places (from Google Places):
${nearbyPlaces.map(p => `- ${p.name} (${p.types?.join(', ')})`).join('\n')}

${weather ? `Current Weather: ${weather.description}, ${weather.temp}°C` : ''}

Generate a complete trip plan in JSON format with this structure:
{
  "title": "Catchy trip title",
  "summary": "2-3 sentence overview",
  "stops": [
    {
      "name": "Place name",
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
- Realistic timings
- Mix of activities matching mood
- Budget-appropriate suggestions
- Safety warnings if needed
- Return before curfew`;

  const response = await callGemini(prompt);
  
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Invalid AI response format');
  }
  
  return JSON.parse(jsonMatch[0]);
};

export const improveSearchQuery = async (vaguQuery: string): Promise<string> => {
  const prompt = `Convert this vague search query into precise location search keywords for Google Places API:

User query: "${vaguQuery}"

Return only the improved search query, nothing else. Make it specific and searchable.
Examples:
"peaceful night drive" → "scenic viewpoints night drive quiet"
"romantic dinner" → "romantic restaurants candlelight dinner"
"fun with kids" → "family entertainment activities parks"`;

  return await callGemini(prompt);
};

export const rankPlacesByPreferences = async (
  places: any[],
  preferences: TripPreferences
): Promise<any[]> => {
  const prompt = `Rank these places based on user preferences:

Preferences:
- Mood: ${preferences.mood}
- Location Type: ${preferences.locationType}
- Traveler Type: ${preferences.travelerType}

Places:
${places.map((p, i) => `${i + 1}. ${p.name} - ${p.types?.join(', ')}`).join('\n')}

Return a JSON array of place indices in ranked order (best to worst):
[0, 2, 1, 3, ...]`;

  const response = await callGemini(prompt);
  const jsonMatch = response.match(/\[[\s\S]*\]/);
  
  if (!jsonMatch) return places;
  
  const rankedIndices = JSON.parse(jsonMatch[0]);
  return rankedIndices.map((idx: number) => places[idx]).filter(Boolean);
};

export const optimizeStopSequence = async (
  stops: any[],
  startTime: string,
  curfewTime: string,
  travelTimes: number[]
): Promise<{
  optimizedStops: any[];
  timeline: any[];
  feasible: boolean;
  warnings: string[];
}> => {
  const prompt = `Optimize this trip sequence for maximum efficiency:

Stops:
${stops.map((s, i) => `${i + 1}. ${s.name} (${s.duration || 60} min visit)`).join('\n')}

Travel times between stops (minutes): ${travelTimes.join(', ')}
Start Time: ${startTime}
Must return by: ${curfewTime}

Generate optimized sequence in JSON:
{
  "optimizedStops": [/* reordered stop indices */],
  "timeline": [
    {
      "stopIndex": 0,
      "arrival": "10:00 AM",
      "departure": "11:00 AM",
      "activity": "Visit location"
    }
  ],
  "feasible": true,
  "warnings": ["Warning if tight schedule"]
}`;

  const response = await callGemini(prompt);
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  
  if (!jsonMatch) {
    throw new Error('Invalid optimization response');
  }
  
  return JSON.parse(jsonMatch[0]);
};

export const generateGuidePost = async (
  userTrips: any[],
  userPreferences: any
): Promise<{
  title: string;
  description: string;
  spots: any[];
  tags: string[];
}> => {
  const prompt = `Based on this user's travel history, create a personalized guide post:

Previous Trips:
${userTrips.map(t => `- ${t.tripName} to ${t.destination}`).join('\n')}

User Preferences: ${JSON.stringify(userPreferences)}

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
  "tags": ["Tag1", "Tag2"]
}

Create 4-6 spots that match their style.`;

  const response = await callGemini(prompt);
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  
  if (!jsonMatch) {
    throw new Error('Invalid guide post response');
  }
  
  return JSON.parse(jsonMatch[0]);
};

export const getDiscoverRecommendations = async (
  userLocation: { latitude: number; longitude: number },
  userPreferences: any,
  season: string
): Promise<{
  trending: any[];
  budgetFriendly: any[];
  seasonal: any[];
  hiddenGems: any[];
}> => {
  const prompt = `Generate location and experience recommendations:

User Location: ${userLocation.latitude}, ${userLocation.longitude}
Preferences: ${JSON.stringify(userPreferences)}
Current Season: ${season}

Generate recommendations in JSON:
{
  "trending": [
    {
      "name": "Place/Experience",
      "reason": "Why it's trending",
      "category": "food/adventure/culture"
    }
  ],
  "budgetFriendly": [/* Similar structure */],
  "seasonal": [/* Season-specific */],
  "hiddenGems": [/* Off-beat places */]
}

4-5 items per category.`;

  const response = await callGemini(prompt);
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  
  if (!jsonMatch) {
    throw new Error('Invalid recommendations response');
  }
  
  return JSON.parse(jsonMatch[0]);
};

export const getLiveNavigationGuidance = async (
  currentLocation: { latitude: number; longitude: number },
  remainingStops: any[],
  traffic: any,
  weather: any
): Promise<{
  reorderedStops?: any[];
  warnings: string[];
  suggestions: string[];
  alternateRoutes?: any[];
}> => {
  const prompt = `Provide real-time navigation guidance:

Current Location: ${currentLocation.latitude}, ${currentLocation.longitude}
Remaining Stops: ${remainingStops.map(s => s.name).join(', ')}
Traffic Conditions: ${traffic ? 'Heavy delays reported' : 'Normal'}
Weather: ${weather?.description || 'Clear'}

Analyze and provide guidance in JSON:
{
  "reorderedStops": [/* If reordering needed */],
  "warnings": ["Delays expected at X"],
  "suggestions": ["Take alternate route via Y"],
  "alternateRoutes": [/* If major issues */]
}`;

  const response = await callGemini(prompt);
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  
  if (!jsonMatch) {
    throw new Error('Invalid guidance response');
  }
  
  return JSON.parse(jsonMatch[0]);
};

export const analyzeTripFeasibility = async (
  stops: any[],
  timeConstraints: { start: string; end: string },
  travelMethod: string
): Promise<{
  feasible: boolean;
  issues: string[];
  recommendations: string[];
}> => {
  const prompt = `Analyze if this trip is feasible:

Stops: ${stops.map(s => `${s.name} (${s.duration}min)`).join(', ')}
Time: ${timeConstraints.start} to ${timeConstraints.end}
Travel: ${travelMethod}

Return JSON:
{
  "feasible": true/false,
  "issues": ["Not enough time for stop X"],
  "recommendations": ["Remove stop Y or reduce time at Z"]
}`;

  const response = await callGemini(prompt);
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  
  if (!jsonMatch) {
    throw new Error('Invalid feasibility response');
  }
  
  return JSON.parse(jsonMatch[0]);
};