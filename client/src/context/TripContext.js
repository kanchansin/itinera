"use client"

import { createContext, useState, useCallback } from "react"
import api from "../utils/api"

export const TripContext = createContext()

export const TripProvider = ({ children }) => {
  const [trips, setTrips] = useState([])
  const [currentTrip, setCurrentTrip] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchTrips = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.get("/trips")
      setTrips(response.data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchPublicTrips = useCallback(async (destination) => {
    setLoading(true)
    try {
      const params = destination ? { destination } : {}
      const response = await api.get("/trips/explore/feed", { params })
      return response.data
    } catch (err) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const createTrip = useCallback(
    async (tripData) => {
      setLoading(true)
      try {
        const response = await api.post("/trips", tripData)
        setTrips([response.data, ...trips])
        setError(null)
        return response.data
      } catch (err) {
        setError(err.message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [trips],
  )

  const updateTrip = useCallback(
    async (tripId, tripData) => {
      setLoading(true)
      try {
        const response = await api.put(`/trips/${tripId}`, tripData)
        setTrips(trips.map((t) => (t.id === tripId ? response.data : t)))
        setError(null)
        return response.data
      } catch (err) {
        setError(err.message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [trips],
  )

  const deleteTrip = useCallback(
    async (tripId) => {
      setLoading(true)
      try {
        await api.delete(`/trips/${tripId}`)
        setTrips(trips.filter((t) => t.id !== tripId))
        setError(null)
      } catch (err) {
        setError(err.message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [trips],
  )

  const likeTrip = useCallback(async (tripId) => {
    try {
      const response = await api.post(`/interactions/${tripId}/like`)
      return response.data
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  const saveTrip = useCallback(async (tripId) => {
    try {
      await api.post(`/interactions/${tripId}/save`)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  const value = {
    trips,
    currentTrip,
    setCurrentTrip,
    loading,
    error,
    fetchTrips,
    fetchPublicTrips,
    createTrip,
    updateTrip,
    deleteTrip,
    likeTrip,
    saveTrip,
  }

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>
}
