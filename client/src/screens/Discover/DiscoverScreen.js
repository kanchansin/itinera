"use client"

import { useState, useEffect } from "react"
import { View, Text, SafeAreaView, ScrollView, TextInput, TouchableOpacity, RefreshControl } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import api from "../../utils/api"
import { LoadingSpinner } from "../../components/LoadingSpinner"
import { DestinationCard } from "./DestinationCard"
import { DiscoverFilters } from "./DiscoverFilters"

const DiscoverScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [destinations, setDestinations] = useState([])
  const [filteredDestinations, setFilteredDestinations] = useState([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [userLocation, setUserLocation] = useState(null)

  useEffect(() => {
    loadDestinations()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [destinations, searchQuery, selectedCategory])

  const loadDestinations = async () => {
    setLoading(true)
    try {
      const response = await api.get("/destinations", {
        params: { limit: 50 },
      })
      setDestinations(response.data)
    } catch (err) {
      console.log("Error loading destinations:", err)
    } finally {
      setLoading(false)
    }
  }

  const searchDestinations = async (query) => {
    if (!query) {
      setFilteredDestinations(destinations)
      return
    }

    setLoading(true)
    try {
      const response = await api.get("/destinations/search", {
        params: { query },
      })
      const combined = [...response.data.database, ...response.data.external.slice(0, 5)]
      setFilteredDestinations(combined)
    } catch (err) {
      console.log("Error searching destinations:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
    searchDestinations(query)
  }

  const applyFilters = () => {
    let filtered = destinations

    if (searchQuery) {
      filtered = filtered.filter((dest) => dest.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    if (selectedCategory) {
      switch (selectedCategory) {
        case "top-rated":
          filtered = filtered.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0))
          break
        case "hidden-gems":
          filtered = filtered.filter((dest) => (dest.total_reviews || 0) < 20)
          break
        case "nearby":
          // In production, sort by distance from user location
          break
        default:
          break
      }
    }

    setFilteredDestinations(filtered)
  }

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      await loadDestinations()
    } finally {
      setRefreshing(false)
    }
  }

  const handleDestinationPress = (destination) => {
    navigation.navigate("DestinationDetail", { destinationId: destination.id })
  }

  if (loading && destinations.length === 0) {
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
              placeholder="Search destinations..."
              value={searchQuery}
              onChangeText={handleSearch}
              placeholderTextColor="#9ca3af"
            />
            {searchQuery && (
              <TouchableOpacity onPress={() => handleSearch("")}>
                <Ionicons name="close-circle" size={20} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Category Filters */}
        <DiscoverFilters selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />

        {/* Destinations Grid */}
        <View className="px-4 py-4">
          {filteredDestinations.length > 0 ? (
            <View>
              <Text className="text-sm text-gray-600 mb-4">{filteredDestinations.length} destinations</Text>
              {filteredDestinations.map((destination) => (
                <DestinationCard
                  key={destination.id}
                  destination={destination}
                  onPress={() => handleDestinationPress(destination)}
                />
              ))}
            </View>
          ) : (
            <View className="items-center justify-center py-12">
              <Ionicons name="earth" size={64} color="#d1d5db" />
              <Text className="text-gray-600 mt-4">No destinations found</Text>
              <Text className="text-gray-500 text-sm mt-2">Try adjusting your search</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default DiscoverScreen
