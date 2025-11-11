import { getDB } from "../config/database.js"
import { searchPlaces } from "../services/googleMapsService.js"
export const getDestinations = async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query
    const db = getDB()
    const snapshot = await db
      .collection("destinations")
      .orderBy("averageRating", "desc")
      .limit(parseInt(limit))
      .offset(parseInt(offset))
      .get()
    const destinations = snapshot.docs.map((doc) => doc.data())
    res.json(destinations)
  } catch (error) {
    console.error("Get Destinations Error:", error.message)
    res.status(500).json({ error: error.message })
  }
}
export const getDestinationById = async (req, res) => {
  try {
    const { id } = req.params
    const db = getDB()
    const snapshot = await db.collection("destinations").doc(id).get()
    if (!snapshot.exists) {
      return res.status(404).json({ error: "Destination not found" })
    }
    res.json(snapshot.data())
  } catch (error) {
    console.error("Get Destination By ID Error:", error.message)
    res.status(500).json({ error: error.message })
  }
}
export const getDestinationReviews = async (req, res) => {
  try {
    const { id } = req.params
    const { limit = 10 } = req.query
    const db = getDB()
    const reviewsSnapshot = await db
      .collection("reviews")
      .where("destinationId", "==", id)
      .orderBy("createdAt", "desc")
      .limit(parseInt(limit))
      .get()
    const reviews = await Promise.all(
      reviewsSnapshot.docs.map(async (reviewDoc) => {
        const review = reviewDoc.data()
        const userRef = db.collection("users").doc(review.userId)
        const userSnapshot = await userRef.get()
        const user = userSnapshot.exists ? userSnapshot.data() : {}
        return {
          ...review,
          userName: user.name,
          userProfilePicture: user.profilePicture,
        }
      }),
    )
    res.json(reviews)
  } catch (error) {
    console.error("Get Destination Reviews Error:", error.message)
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
    const db = getDB()
    const reviewRef = db.collection("reviews").doc()
    const reviewId = reviewRef.id
    await reviewRef.set({
      id: reviewId,
      userId,
      destinationId,
      rating,
      comment: comment || null,
      visitDuration: visitDuration || null,
      createdAt: new Date().toISOString(),
    })
    const reviewsSnapshot = await db
      .collection("reviews")
      .where("destinationId", "==", destinationId)
      .get()
    let totalRating = 0
    reviewsSnapshot.docs.forEach((doc) => {
      totalRating += doc.data().rating
    })
    const averageRating = totalRating / reviewsSnapshot.docs.length
    const destRef = db.collection("destinations").doc(destinationId)
    await destRef.update({
      averageRating,
      totalReviews: reviewsSnapshot.docs.length,
      updatedAt: new Date().toISOString(),
    })
    const reviewSnapshot = await reviewRef.get()
    res.status(201).json(reviewSnapshot.data())
  } catch (error) {
    console.error("Add Review Error:", error.message)
    res.status(500).json({ error: error.message })
  }
}
export const searchDestinations = async (req, res) => {
  try {
    const { query, latitude, longitude } = req.query
    if (!query) {
      return res.status(400).json({ error: "Search query required" })
    }
    const db = getDB()
    const dbSnapshot = await db
      .collection("destinations")
      .where("name", ">=", query)
      .where("name", "<=", query + "\uf8ff")
      .limit(5)
      .get()
    const database = dbSnapshot.docs.map((doc) => doc.data())
    let external = []
    try {
      const googleData = await searchPlaces(query)
      external = googleData.results || []
    } catch (err) {
      console.log("Google Places search failed")
    }
    res.json({
      database,
      external: external.slice(0, 5),
    })
  } catch (error) {
    console.error("Search Destinations Error:", error.message)
    res.status(500).json({ error: error.message })
  }
}