"use client"

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Modal } from "react-native"
import { Ionicons } from "@expo/vector-icons"

export const AIRecommendations = ({ destination, onClose, onSelectStops, isLoading }) => {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedStops, setSelectedStops] = useState(new Set())

  useEffect(() => {
    loadRecommendations()
  }, [])

  const loadRecommendations = async () => {
    setLoading(true)
    try {
      // Mock AI recommendations - in production, call Gemini API
      const mockRecommendations = [
        {
          id: 1,
          location_name: "Eiffel Tower",
          estimated_duration: 90,
          description: "Iconic landmark with panoramic views",
        },
        {
          id: 2,
          location_name: "Louvre Museum",
          estimated_duration: 180,
          description: "World-renowned art museum",
        },
        {
          id: 3,
          location_name: "Arc de Triomphe",
          estimated_duration: 60,
          description: "Historic monument with views",
        },
        {
          id: 4,
          location_name: "Notre-Dame Cathedral",
          estimated_duration: 75,
          description: "Gothic architecture masterpiece",
        },
        {
          id: 5,
          location_name: "Sacré-Cœur Basilica",
          estimated_duration: 60,
          description: "Beautiful basilica in Montmartre",
        },
      ]

      setRecommendations(mockRecommendations)
    } catch (error) {
      console.log("Error loading recommendations:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleStopSelection = (stopId) => {
    const newSelected = new Set(selectedStops)
    newSelected.has(stopId) ? newSelected.delete(stopId) : newSelected.add(stopId)
    setSelectedStops(newSelected)
  }

  const handleApplyRecommendations = () => {
    const selected = recommendations.filter((rec) => selectedStops.has(rec.id))
    if (selected.length > 0) {
      onSelectStops(selected)
    }
  }

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black bg-opacity-50">
        <View className="flex-1 bg-white rounded-t-3xl mt-20">
          {/* Header */}
          <View className="flex-row justify-between items-center px-4 py-4 border-b border-gray-200">
            <Text className="text-lg font-bold text-gray-800">AI Recommendations for {destination}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          {loading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#1e3a8a" />
              <Text className="text-gray-600 mt-4">Analyzing attractions...</Text>
            </View>
          ) : (
            <ScrollView className="flex-1 px-4 py-4">
              <Text className="text-sm text-gray-600 mb-4">Select attractions to add to your trip</Text>

              {recommendations.map((rec) => (
                <TouchableOpacity
                  key={rec.id}
                  className={`mb-3 rounded-lg p-4 border-2 flex-row items-start gap-3 ${
                    selectedStops.has(rec.id) ? "bg-blue-50 border-primary" : "bg-white border-gray-200"
                  }`}
                  onPress={() => toggleStopSelection(rec.id)}
                >
                  <View
                    className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                      selectedStops.has(rec.id) ? "bg-primary border-primary" : "border-gray-300"
                    }`}
                  >
                    {selectedStops.has(rec.id) && <Ionicons name="checkmark" size={14} color="#ffffff" />}
                  </View>

                  <View className="flex-1">
                    <Text className="font-semibold text-gray-800 mb-1">{rec.location_name}</Text>
                    <Text className="text-sm text-gray-600 mb-2">{rec.description}</Text>
                    <View className="flex-row items-center gap-2">
                      <Ionicons name="time" size={14} color="#9ca3af" />
                      <Text className="text-xs text-gray-600">{rec.estimated_duration} min</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}

              <View className="h-8" />
            </ScrollView>
          )}

          {/* Footer */}
          <View className="px-4 py-4 border-t border-gray-200 flex-row gap-3">
            <TouchableOpacity className="flex-1 bg-gray-200 rounded-lg py-3 items-center" onPress={onClose}>
              <Text className="text-gray-800 font-semibold">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 rounded-lg py-3 items-center ${selectedStops.size > 0 ? "bg-primary" : "bg-gray-300"}`}
              onPress={handleApplyRecommendations}
              disabled={selectedStops.size === 0}
            >
              <Text className="text-white font-semibold">
                Add {selectedStops.size > 0 ? selectedStops.size : ""} Stops
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}
