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

export const verifyFirebaseToken = async (req, res) => {
  try {
    console.log("[FIREBASE AUTH] Request received")
    const { idToken } = req.body
    
    if (!idToken) {
      console.log("[FIREBASE AUTH] Error: No ID token provided")
      return res.status(400).json({ error: "ID token is required" })
    }

    console.log("[FIREBASE AUTH] Verifying ID token with Firebase")
    const decodedToken = await admin.auth().verifyIdToken(idToken)
    
    console.log("[FIREBASE AUTH] Token verified successfully")
    console.log("[FIREBASE AUTH] User email:", decodedToken.email)
    
    const email = decodedToken.email
    const name = decodedToken.name || email.split("@")[0]
    const firebaseUid = decodedToken.uid
    
    console.log("[FIREBASE AUTH] Firebase UID:", firebaseUid)
    console.log("[FIREBASE AUTH] User name:", name)
    
    const db = getDB()
    const usersRef = db.collection("users")
    
    console.log("[FIREBASE AUTH] Checking if user exists in database")
    const userQuery = await usersRef.where("firebaseUid", "==", firebaseUid).get()
    
    let user
    
    if (userQuery.empty) {
      console.log("[FIREBASE AUTH] New user detected, creating user document")
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
      console.log("[FIREBASE AUTH] New user created successfully with ID:", firebaseUid)
      user = newUser
    } else {
      console.log("[FIREBASE AUTH] Existing user found")
      const existingUser = userQuery.docs[0].data()
      user = {
        id: existingUser.id || firebaseUid,
        email: existingUser.email,
        name: existingUser.name,
        profilePicture: existingUser.profilePicture,
      }
    }
    
    console.log("[FIREBASE AUTH] Generating tokens for user:", user.email)
    const { accessToken, refreshToken } = generateTokens(user.id)
    
    console.log("[FIREBASE AUTH] Authentication successful for user:", user.email)
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
    console.error("[FIREBASE AUTH] Error:", error.message)
    console.error("[FIREBASE AUTH] Error code:", error.code)
    console.error("[FIREBASE AUTH] Full error:", error)
    if (error.code === 'auth/id-token-expired') {
      console.log("[FIREBASE AUTH] Token expired")
      return res.status(401).json({ error: "Token expired" })
    }
    if (error.code === 'auth/argument-error') {
      console.log("[FIREBASE AUTH] Invalid token format")
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