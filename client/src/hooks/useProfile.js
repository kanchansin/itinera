"use client"

import { useState, useCallback } from "react"
import { useAuth } from "./useAuth"

const useProfile = () => {
  const { user } = useAuth()
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchProfile = useCallback(async () => {
    if (!user?.id) return
    try {
      setLoading(true)
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/${user.id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      })
      const data = await response.json()
      setProfileData(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user?.id, user?.token])

  return {
    profileData,
    loading,
    error,
    fetchProfile,
    setProfileData,
  }
}

export default useProfile
