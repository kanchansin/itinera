import { getDB } from "../config/database.js"
export const likeTrip = async (req, res) => {
  try {
    const { tripId } = req.params
    const userId = req.user.userId
    const db = getDB()
    const likeRef = db.collection("tripLikes").doc(`${userId}_${tripId}`)
    const likeSnapshot = await likeRef.get()
    if (likeSnapshot.exists) {
      return res.status(400).json({ error: "Trip already liked" })
    }
    await likeRef.set({
      id: likeRef.id,
      userId,
      tripId,
      createdAt: new Date().toISOString(),
    })
    const likesSnapshot = await db.collection("tripLikes").where("tripId", "==", tripId).get()
    await db.collection("trips").doc(tripId).update({
      likesCount: likesSnapshot.docs.length,
    })
    const tripSnapshot = await db.collection("trips").doc(tripId).get()
    res.json(tripSnapshot.data())
  } catch (error) {
    console.error("Like Trip Error:", error.message)
    res.status(500).json({ error: error.message })
  }
}
export const unlikeTrip = async (req, res) => {
  try {
    const { tripId } = req.params
    const userId = req.user.userId
    const db = getDB()
    const likeRef = db.collection("tripLikes").doc(`${userId}_${tripId}`)
    await likeRef.delete()
    const likesSnapshot = await db.collection("tripLikes").where("tripId", "==", tripId).get()
    await db.collection("trips").doc(tripId).update({
      likesCount: Math.max(likesSnapshot.docs.length, 0),
    })
    const tripSnapshot = await db.collection("trips").doc(tripId).get()
    res.json(tripSnapshot.data())
  } catch (error) {
    console.error("Unlike Trip Error:", error.message)
    res.status(500).json({ error: error.message })
  }
}
export const saveTrip = async (req, res) => {
  try {
    const { tripId } = req.params
    const userId = req.user.userId
    const db = getDB()
    const saveRef = db.collection("savedTrips").doc(`${userId}_${tripId}`)
    const saveSnapshot = await saveRef.get()
    if (saveSnapshot.exists) {
      return res.status(400).json({ error: "Trip already saved" })
    }
    await saveRef.set({
      id: saveRef.id,
      userId,
      tripId,
      createdAt: new Date().toISOString(),
    })
    res.json({ message: "Trip saved" })
  } catch (error) {
    console.error("Save Trip Error:", error.message)
    res.status(500).json({ error: error.message })
  }
}
export const unsaveTrip = async (req, res) => {
  try {
    const { tripId } = req.params
    const userId = req.user.userId
    const db = getDB()
    const saveRef = db.collection("savedTrips").doc(`${userId}_${tripId}`)
    await saveRef.delete()
    res.json({ message: "Trip unsaved" })
  } catch (error) {
    console.error("Unsave Trip Error:", error.message)
    res.status(500).json({ error: error.message })
  }
}
export const getSavedTrips = async (req, res) => {
  try {
    const userId = req.user.userId
    const { limit = 20, offset = 0 } = req.query
    const db = getDB()
    const savesSnapshot = await db
      .collection("savedTrips")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(parseInt(limit))
      .offset(parseInt(offset))
      .get()
    const trips = await Promise.all(
      savesSnapshot.docs.map(async (saveDoc) => {
        const tripSnapshot = await db.collection("trips").doc(saveDoc.data().tripId).get()
        return tripSnapshot.exists ? tripSnapshot.data() : null
      }),
    )
    const filteredTrips = trips.filter((trip) => trip !== null)
    res.json(filteredTrips)
  } catch (error) {
    console.error("Get Saved Trips Error:", error.message)
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
    const db = getDB()
    const commentRef = db.collection("tripComments").doc()
    const commentId = commentRef.id
    await commentRef.set({
      id: commentId,
      userId,
      tripId,
      comment,
      createdAt: new Date().toISOString(),
    })
    const commentSnapshot = await commentRef.get()
    res.status(201).json(commentSnapshot.data())
  } catch (error) {
    console.error("Add Comment Error:", error.message)
    res.status(500).json({ error: error.message })
  }
}
export const getComments = async (req, res) => {
  try {
    const { tripId } = req.params
    const { limit = 10 } = req.query
    const db = getDB()
    const commentsSnapshot = await db
      .collection("tripComments")
      .where("tripId", "==", tripId)
      .orderBy("createdAt", "desc")
      .limit(parseInt(limit))
      .get()
    const comments = await Promise.all(
      commentsSnapshot.docs.map(async (commentDoc) => {
        const comment = commentDoc.data()
        const userRef = db.collection("users").doc(comment.userId)
        const userSnapshot = await userRef.get()
        const user = userSnapshot.exists ? userSnapshot.data() : {}
        return {
          ...comment,
          userName: user.name,
          userProfilePicture: user.profilePicture,
        }
      }),
    )
    res.json(comments)
  } catch (error) {
    console.error("Get Comments Error:", error.message)
    res.status(500).json({ error: error.message })
  }
}