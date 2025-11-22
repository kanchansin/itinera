import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const suggestDestinations = async (req, res) => {
  try {
    const { mood, startLocation, query } = req.body;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `Based on ${mood} mood travel preference from ${startLocation}, suggest 5 destinations similar to "${query}". Include distance estimates. Format as JSON array with name, distance, type fields.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json(JSON.parse(text));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const generateItinerary = async (req, res) => {
  try {
    const { mood, group, destination, startLocation, duration, transport } = req.body;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `Create a detailed ${duration}-day ${mood} itinerary for ${group} travelers from ${startLocation} to ${destination} using ${transport}. Include stops, timings, and descriptions. Format as JSON.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json(JSON.parse(text));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};