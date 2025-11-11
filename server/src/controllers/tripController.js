import pool from "../config/database.js"
import { getDirections } from "../services/googleMapsService.js"

export const createTrip = async (req, res) => {
  try {
    const { title, destination, startLocation, startTime, endTime, transport, stops, isPublic } = req.body
    const userId = req.user.userId

    const result = await pool.query(
      `INSERT INTO trips (user_id, title, destination, start_location, start_time, end_time, transport, is_public)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [userId, title, destination, startLocation, startTime, endTime, transport, isPublic || false],
    )

    const trip = result.rows[0]

    // Add trip stops if provided
    if (stops && stops.length > 0) {
      for (let i = 0; i < stops.length; i++) {
        const stop = stops[i]
        await pool.query(
          `INSERT INTO trip_stops (trip_id, location_name, latitude, longitude, estimated_duration, order_index)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [trip.id, stop.name, stop.latitude, stop.longitude, stop.duration || 60, i],
        )
      }
    }

    res.status(201).json(trip)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const getTrips = async (req, res) => {
  try {
    const userId = req.user.userId

    const result = await pool.query("SELECT * FROM trips WHERE user_id = $1 ORDER BY start_time DESC", [userId])

    // Get stops for each trip
    const tripsWithStops = await Promise.all(
      result.rows.map(async (trip) => {
        const stops = await pool.query("SELECT * FROM trip_stops WHERE trip_id = $1 ORDER BY order_index", [trip.id])
        return { ...trip, stops: stops.rows }
      }),
    )

    res.json(tripsWithStops)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const getTripById = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.userId

    const result = await pool.query("SELECT * FROM trips WHERE id = $1 AND user_id = $2", [id, userId])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Trip not found" })
    }

    const trip = result.rows[0]

    // Get stops
    const stops = await pool.query("SELECT * FROM trip_stops WHERE trip_id = $1 ORDER BY order_index", [trip.id])

    res.json({ ...trip, stops: stops.rows })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const updateTrip = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.userId
    const { title, destination, startLocation, startTime, endTime, transport, isPublic } = req.body

    const result = await pool.query(
      `UPDATE trips SET title = $1, destination = $2, start_location = $3, start_time = $4, end_time = $5, transport = $6, is_public = $7
       WHERE id = $8 AND user_id = $9
       RETURNING *`,
      [title, destination, startLocation, startTime, endTime, transport, isPublic, id, userId],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Trip not found" })
    }

    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const deleteTrip = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.userId

    const result = await pool.query("DELETE FROM trips WHERE id = $1 AND user_id = $2 RETURNING *", [id, userId])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Trip not found" })
    }

    res.json({ message: "Trip deleted" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const getPublicTrips = async (req, res) => {
  try {
    const { destination, limit = 20, offset = 0 } = req.query

    let query = "SELECT * FROM trips WHERE is_public = true"
    const params = []

    if (destination) {
      query += " AND destination ILIKE $" + (params.length + 1)
      params.push(`%${destination}%`)
    }

    query += ` ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`

    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (error) {
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

    // Calculate durations between consecutive stops
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
    res.status(500).json({ error: error.message })
  }
}
