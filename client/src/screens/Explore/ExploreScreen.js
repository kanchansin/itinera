"use client"

import { useState, useEffect } from "react"
import { View, Text, SafeAreaView, ScrollView, RefreshControl, TouchableOpacity, TextInput } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTrip } from "../../hooks/useTrip"
import { LoadingSpinner } from "../../components/LoadingSpinner"
import { TripCard } from "../../components/TripCard"
import { ExploreFilters } from "./ExploreFilters"

const ExploreScreen = ({ navigation }) => {
  const { loading, error, fetchPublicTrips, likeTrip, saveTrip } = useTrip()
  const [trips, setTrips] = useState([])
  const [filteredTrips, setFilteredTrips] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState(null)
  const [likedTrips, setLikedTrips] = useState(new Set())
  const [savedTrips, setSavedTrips] = useState(new Set())

  useEffect(() => {
    loadPublicTrips()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [trips, searchQuery, selectedFilter])

  const loadPublicTrips = async () => {
    try {
      const data = await fetchPublicTrips()
      setTrips(data)
    } catch (err) {
      console.log("Error loading public trips:", err)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      await loadPublicTrips()
    } finally {
      setRefreshing(false)
    }
  }

  const applyFilters = () => {
    let filtered = trips

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (trip) =>
          trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          trip.destination.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Category filter
    if (selectedFilter) {
      // Filter based on selected criteria (duration, type, etc.)
      switch (selectedFilter) {
        case "trending":
          filtered = filtered.sort((a, b) => b.likes_count - a.likes_count)
          break
        case "recent":
          filtered = filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          break
        case "popular":
          filtered = filtered.filter((trip) => trip.likes_count > 5)
          break
        default:
          break
      }
    }

    setFilteredTrips(filtered)
  }

  const handleLikeTrip = async (tripId) => {
    try {
      await likeTrip(tripId)
      setLikedTrips((prev) => {
        const newSet = new Set(prev)
        newSet.has(tripId) ? newSet.delete(tripId) : newSet.add(tripId)
        return newSet
      })
    } catch (err) {
      console.log("Error liking trip:", err)
    }
  }

  const handleSaveTrip = async (tripId) => {
    try {
      await saveTrip(tripId)
      setSavedTrips((prev) => {
        const newSet = new Set(prev)
        newSet.has(tripId) ? newSet.delete(tripId) : newSet.add(tripId)
        return newSet
      })
    } catch (err) {
      console.log("Error saving trip:", err)
    }
  }

  const handleTripPress = (trip) => {
    navigation.navigate("TripDetail", { tripId: trip.id })
  }

  if (loading && trips.length === 0) {
    return <LoadingSpinner />
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {/* Search Bar */}
        <View className="px-4 py-4 bg-gray-50 border-b border-gray-200">
          <View className="flex-row items-center bg-white border border-gray-300 rounded-lg px-4 py-3">
            <Ionicons name="search" size={20} color="#9ca3af" />
            <TextInput
              className="flex-1 ml-2 text-base"
              placeholder="Search trips..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9ca3af"
            />
            {searchQuery && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filters */}
        <ExploreFilters selectedFilter={selectedFilter} onFilterChange={setSelectedFilter} />

        {/* Trips Feed */}
        <View className="px-4 py-4">
          {filteredTrips.length > 0 ? (
            <View>
              <Text className="text-sm text-gray-600 mb-4">{filteredTrips.length} trips found</Text>
              {filteredTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={{
                    ...trip,
                    liked: likedTrips.has(trip.id),
                    saved: savedTrips.has(trip.id),
                  }}
                  onPress={() => handleTripPress(trip)}
                  onLike={handleLikeTrip}
                  onSave={handleSaveTrip}
                />
              ))}
            </View>
          ) : (
            <View className="items-center justify-center py-12">
              <Ionicons name="compass" size={64} color="#d1d5db" />
              <Text className="text-gray-600 mt-4">No trips found</Text>
              <Text className="text-gray-500 text-sm mt-2">
                {searchQuery ? "Try a different search" : "Check back soon"}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default ExploreScreen
