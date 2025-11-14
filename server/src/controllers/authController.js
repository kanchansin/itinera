import jwt from "jsonwebtoken"
import { getDB } from "../config/database.js"
import admin from "firebase-admin"

const generateTokens = (userId) => {
  console.log("[TOKENS] Generating tokens for user ID:", userId)
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  })
  const refreshToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  })
  console.log("[TOKENS] Access token generated with 1h expiry")
  console.log("[TOKENS] Refresh token generated with 7d expiry")
  return { accessToken, refreshToken }
}

export const googleAuth = async (req, res) => {
  try {
    console.log("[GOOGLE AUTH] Request received")
    const { idToken } = req.body
    
    if (!idToken) {
      console.log("[GOOGLE AUTH] Error: No ID token provided")
      return res.status(400).json({ error: "ID token is required" })
    }

    console.log("[GOOGLE AUTH] Verifying ID token with Firebase")
    const decodedToken = await admin.auth().verifyIdToken(idToken)
    
    console.log("[GOOGLE AUTH] Token verified successfully")
    console.log("[GOOGLE AUTH] User email:", decodedToken.email)
    
    const email = decodedToken.email
    const name = decodedToken.name || email.split("@")[0]
    const firebaseUid = decodedToken.uid
    
    console.log("[GOOGLE AUTH] Firebase UID:", firebaseUid)
    console.log("[GOOGLE AUTH] User name:", name)
    
    const db = getDB()
    const usersRef = db.collection("users")
    
    console.log("[GOOGLE AUTH] Checking if user exists in database")
    const userQuery = await usersRef.where("email", "==", email).get()
    
    let user
    
    if (userQuery.empty) {
      console.log("[GOOGLE AUTH] New user detected, creating user document")
      const newUserRef = usersRef.doc(firebaseUid)
      const newUser = {
        id: firebaseUid,
        name: name,
        email: email,
        firebaseUid: firebaseUid,
        profilePicture: decodedToken.picture || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      await newUserRef.set(newUser)
      console.log("[GOOGLE AUTH] New user created successfully with ID:", firebaseUid)
      user = newUser
    } else {
      console.log("[GOOGLE AUTH] Existing user found")
      const existingUser = userQuery.docs[0].data()
      user = {
        id: existingUser.id || firebaseUid,
        email: existingUser.email,
        name: existingUser.name,
        profilePicture: existingUser.profilePicture,
      }
    }
    
    console.log("[GOOGLE AUTH] Generating tokens for user:", user.email)
    const { accessToken, refreshToken } = generateTokens(user.id)
    
    console.log("[GOOGLE AUTH] Login successful for user:", user.email)
    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      accessToken,
      refreshToken,
    })
  } catch (error) {
    console.error("[GOOGLE AUTH] Error:", error.message)
    console.error("[GOOGLE AUTH] Error code:", error.code)
    console.error("[GOOGLE AUTH] Full error:", error)
    if (error.code === 'auth/id-token-expired') {
      console.log("[GOOGLE AUTH] Token expired")
      return res.status(401).json({ error: "Token expired" })
    }
    if (error.code === 'auth/argument-error') {
      console.log("[GOOGLE AUTH] Invalid token format")
      return res.status(400).json({ error: "Invalid token format" })
    }
    res.status(500).json({ error: error.message })
  }
}

export const refreshToken = async (req, res) => {
  try {
    console.log("[REFRESH TOKEN] Request received")
    const { refreshToken: token } = req.body
    
    if (!token) {
      console.log("[REFRESH TOKEN] Error: No refresh token provided")
      return res.status(401).json({ error: "No refresh token provided" })
    }
    
    console.log("[REFRESH TOKEN] Verifying refresh token")
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    console.log("[REFRESH TOKEN] Token verified for user ID:", decoded.userId)
    const { accessToken: newAccessToken } = generateTokens(decoded.userId)
    
    console.log("[REFRESH TOKEN] New access token generated successfully")
    res.json({ accessToken: newAccessToken })
  } catch (error) {
    console.error("[REFRESH TOKEN] Error:", error.message)
    console.error("[REFRESH TOKEN] Full error:", error)
    res.status(403).json({ error: "Invalid refresh token" })
  }
}

export const login = async (req, res) => {
  try {
    console.log("[LOGIN] Request received with body:", req.body)
    const { email, password } = req.body

    if (!email || !password) {
      console.log("[LOGIN] Error: Email or password missing")
      return res.status(400).json({ error: "Email and password required" })
    }

    console.log("[LOGIN] Authenticating user:", email)
    
    const db = getDB()
    const usersRef = db.collection("users")
    
    console.log("[LOGIN] Searching for user in database with email:", email)
    const userQuery = await usersRef.where("email", "==", email).get()
    console.log("[LOGIN] Query returned", userQuery.size, "results")

    if (userQuery.empty) {
      console.log("[LOGIN] User not found:", email)
      return res.status(401).json({ error: "User not found. Please sign up first." })
    }

    const user = userQuery.docs[0].data()
    console.log("[LOGIN] User found:", user.email, "with ID:", user.id)
    console.log("[LOGIN] Stored password exists:", !!user.password)
    console.log("[LOGIN] Provided password exists:", !!password)

    const isPasswordValid = password === user.password

    if (!isPasswordValid) {
      console.log("[LOGIN] Invalid password for user:", email)
      console.log("[LOGIN] Expected:", user.password)
      console.log("[LOGIN] Got:", password)
      return res.status(401).json({ error: "Invalid email or password" })
    }

    console.log("[LOGIN] Password verified for user:", email)
    const { accessToken, refreshToken } = generateTokens(user.id)

    console.log("[LOGIN] Login successful for user:", email)
    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      accessToken,
      refreshToken,
    })
  } catch (error) {
    console.error("[LOGIN] Error:", error.message)
    console.error("[LOGIN] Full error:", error)
    res.status(500).json({ error: error.message || "Server error during login" })
  }
}

export const register = async (req, res) => {
  try {
    console.log("[REGISTER] Request received with body:", req.body)
    const { email, password, name } = req.body

    if (!email || !password || !name) {
      console.log("[REGISTER] Error: Missing required fields - email:", !!email, "password:", !!password, "name:", !!name)
      return res.status(400).json({ error: "Email, password, and name required" })
    }

    console.log("[REGISTER] Registering new user:", email)
    
    const db = getDB()
    const usersRef = db.collection("users")

    console.log("[REGISTER] Checking if user already exists")
    const userQuery = await usersRef.where("email", "==", email).get()
    console.log("[REGISTER] Query returned", userQuery.size, "results")

    if (!userQuery.empty) {
      console.log("[REGISTER] User already exists:", email)
      return res.status(400).json({ error: "Email already registered. Please log in instead." })
    }

    console.log("[REGISTER] User does not exist, creating new user")
    const userId = `user_${Date.now()}`
    const newUser = {
      id: userId,
      email: email,
      password: password,
      name: name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    console.log("[REGISTER] Writing user to Firestore with ID:", userId)
    await usersRef.doc(userId).set(newUser)
    console.log("[REGISTER] User created successfully with ID:", userId)

    const { accessToken, refreshToken } = generateTokens(userId)

    console.log("[REGISTER] Registration successful for user:", email)
    res.status(201).json({
      user: {
        id: userId,
        email: email,
        name: name,
      },
      accessToken,
      refreshToken,
    })
  } catch (error) {
    console.error("[REGISTER] Error:", error.message)
    console.error("[REGISTER] Full error:", error)
    res.status(500).json({ error: error.message || "Server error during registration" })
  }
}