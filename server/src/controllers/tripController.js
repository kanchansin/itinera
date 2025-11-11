import { getDB } from "../config/database.js"
import { getDirections } from "../services/googleMapsService.js"
export const createTrip = async (req, res) => {
  try {
    const { title, destination, startLocation, startTime, endTime, transport, stops, isPublic } = req.body
    const userId = req.user.userId
    const db = getDB()
    const tripRef = db.collection("trips").doc()
    const tripId = tripRef.id
    const tripData = {
      id: tripId,
      userId,
      title,
      destination,
      startLocation,
      startTime,
      endTime,
      transport,
      isPublic: isPublic || false,
      createdAt: new Date().toISOString(),
    }
    await tripRef.set(tripData)
    if (stops && stops.length > 0) {
      const stopsRef = db.collection("tripStops")
      for (let i = 0; i < stops.length; i++) {
        const stop = stops[i]
        const stopRef = stopsRef.doc()
        await stopRef.set({
          id: stopRef.id,
          tripId,
          locationName: stop.name,
          latitude: stop.latitude,
          longitude: stop.longitude,
          estimatedDuration: stop.duration || 60,
          orderIndex: i,
          createdAt: new Date().toISOString(),
        })
      }
    }
    res.status(201).json(tripData)
  } catch (error) {
    console.error("Create Trip Error:", error.message)
    res.status(500).json({ error: error.message })
  }
}
export const getTrips = async (req, res) => {
  try {
    const userId = req.user.userId
    const db = getDB()
    const tripsSnapshot = await db
      .collection("trips")
      .where("userId", "==", userId)
      .orderBy("startTime", "desc")
      .get()
    const tripsWithStops = await Promise.all(
      tripsSnapshot.docs.map(async (tripDoc) => {
        const tripData = tripDoc.data()
        const stopsSnapshot = await db
          .collection("tripStops")
          .where("tripId", "==", tripData.id)
          .orderBy("orderIndex", "asc")
          .get()
        const stops = stopsSnapshot.docs.map((doc) => doc.data())
        return { ...tripData, stops }
      }),
    )
    res.json(tripsWithStops)
  } catch (error) {
    console.error("Get Trips Error:", error.message)
    res.status(500).json({ error: error.message })
  }
}
export const getTripById = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.userId
    const db = getDB()
    const tripRef = db.collection("trips").doc(id)
    const tripSnapshot = await tripRef.get()
    if (!tripSnapshot.exists) {
      return res.status(404).json({ error: "Trip not found" })
    }
    const trip = tripSnapshot.data()
    if (trip.userId !== userId && !trip.isPublic) {
      return res.status(403).json({ error: "Access denied" })
    }
    const stopsSnapshot = await db
      .collection("tripStops")
      .where("tripId", "==", id)
      .orderBy("orderIndex", "asc")
      .get()
    const stops = stopsSnapshot.docs.map((doc) => doc.data())
    res.json({ ...trip, stops })
  } catch (error) {
    console.error("Get Trip By ID Error:", error.message)
    res.status(500).json({ error: error.message })
  }
}
export const updateTrip = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.userId
    const { title, destination, startLocation, startTime, endTime, transport, isPublic } = req.body
    const db = getDB()
    const tripRef = db.collection("trips").doc(id)
    const tripSnapshot = await tripRef.get()
    if (!tripSnapshot.exists) {
      return res.status(404).json({ error: "Trip not found" })
    }
    const trip = tripSnapshot.data()
    if (trip.userId !== userId) {
      return res.status(403).json({ error: "Access denied" })
    }
    const updateData = {}
    if (title !== undefined) updateData.title = title
    if (destination !== undefined) updateData.destination = destination
    if (startLocation !== undefined) updateData.startLocation = startLocation
    if (startTime !== undefined) updateData.startTime = startTime
    if (endTime !== undefined) updateData.endTime = endTime
    if (transport !== undefined) updateData.transport = transport
    if (isPublic !== undefined) updateData.isPublic = isPublic
    updateData.updatedAt = new Date().toISOString()
    await tripRef.update(updateData)
    const updatedTrip = await tripRef.get()
    res.json(updatedTrip.data())
  } catch (error) {
    console.error("Update Trip Error:", error.message)
    res.status(500).json({ error: error.message })
  }
}
export const deleteTrip = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.userId
    const db = getDB()
    const tripRef = db.collection("trips").doc(id)
    const tripSnapshot = await tripRef.get()
    if (!tripSnapshot.exists) {
      return res.status(404).json({ error: "Trip not found" })
    }
    const trip = tripSnapshot.data()
    if (trip.userId !== userId) {
      return res.status(403).json({ error: "Access denied" })
    }
    await db
      .collection("tripStops")
      .where("tripId", "==", id)
      .get()
      .then((snapshot) => {
        snapshot.docs.forEach((doc) => doc.ref.delete())
      })
    await tripRef.delete()
    res.json({ message: "Trip deleted" })
  } catch (error) {
    console.error("Delete Trip Error:", error.message)
    res.status(500).json({ error: error.message })
  }
}
export const getPublicTrips = async (req, res) => {
  try {
    const { destination, limit = 20, offset = 0 } = req.query
    const db = getDB()
    let query = db.collection("trips").where("isPublic", "==", true)
    if (destination) {
      query = query.where("destination", "==", destination)
    }
    query = query.orderBy("createdAt", "desc").limit(parseInt(limit)).offset(parseInt(offset))
    const snapshot = await query.get()
    const trips = snapshot.docs.map((doc) => doc.data())
    res.json(trips)
  } catch (error) {
    console.error("Get Public Trips Error:", error.message)
    res.status(500).json({ error: error.message })
  }
}
export const calculateTripDuration = async (req, res) => {
  try {
    const { stops, transport = "driving" } = req.body
    if (!stops || stops.length < 2) {
      return res.status(400).json({ error: "At least 2 stops required" })
    }
    let totalDuration = 0
    for (let i = 0; i < stops.length - 1; i++) {
      const directions = await getDirections(
        `${stops[i].latitude},${stops[i].longitude}`,
        `${stops[i + 1].latitude},${stops[i + 1].longitude}`,
        transport,
      )
      if (directions.routes && directions.routes.length > 0) {
        const durationSeconds = directions.routes[0].legs[0].duration.value
        totalDuration += Math.ceil(durationSeconds / 60)
      }
    }
    res.json({ totalDuration })
  } catch (error) {
    console.error("Calculate Trip Duration Error:", error.message)
    res.status(500).json({ error: error.message })
  }
}
