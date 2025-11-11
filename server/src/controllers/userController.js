import { getDB } from "../config/database.js"
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId
    const db = getDB()
    const userRef = db.collection("users").doc(userId)
    const userSnapshot = await userRef.get()
    if (!userSnapshot.exists) {
      return res.status(404).json({ error: "User not found" })
    }
    const userData = userSnapshot.data()
    const tripsSnapshot = await db
      .collection("trips")
      .where("userId", "==", userId)
      .get()
    const trips = tripsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    res.json({
      ...userData,
      trips,
    })
  } catch (error) {
    console.error("Get User Profile Error:", error.message)
    res.status(500).json({ error: error.message })
  }
}
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId
    const { name, profilePicture, bio, phone } = req.body
    const db = getDB()
    const userRef = db.collection("users").doc(userId)
    const updateData = {}
    if (name !== undefined) updateData.name = name
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture
    if (bio !== undefined) updateData.bio = bio
    if (phone !== undefined) updateData.phone = phone
    updateData.updatedAt = new Date().toISOString()
    await userRef.update(updateData)
    const updatedSnapshot = await userRef.get()
    if (!updatedSnapshot.exists) {
      return res.status(404).json({ error: "User not found" })
    }
    res.json(updatedSnapshot.data())
  } catch (error) {
    console.error("Update User Profile Error:", error.message)
    res.status(500).json({ error: error.message })
  }
}
