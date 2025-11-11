import pool from "../config/database.js"

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId

    const result = await pool.query(
      `SELECT id, name, email, profile_picture, created_at,
              (SELECT json_agg(json_build_object(
                'id', t.id, 'title', t.title, 'status', t.status,
                'start_date', t.start_date, 'total_distance', t.total_distance
              )) FROM trips t WHERE t.user_id = u.id) as trips
       FROM users u WHERE u.id = $1`,
      [userId],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId
    const { name, profilePicture, bio, phone } = req.body

    const result = await pool.query(
      `UPDATE users 
       SET name = COALESCE($1, name), 
           profile_picture = COALESCE($2, profile_picture),
           bio = COALESCE($3, bio),
           phone = COALESCE($4, phone)
       WHERE id = $5 
       RETURNING id, name, email, profile_picture, bio, phone`,
      [name, profilePicture, bio, phone, userId],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
