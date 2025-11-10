"use client"

import { useState, useEffect } from "react"
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, RefreshControl } from "react-native"
import * as Location from "expo-location"
import { Ionicons } from "@expo/vector-icons"
import { useTrip } from "../../hooks/useTrip"
import { LoadingSpinner } from "../../components/LoadingSpinner"
import { TripTimeline } from "./TripTimeline"
import { LiveMapPreview } from "./LiveMapPreview"

const HomeScreen = ({ navigation }) => {
  const { trips, loading, error, fetchTrips } = useTrip()
  const [refreshing, setRefreshing] = useState(false)
  const [userLocation, setUserLocation] = useState(null)
  const [activeTrip, setActiveTrip] = useState(null)
  const [eta, setEta] = useState(null)

  useEffect(() => {
    requestLocationPermission()
    fetchTrips()
  }, [])

  useEffect(() => {
    if (activeTrip && userLocation) {
      startLiveTracking()
    }
  }, [activeTrip])

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({})
        setUserLocation(location.coords)
      }
    } catch (err) {
      console.log("Location permission error:", err)
    }
  }

  const startLiveTracking = async () => {
    try {
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (location) => {
          setUserLocation(location.coords)
          // Update ETA based on new location
          calculateETA(location.coords, activeTrip)
        },
      )

      return () => subscription.remove()
    } catch (err) {
      console.log("Tracking error:", err)
    }
  }

  const calculateETA = (currentLocation, trip) => {
    if (!trip || !trip.stops || trip.stops.length === 0) return

    // Find next stop
    const nextStop = trip.stops[0] // Simplified - in production, find closest upcoming stop

    // Mock ETA calculation (in production, use Google Maps API)
    const mockETA = {
      distance: Math.random() * 50,
      duration: Math.floor(Math.random() * 120) + 5,
      nextStop: nextStop.location_name,
    }

    setEta(mockETA)
  }

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      await fetchTrips()
    } finally {
      setRefreshing(false)
    }
  }

  const handleTripSelect = (trip) => {
    setActiveTrip(trip)
  }

  const handleRecalculateRoute = async () => {
    if (activeTrip && userLocation) {
      calculateETA(userLocation, activeTrip)
    }
  }

  if (loading && trips.length === 0) {
    return <LoadingSpinner />
  }

  const currentTrip = activeTrip || (trips.length > 0 ? trips[0] : null)

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {currentTrip ? (
          <View>
            {/* Active Trip Header */}
            <View className="bg-primary px-4 py-6">
              <Text className="text-white text-lg font-semibold mb-2">{currentTrip.title}</Text>
              <Text className="text-blue-100 text-sm mb-4">{currentTrip.destination}</Text>

              {/* Live Map Preview */}
              <LiveMapPreview trip={currentTrip} userLocation={userLocation} eta={eta} />
            </View>

            {/* ETA Information */}
            {eta && (
              <View className="bg-blue-50 border-l-4 border-primary px-4 py-4 mx-4 mt-4 rounded">
                <Text className="text-gray-700 font-semibold mb-2">Arriving at {eta.nextStop}</Text>
                <View className="flex-row justify-between">
                  <View>
                    <Text className="text-xs text-gray-600">Distance</Text>
                    <Text className="text-lg font-bold text-primary">{eta.distance.toFixed(1)} km</Text>
                  </View>
                  <View>
                    <Text className="text-xs text-gray-600">ETA</Text>
                    <Text className="text-lg font-bold text-primary">{eta.duration} min</Text>
                  </View>
                </View>

                <TouchableOpacity
                  className="bg-primary rounded-lg py-2 mt-3 items-center"
                  onPress={handleRecalculateRoute}
                >
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="refresh" size={16} color="#ffffff" />
                    <Text className="text-white font-semibold text-sm">Recalculate Route</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {/* Trip Timeline */}
            <View className="px-4 py-6">
              <Text className="text-lg font-bold text-gray-800 mb-4">Trip Timeline</Text>
              <TripTimeline stops={currentTrip.stops} />
            </View>

            {/* Trip Actions */}
            <View className="px-4 py-4 border-t border-gray-200">
              <TouchableOpacity
                className="flex-row items-center justify-center gap-2 bg-accent rounded-lg py-3"
                onPress={() => navigation.navigate("CreateTrip", { editTrip: currentTrip })}
              >
                <Ionicons name="pencil" size={18} color="#ffffff" />
                <Text className="text-white font-semibold">Edit Trip</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View className="flex-1 items-center justify-center py-20">
            <Ionicons name="map" size={64} color="#d1d5db" />
            <Text className="text-gray-600 mt-4 text-center px-6">No active trips yet</Text>
            <TouchableOpacity
              className="bg-primary rounded-lg px-6 py-3 mt-6"
              onPress={() => navigation.navigate("CreateTrip")}
            >
              <Text className="text-white font-semibold">Create Your First Trip</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Other Trips List */}
        {trips.length > 1 && (
          <View className="px-4 py-6 border-t border-gray-200">
            <Text className="text-lg font-bold text-gray-800 mb-4">Other Trips</Text>
            {trips.slice(1).map((trip) => (
              <TouchableOpacity
                key={trip.id}
                className="bg-gray-50 rounded-lg p-4 mb-3 border border-gray-200"
                onPress={() => handleTripSelect(trip)}
              >
                <Text className="font-semibold text-gray-800">{trip.title}</Text>
                <Text className="text-sm text-gray-600 mt-1">{trip.destination}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

export default HomeScreen
