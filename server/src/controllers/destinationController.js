import pool from "../config/database.js"
import { searchPlaces } from "../services/googleMapsService.js"

export const getDestinations = async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query

    const result = await pool.query("SELECT * FROM destinations ORDER BY average_rating DESC LIMIT $1 OFFSET $2", [
      limit,
      offset,
    ])

    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const getDestinationById = async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query("SELECT * FROM destinations WHERE id = $1", [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Destination not found" })
    }

    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const getDestinationReviews = async (req, res) => {
  try {
    const { id } = req.params
    const { limit = 10 } = req.query

    const result = await pool.query(
      `SELECT r.*, u.name, u.profile_picture FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.destination_id = $1
       ORDER BY r.created_at DESC
       LIMIT $2`,
      [id, limit],
    )

    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const addReview = async (req, res) => {
  try {
    const { id: destinationId } = req.params
    const userId = req.user.userId
    const { rating, comment, visitDuration } = req.body

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Invalid rating" })
    }

    const review = await pool.query(
      `INSERT INTO reviews (user_id, destination_id, rating, comment, visit_duration)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, destinationId, rating, comment || null, visitDuration || null],
    )

    // Update destination average rating
    const stats = await pool.query(
      `SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews FROM reviews WHERE destination_id = $1`,
      [destinationId],
    )

    await pool.query(`UPDATE destinations SET average_rating = $1, total_reviews = $2 WHERE id = $3`, [
      stats.rows[0].avg_rating,
      stats.rows[0].total_reviews,
      destinationId,
    ])

    res.status(201).json(review.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const searchDestinations = async (req, res) => {
  try {
    const { query, latitude, longitude } = req.query

    if (!query) {
      return res.status(400).json({ error: "Search query required" })
    }

    // First, search in database
    const dbResult = await pool.query(
      `SELECT * FROM destinations WHERE name ILIKE $1 OR description ILIKE $1 LIMIT 5`,
      [`%${query}%`],
    )

    // Then search Google Places API for additional results
    let googleResults = []
    try {
      const googleData = await searchPlaces(query)
      googleResults = googleData.results || []
    } catch (err) {
      console.log("Google Places search failed, returning DB results only")
    }

    res.json({
      database: dbResult.rows,
      external: googleResults.slice(0, 5),
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
