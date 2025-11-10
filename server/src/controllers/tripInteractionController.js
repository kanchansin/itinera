import pool from "../config/database.js"

export const likeTip = async (req, res) => {
  try {
    const { tripId } = req.params
    const userId = req.user.userId

    await pool.query("INSERT INTO trip_likes (user_id, trip_id) VALUES ($1, $2)", [userId, tripId])

    // Update likes count
    const result = await pool.query("UPDATE trips SET likes_count = likes_count + 1 WHERE id = $1 RETURNING *", [
      tripId,
    ])

    res.json(result.rows[0])
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({ error: "Trip already liked" })
    }
    res.status(500).json({ error: error.message })
  }
}

export const unlikeTrip = async (req, res) => {
  try {
    const { tripId } = req.params
    const userId = req.user.userId

    await pool.query("DELETE FROM trip_likes WHERE user_id = $1 AND trip_id = $2", [userId, tripId])

    const result = await pool.query(
      "UPDATE trips SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = $1 RETURNING *",
      [tripId],
    )

    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const saveTrip = async (req, res) => {
  try {
    const { tripId } = req.params
    const userId = req.user.userId

    await pool.query("INSERT INTO saved_trips (user_id, trip_id) VALUES ($1, $2)", [userId, tripId])

    res.json({ message: "Trip saved" })
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({ error: "Trip already saved" })
    }
    res.status(500).json({ error: error.message })
  }
}

export const unsaveTrip = async (req, res) => {
  try {
    const { tripId } = req.params
    const userId = req.user.userId

    await pool.query("DELETE FROM saved_trips WHERE user_id = $1 AND trip_id = $2", [userId, tripId])

    res.json({ message: "Trip unsaved" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const getSavedTrips = async (req, res) => {
  try {
    const userId = req.user.userId
    const { limit = 20, offset = 0 } = req.query

    const result = await pool.query(
      `SELECT t.* FROM trips t
       INNER JOIN saved_trips st ON t.id = st.trip_id
       WHERE st.user_id = $1
       ORDER BY st.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset],
    )

    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const addComment = async (req, res) => {
  try {
    const { tripId } = req.params
    const userId = req.user.userId
    const { comment } = req.body

    if (!comment) {
      return res.status(400).json({ error: "Comment is required" })
    }

    const result = await pool.query(
      `INSERT INTO trip_comments (user_id, trip_id, comment)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, tripId, comment],
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const getComments = async (req, res) => {
  try {
    const { tripId } = req.params
    const { limit = 10 } = req.query

    const result = await pool.query(
      `SELECT c.*, u.name, u.profile_picture FROM trip_comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.trip_id = $1
       ORDER BY c.created_at DESC
       LIMIT $2`,
      [tripId, limit],
    )

    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
