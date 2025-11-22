import { getDB } from "../config/database.js"

export const createGuide = async (req, res) => {
    try {
        const { tripId, title, description, photos, visibility, tags } = req.body
        const userId = req.user.userId
        const db = getDB()

        const guideRef = db.collection("guides").doc()
        const guideId = guideRef.id

        const guideData = {
            id: guideId,
            userId,
            tripId,
            title,
            description,
            photos: photos || [],
            visibility: visibility || "public",
            tags: tags || [],
            likesCount: 0,
            savesCount: 0,
            startsCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }

        await guideRef.set(guideData)

        if (tripId) {
            const tripRef = db.collection("trips").doc(tripId)
            await tripRef.update({
                guideId,
                status: "completed",
                updatedAt: new Date().toISOString(),
            })
        }

        res.status(201).json(guideData)
    } catch (error) {
        console.error("Create Guide Error:", error.message)
        res.status(500).json({ error: error.message })
    }
}

export const getGuides = async (req, res) => {
    try {
        const { userId, visibility = "public", limit = 20, offset = 0 } = req.query
        const db = getDB()

        let query = db.collection("guides")

        if (userId) {
            query = query.where("userId", "==", userId)
        }

        if (visibility) {
            query = query.where("visibility", "==", visibility)
        }

        query = query.orderBy("createdAt", "desc").limit(parseInt(limit)).offset(parseInt(offset))

        const snapshot = await query.get()
        const guides = await Promise.all(
            snapshot.docs.map(async (doc) => {
                const guideData = doc.data()
                const userDoc = await db.collection("users").doc(guideData.userId).get()
                const userData = userDoc.data()

                return {
                    ...guideData,
                    user: {
                        id: userData?.id,
                        name: userData?.name,
                        profilePicture: userData?.profilePicture,
                    },
                }
            })
        )

        res.json(guides)
    } catch (error) {
        console.error("Get Guides Error:", error.message)
        res.status(500).json({ error: error.message })
    }
}

export const getGuideById = async (req, res) => {
    try {
        const { id } = req.params
        const db = getDB()

        const guideRef = db.collection("guides").doc(id)
        const guideSnapshot = await guideRef.get()

        if (!guideSnapshot.exists) {
            return res.status(404).json({ error: "Guide not found" })
        }

        const guide = guideSnapshot.data()
        const userDoc = await db.collection("users").doc(guide.userId).get()
        const userData = userDoc.data()

        const tripRef = db.collection("trips").doc(guide.tripId)
        const tripSnapshot = await tripRef.get()
        const tripData = tripSnapshot.exists ? tripSnapshot.data() : null

        res.json({
            ...guide,
            user: {
                id: userData?.id,
                name: userData?.name,
                profilePicture: userData?.profilePicture,
            },
            trip: tripData,
        })
    } catch (error) {
        console.error("Get Guide By ID Error:", error.message)
        res.status(500).json({ error: error.message })
    }
}

export const updateGuide = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.user.userId
        const { title, description, photos, visibility, tags } = req.body
        const db = getDB()

        const guideRef = db.collection("guides").doc(id)
        const guideSnapshot = await guideRef.get()

        if (!guideSnapshot.exists) {
            return res.status(404).json({ error: "Guide not found" })
        }

        const guide = guideSnapshot.data()

        if (guide.userId !== userId) {
            return res.status(403).json({ error: "Access denied" })
        }

        const updateData = {
            updatedAt: new Date().toISOString(),
        }

        if (title !== undefined) updateData.title = title
        if (description !== undefined) updateData.description = description
        if (photos !== undefined) updateData.photos = photos
        if (visibility !== undefined) updateData.visibility = visibility
        if (tags !== undefined) updateData.tags = tags

        await guideRef.update(updateData)

        const updatedGuide = await guideRef.get()
        res.json(updatedGuide.data())
    } catch (error) {
        console.error("Update Guide Error:", error.message)
        res.status(500).json({ error: error.message })
    }
}

export const deleteGuide = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.user.userId
        const db = getDB()

        const guideRef = db.collection("guides").doc(id)
        const guideSnapshot = await guideRef.get()

        if (!guideSnapshot.exists) {
            return res.status(404).json({ error: "Guide not found" })
        }

        const guide = guideSnapshot.data()

        if (guide.userId !== userId) {
            return res.status(403).json({ error: "Access denied" })
        }

        await db
            .collection("guideLikes")
            .where("guideId", "==", id)
            .get()
            .then((snapshot) => {
                snapshot.docs.forEach((doc) => doc.ref.delete())
            })

        await db
            .collection("guideSaves")
            .where("guideId", "==", id)
            .get()
            .then((snapshot) => {
                snapshot.docs.forEach((doc) => doc.ref.delete())
            })

        await guideRef.delete()

        res.json({ message: "Guide deleted" })
    } catch (error) {
        console.error("Delete Guide Error:", error.message)
        res.status(500).json({ error: error.message })
    }
}

export const likeGuide = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.user.userId
        const db = getDB()

        const guideRef = db.collection("guides").doc(id)
        const guideSnapshot = await guideRef.get()

        if (!guideSnapshot.exists) {
            return res.status(404).json({ error: "Guide not found" })
        }

        const likeQuery = await db
            .collection("guideLikes")
            .where("guideId", "==", id)
            .where("userId", "==", userId)
            .get()

        if (!likeQuery.empty) {
            const likeDoc = likeQuery.docs[0]
            await likeDoc.ref.delete()
            await guideRef.update({
                likesCount: (guideSnapshot.data().likesCount || 1) - 1,
            })
            return res.json({ liked: false, message: "Guide unliked" })
        }

        const likeRef = db.collection("guideLikes").doc()
        await likeRef.set({
            id: likeRef.id,
            guideId: id,
            userId,
            createdAt: new Date().toISOString(),
        })

        await guideRef.update({
            likesCount: (guideSnapshot.data().likesCount || 0) + 1,
        })

        res.json({ liked: true, message: "Guide liked" })
    } catch (error) {
        console.error("Like Guide Error:", error.message)
        res.status(500).json({ error: error.message })
    }
}

export const saveGuide = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.user.userId
        const db = getDB()

        const guideRef = db.collection("guides").doc(id)
        const guideSnapshot = await guideRef.get()

        if (!guideSnapshot.exists) {
            return res.status(404).json({ error: "Guide not found" })
        }

        const saveQuery = await db
            .collection("guideSaves")
            .where("guideId", "==", id)
            .where("userId", "==", userId)
            .get()

        if (!saveQuery.empty) {
            const saveDoc = saveQuery.docs[0]
            await saveDoc.ref.delete()
            await guideRef.update({
                savesCount: (guideSnapshot.data().savesCount || 1) - 1,
            })
            return res.json({ saved: false, message: "Guide unsaved" })
        }

        const saveRef = db.collection("guideSaves").doc()
        await saveRef.set({
            id: saveRef.id,
            guideId: id,
            userId,
            createdAt: new Date().toISOString(),
        })

        await guideRef.update({
            savesCount: (guideSnapshot.data().savesCount || 0) + 1,
        })

        res.json({ saved: true, message: "Guide saved" })
    } catch (error) {
        console.error("Save Guide Error:", error.message)
        res.status(500).json({ error: error.message })
    }
}

export const startTripFromGuide = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.user.userId
        const db = getDB()

        const guideRef = db.collection("guides").doc(id)
        const guideSnapshot = await guideRef.get()

        if (!guideSnapshot.exists) {
            return res.status(404).json({ error: "Guide not found" })
        }

        const guide = guideSnapshot.data()
        const tripRef = db.collection("trips").doc(guide.tripId)
        const tripSnapshot = await tripRef.get()

        if (!tripSnapshot.exists) {
            return res.status(404).json({ error: "Original trip not found" })
        }

        const originalTrip = tripSnapshot.data()

        const newTripRef = db.collection("trips").doc()
        const newTripId = newTripRef.id

        const newTripData = {
            ...originalTrip,
            id: newTripId,
            userId,
            clonedFrom: guide.tripId,
            guideId: id,
            status: "active",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }

        await newTripRef.set(newTripData)

        const stopsSnapshot = await db
            .collection("tripStops")
            .where("tripId", "==", guide.tripId)
            .orderBy("orderIndex", "asc")
            .get()

        for (const stopDoc of stopsSnapshot.docs) {
            const stopData = stopDoc.data()
            const newStopRef = db.collection("tripStops").doc()
            await newStopRef.set({
                ...stopData,
                id: newStopRef.id,
                tripId: newTripId,
                createdAt: new Date().toISOString(),
            })
        }

        await guideRef.update({
            startsCount: (guide.startsCount || 0) + 1,
        })

        res.status(201).json(newTripData)
    } catch (error) {
        console.error("Start Trip From Guide Error:", error.message)
        res.status(500).json({ error: error.message })
    }
}

export const getSavedGuides = async (req, res) => {
    try {
        const userId = req.user.userId
        const db = getDB()

        const savesSnapshot = await db
            .collection("guideSaves")
            .where("userId", "==", userId)
            .orderBy("createdAt", "desc")
            .get()

        const guides = await Promise.all(
            savesSnapshot.docs.map(async (saveDoc) => {
                const saveData = saveDoc.data()
                const guideDoc = await db.collection("guides").doc(saveData.guideId).get()

                if (!guideDoc.exists) return null

                const guideData = guideDoc.data()
                const userDoc = await db.collection("users").doc(guideData.userId).get()
                const userData = userDoc.data()

                return {
                    ...guideData,
                    user: {
                        id: userData?.id,
                        name: userData?.name,
                        profilePicture: userData?.profilePicture,
                    },
                }
            })
        )

        res.json(guides.filter(g => g !== null))
    } catch (error) {
        console.error("Get Saved Guides Error:", error.message)
        res.status(500).json({ error: error.message })
    }
}
