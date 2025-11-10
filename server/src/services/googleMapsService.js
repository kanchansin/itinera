import axios from "axios"

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY

export const getDirections = async (origin, destination, mode = "driving") => {
  try {
    const response = await axios.get("https://maps.googleapis.com/maps/api/directions/json", {
      params: {
        origin,
        destination,
        mode,
        key: GOOGLE_MAPS_API_KEY,
      },
    })
    return response.data
  } catch (error) {
    console.error("Error fetching directions:", error)
    throw error
  }
}

export const getPlaceDetails = async (placeId) => {
  try {
    const response = await axios.get("https://maps.googleapis.com/maps/api/place/details/json", {
      params: {
        place_id: placeId,
        key: GOOGLE_PLACES_API_KEY,
      },
    })
    return response.data
  } catch (error) {
    console.error("Error fetching place details:", error)
    throw error
  }
}

export const getNearbyPlaces = async (latitude, longitude, radius = 5000, type = "tourist_attraction") => {
  try {
    const response = await axios.get("https://maps.googleapis.com/maps/api/place/nearbysearch/json", {
      params: {
        location: `${latitude},${longitude}`,
        radius,
        type,
        key: GOOGLE_PLACES_API_KEY,
      },
    })
    return response.data
  } catch (error) {
    console.error("Error fetching nearby places:", error)
    throw error
  }
}

export const searchPlaces = async (query) => {
  try {
    const response = await axios.get("https://maps.googleapis.com/maps/api/place/textsearch/json", {
      params: {
        query,
        key: GOOGLE_PLACES_API_KEY,
      },
    })
    return response.data
  } catch (error) {
    console.error("Error searching places:", error)
    throw error
  }
}
