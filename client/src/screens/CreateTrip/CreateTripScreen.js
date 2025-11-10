"use client"

import { useState } from "react"
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import DateTimePicker from "@react-native-community/datetimepicker"
import { useTrip } from "../../hooks/useTrip"
import { TripStopsForm } from "./TripStopsForm"
import { AIRecommendations } from "./AIRecommendations"

const CreateTripScreen = ({ navigation, route }) => {
  const { createTrip, loading } = useTrip()
  const editTrip = route?.params?.editTrip

  const [title, setTitle] = useState(editTrip?.title || "")
  const [destination, setDestination] = useState(editTrip?.destination || "")
  const [startLocation, setStartLocation] = useState(editTrip?.start_location || "")
  const [startTime, setStartTime] = useState(new Date(editTrip?.start_time || Date.now()))
  const [transport, setTransport] = useState(editTrip?.transport || "driving")
  const [stops, setStops] = useState(editTrip?.stops || [])
  const [isPublic, setIsPublic] = useState(editTrip?.is_public || false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showAIRecommendations, setShowAIRecommendations] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)

  const TRANSPORT_MODES = [
    { id: "driving", label: "🚗 Driving", value: "driving" },
    { id: "walking", label: "🚶 Walking", value: "walking" },
    { id: "transit", label: "🚌 Transit", value: "transit" },
    { id: "cycling", label: "🚴 Cycling", value: "cycling" },
  ]

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false)
    if (selectedDate) {
      setStartTime(selectedDate)
    }
  }

  const handleAddStop = (stop) => {
    setStops([...stops, stop])
  }

  const handleRemoveStop = (index) => {
    setStops(stops.filter((_, i) => i !== index))
  }

  const handleReorderStops = (fromIndex, toIndex) => {
    const newStops = [...stops]
    const [removed] = newStops.splice(fromIndex, 1)
    newStops.splice(toIndex, 0, removed)
    setStops(newStops)
  }

  const handleGetAIRecommendations = async () => {
    if (!destination) {
      Alert.alert("Error", "Please enter a destination first")
      return
    }

    setAiLoading(true)
    setShowAIRecommendations(true)
    // AI recommendations would be fetched from backend
    setTimeout(() => setAiLoading(false), 2000)
  }

  const handleCreateTrip = async () => {
    if (!title || !destination || !startLocation || stops.length === 0) {
      Alert.alert("Error", "Please fill in all required fields and add at least one stop")
      return
    }

    try {
      const endTime = new Date(startTime)
      endTime.setHours(endTime.getHours() + 8) // Default 8-hour trip

      await createTrip({
        title,
        destination,
        startLocation,
        startTime,
        endTime,
        transport,
        stops: stops.map((stop, index) => ({
          ...stop,
          order_index: index,
        })),
        isPublic,
      })

      Alert.alert("Success", "Trip created successfully!", [
        {
          text: "View Trip",
          onPress: () => navigation.navigate("Home"),
        },
      ])
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to create trip")
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={true}>
        {/* Header */}
        <View className="px-4 py-6 bg-gradient-to-b from-primary to-blue-600">
          <Text className="text-white text-2xl font-bold">{editTrip ? "Edit Trip" : "Create New Trip"}</Text>
          <Text className="text-blue-100 mt-1">Plan your perfect itinerary with AI assistance</Text>
        </View>

        {/* Form */}
        <View className="px-4 py-6">
          {/* Trip Title */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Trip Title *</Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-lg px-4 py-3"
              placeholder="e.g., Summer Vacation to Paris"
              value={title}
              onChangeText={setTitle}
              editable={!loading}
            />
          </View>

          {/* Destination */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Destination *</Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-lg px-4 py-3"
              placeholder="e.g., Paris, France"
              value={destination}
              onChangeText={setDestination}
              editable={!loading}
            />
          </View>

          {/* Start Location */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Starting From *</Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-lg px-4 py-3"
              placeholder="e.g., New York, USA"
              value={startLocation}
              onChangeText={setStartLocation}
              editable={!loading}
            />
          </View>

          {/* Start Time */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Start Time *</Text>
            <TouchableOpacity
              className="bg-white border border-gray-300 rounded-lg px-4 py-3 flex-row items-center justify-between"
              onPress={() => setShowDatePicker(true)}
            >
              <Text className="text-base text-gray-700">{startTime.toLocaleString()}</Text>
              <Ionicons name="calendar" size={20} color="#1e3a8a" />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker value={startTime} mode="datetime" display="default" onChange={handleDateChange} />
            )}
          </View>

          {/* Transport Mode */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-3">Transport Mode</Text>
            <View className="flex-row flex-wrap gap-2">
              {TRANSPORT_MODES.map((mode) => (
                <TouchableOpacity
                  key={mode.id}
                  className={`px-4 py-2 rounded-full border ${
                    transport === mode.value ? "bg-primary border-primary" : "bg-white border-gray-300"
                  }`}
                  onPress={() => setTransport(mode.value)}
                >
                  <Text className={transport === mode.value ? "text-white font-semibold" : "text-gray-700"}>
                    {mode.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Trip Stops */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-sm font-semibold text-gray-700">Trip Stops *</Text>
              <TouchableOpacity
                className="bg-accent rounded-full px-3 py-1"
                onPress={() => setShowAIRecommendations(true)}
              >
                <View className="flex-row items-center gap-1">
                  <Ionicons name="sparkles" size={14} color="#ffffff" />
                  <Text className="text-white text-xs font-semibold">AI Suggest</Text>
                </View>
              </TouchableOpacity>
            </View>

            <TripStopsForm
              stops={stops}
              onAddStop={handleAddStop}
              onRemoveStop={handleRemoveStop}
              onReorderStops={handleReorderStops}
            />
          </View>

          {/* Public/Private Toggle */}
          <View className="mb-6 flex-row items-center justify-between bg-gray-50 rounded-lg p-4 border border-gray-200">
            <View className="flex-row items-center gap-3">
              <Ionicons name={isPublic ? "globe" : "lock-closed"} size={20} color="#1e3a8a" />
              <View>
                <Text className="font-semibold text-gray-800">{isPublic ? "Public Trip" : "Private Trip"}</Text>
                <Text className="text-xs text-gray-600">
                  {isPublic ? "Share with the Itenera community" : "Keep this trip private"}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              className={`w-12 h-7 rounded-full flex-row items-center p-1 ${isPublic ? "bg-accent" : "bg-gray-300"}`}
              onPress={() => setIsPublic(!isPublic)}
            >
              <View
                className={`w-5 h-5 rounded-full bg-white transform ${isPublic ? "translate-x-5" : "translate-x-0"}`}
              />
            </TouchableOpacity>
          </View>

          {/* Create Button */}
          <TouchableOpacity
            className="bg-primary rounded-lg py-4 items-center mb-6"
            onPress={handleCreateTrip}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <View className="flex-row items-center gap-2">
                <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                <Text className="text-white font-bold text-lg">{editTrip ? "Update Trip" : "Create Trip"}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* AI Recommendations Modal */}
      {showAIRecommendations && (
        <AIRecommendations
          destination={destination}
          onClose={() => setShowAIRecommendations(false)}
          onSelectStops={(recommendedStops) => {
            setStops(recommendedStops)
            setShowAIRecommendations(false)
          }}
          isLoading={aiLoading}
        />
      )}
    </SafeAreaView>
  )
}

export default CreateTripScreen
