"use client"

import { useState, useEffect } from "react"
import * as Location from "expo-location"

export const useLocation = () => {
  const [location, setLocation] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)

  useEffect(() => {
    ;(async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied")
        return
      }

      const location = await Location.getCurrentPositionAsync({})
      setLocation(location.coords)
    })()
  }, [])

  return { location, errorMsg }
}

export const useWatchLocation = () => {
  const [location, setLocation] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)
  const [watching, setWatching] = useState(false)

  const startWatching = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied")
        return
      }

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (newLocation) => {
          setLocation(newLocation.coords)
        },
      )

      setWatching(true)
      return subscription
    } catch (error) {
      setErrorMsg(error.message)
    }
  }

  const stopWatching = (subscription) => {
    if (subscription) {
      subscription.remove()
      setWatching(false)
    }
  }

  return { location, errorMsg, watching, startWatching, stopWatching }
}
