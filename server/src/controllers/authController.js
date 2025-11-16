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

export const verifyFirebaseToken = async (req, res) => {
  try {
    const { idToken } = req.body
    
    if (!idToken) {
      return res.status(400).json({ error: "ID token is required" })
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken)
    
    const email = decodedToken.email
    const name = decodedToken.name || email.split("@")[0]
    const firebaseUid = decodedToken.uid
    
    const db = getDB()
    const usersRef = db.collection("users")
    
    const userQuery = await usersRef.where("firebaseUid", "==", firebaseUid).get()
    
    let user
    
    if (userQuery.empty) {
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
      user = newUser
    } else {
      const existingUser = userQuery.docs[0].data()
      user = {
        id: existingUser.id || firebaseUid,
        email: existingUser.email,
        name: existingUser.name,
        profilePicture: existingUser.profilePicture,
      }
    }
    
    const { accessToken, refreshToken } = generateTokens(user.id)
    
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
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ error: "Token expired" })
    }
    if (error.code === 'auth/argument-error') {
      return res.status(400).json({ error: "Invalid token format" })
    }
    res.status(500).json({ error: error.message })
  }
}

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body
    
    if (!token) {
      return res.status(401).json({ error: "No refresh token provided" })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const { accessToken: newAccessToken } = generateTokens(decoded.userId)
    
    res.json({ accessToken: newAccessToken })
  } catch (error) {
    console.error("[REFRESH TOKEN] Error:", error.message)
    res.status(403).json({ error: "Invalid refresh token" })
  }
}