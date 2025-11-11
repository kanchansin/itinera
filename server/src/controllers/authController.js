import jwt from "jsonwebtoken"
import { getDB } from "../config/database.js"
import admin from "firebase-admin"
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  })
  const refreshToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  })
  return { accessToken, refreshToken }
}
export const googleAuth = async (req, res) => {
  try {
    const { idToken, displayName, email } = req.body
    if (!idToken || !email) {
      return res.status(400).json({ error: "Missing required fields" })
    }
    const decodedToken = await admin.auth().verifyIdToken(idToken)
    const db = getDB()
    const usersRef = db.collection("users")
    const userQuery = await usersRef.where("email", "==", email).get()
    let user
    if (userQuery.empty) {
      const newUserRef = usersRef.doc(decodedToken.uid)
      await newUserRef.set({
        id: decodedToken.uid,
        name: displayName || email.split("@")[0],
        email,
        firebaseUid: decodedToken.uid,
        createdAt: new Date().toISOString(),
      })
      user = { id: decodedToken.uid, email, name: displayName || email.split("@")[0] }
    } else {
      user = { id: decodedToken.uid, email, name: userQuery.docs[0].data().name }
    }
    const { accessToken, refreshToken } = generateTokens(decodedToken.uid)
    res.status(201).json({
      user,
      accessToken,
      refreshToken,
    })
  } catch (error) {
    console.error("Google Auth Error:", error.message)
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
    console.error("Refresh Token Error:", error.message)
    res.status(403).json({ error: "Invalid refresh token" })
  }
}
