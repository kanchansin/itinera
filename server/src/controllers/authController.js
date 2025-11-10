import jwt from "jsonwebtoken"
import bcryptjs from "bcryptjs"
import pool from "../config/database.js"

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  })
  const refreshToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  })
  return { accessToken, refreshToken }
}

export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    // Check if user exists
    const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email])

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" })
    }

    const hashedPassword = await bcryptjs.hash(password, 10)

    const result = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, email, name",
      [name, email, hashedPassword],
    )

    const user = result.rows[0]
    const { accessToken, refreshToken } = generateTokens(user.id)

    res.status(201).json({
      user,
      accessToken,
      refreshToken,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" })
    }

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email])

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const user = result.rows[0]
    const passwordMatch = await bcryptjs.compare(password, user.password)

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const { accessToken, refreshToken } = generateTokens(user.id)

    res.json({
      user: { id: user.id, email: user.email, name: user.name },
      accessToken,
      refreshToken,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const googleAuth = async (req, res) => {
  try {
    const { id, displayName, emails } = req.user
    const email = emails[0].value

    let user = await pool.query("SELECT * FROM users WHERE email = $1", [email])

    if (user.rows.length === 0) {
      const result = await pool.query(
        "INSERT INTO users (name, email, google_id) VALUES ($1, $2, $3) RETURNING id, email, name",
        [displayName, email, id],
      )
      user = result.rows[0]
    } else {
      user = user.rows[0]
    }

    const { accessToken, refreshToken } = generateTokens(user.id)

    // Redirect to frontend with tokens
    res.redirect(
      `${process.env.FRONTEND_URL || "http://localhost:3000"}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`,
    )
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(401).json({ error: "No refresh token provided" })
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET)
    const { accessToken: newAccessToken } = generateTokens(decoded.userId)

    res.json({ accessToken: newAccessToken })
  } catch (error) {
    res.status(403).json({ error: "Invalid refresh token" })
  }
}
