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

    const nextStop = trip.stops[0]

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
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {currentTrip ? (
          <View>
            <View className="bg-gradient-to-br from-primary-600 to-ocean-500 px-6 pt-6 pb-8 rounded-b-3xl">
              <View className="flex-row justify-between items-start mb-4">
                <View className="flex-1">
                  <Text className="text-white/80 text-sm mb-1">Current Journey</Text>
                  <Text className="text-white text-2xl font-bold">{currentTrip.title}</Text>
                  <View className="flex-row items-center mt-2">
                    <Ionicons name="location" size={16} color="#ffffff" />
                    <Text className="text-white/90 text-sm ml-1">{currentTrip.destination}</Text>
                  </View>
                </View>
                <TouchableOpacity className="bg-white/20 p-3 rounded-full">
                  <Ionicons name="notifications-outline" size={20} color="#ffffff" />
                </TouchableOpacity>
              </View>

              <LiveMapPreview trip={currentTrip} userLocation={userLocation} eta={eta} />
            </View>

            {eta && (
              <View className="mx-6 -mt-4 bg-white rounded-2xl p-5 shadow-lg" style={{ elevation: 4 }}>
                <Text className="text-gray-900 font-bold text-base mb-3">Next Stop: {eta.nextStop}</Text>
                <View className="flex-row justify-between mb-4">
                  <View className="flex-1 mr-2">
                    <Text className="text-gray-500 text-xs mb-1">Distance</Text>
                    <View className="flex-row items-center">
                      <Ionicons name="navigate" size={18} color="#3b82f6" />
                      <Text className="text-primary-600 font-bold text-xl ml-2">{eta.distance.toFixed(1)}</Text>
                      <Text className="text-gray-500 text-sm ml-1">km</Text>
                    </View>
                  </View>
                  <View className="flex-1 ml-2">
                    <Text className="text-gray-500 text-xs mb-1">ETA</Text>
                    <View className="flex-row items-center">
                      <Ionicons name="time" size={18} color="#06b6d4" />
                      <Text className="text-ocean-600 font-bold text-xl ml-2">{eta.duration}</Text>
                      <Text className="text-gray-500 text-sm ml-1">min</Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  className="bg-gradient-to-r from-primary-600 to-ocean-500 rounded-xl py-3 items-center"
                  onPress={handleRecalculateRoute}
                >
                  <View className="flex-row items-center">
                    <Ionicons name="refresh" size={16} color="#ffffff" />
                    <Text className="text-white font-semibold ml-2">Recalculate Route</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            <View className="px-6 py-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-gray-900 text-xl font-bold">Trip Timeline</Text>
                <View className="bg-primary-50 px-3 py-1 rounded-full">
                  <Text className="text-primary-600 text-xs font-semibold">
                    {currentTrip.stops?.length || 0} stops
                  </Text>
                </View>
              </View>
              <TripTimeline stops={currentTrip.stops} />
            </View>

            <View className="px-6 pb-6">
              <TouchableOpacity
                className="bg-white border border-primary-200 rounded-2xl py-4 items-center"
                onPress={() => navigation.navigate("CreateTrip", { editTrip: currentTrip })}
              >
                <View className="flex-row items-center">
                  <Ionicons name="pencil" size={18} color="#3b82f6" />
                  <Text className="text-primary-600 font-semibold ml-2">Edit Trip</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View className="flex-1 items-center justify-center px-6 py-20">
            <View className="bg-gradient-to-br from-primary-100 to-ocean-100 p-8 rounded-full mb-6">
              <Ionicons name="map-outline" size={64} color="#3b82f6" />
            </View>
            <Text className="text-gray-900 text-2xl font-bold mb-2">No Active Trips</Text>
            <Text className="text-gray-500 text-center mb-8">
              Start planning your next adventure and create unforgettable memories
            </Text>
            <TouchableOpacity
              className="bg-gradient-to-r from-primary-600 to-ocean-500 rounded-2xl px-8 py-4 shadow-lg"
              style={{ elevation: 4 }}
              onPress={() => navigation.navigate("CreateTrip")}
            >
              <View className="flex-row items-center">
                <Ionicons name="add-circle" size={20} color="#ffffff" />
                <Text className="text-white font-bold text-base ml-2">Plan Your First Trip</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {trips.length > 1 && (
          <View className="px-6 pb-6">
            <Text className="text-gray-900 text-xl font-bold mb-4">Other Trips</Text>
            {trips.slice(1).map((trip) => (
              <TouchableOpacity
                key={trip.id}
                className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
                style={{ elevation: 2 }}
                onPress={() => handleTripSelect(trip)}
              >
                <View className="flex-row items-center">
                  <View className="bg-primary-50 p-3 rounded-xl mr-3">
                    <Ionicons name="location" size={24} color="#3b82f6" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-bold text-gray-900 text-base">{trip.title}</Text>
                    <Text className="text-gray-500 text-sm mt-1">{trip.destination}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

export default HomeScreen