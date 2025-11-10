"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"

export const TripStopsForm = ({ stops, onAddStop, onRemoveStop, onReorderStops }) => {
  const [newStopName, setNewStopName] = useState("")
  const [newStopDuration, setNewStopDuration] = useState("60")

  const handleAddStop = () => {
    if (!newStopName.trim()) {
      Alert.alert("Error", "Please enter a stop name")
      return
    }

    onAddStop({
      location_name: newStopName,
      estimated_duration: Number.parseInt(newStopDuration) || 60,
      latitude: null,
      longitude: null,
    })

    setNewStopName("")
    setNewStopDuration("60")
  }

  return (
    <View>
      {/* Add New Stop */}
      <View className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
        <Text className="text-xs font-semibold text-gray-600 mb-3">ADD NEW STOP</Text>
        <TextInput
          className="bg-white border border-gray-300 rounded-lg px-3 py-2 mb-3"
          placeholder="Stop name (e.g., Eiffel Tower)"
          value={newStopName}
          onChangeText={setNewStopName}
        />
        <View className="flex-row gap-2 mb-3">
          <TextInput
            className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2"
            placeholder="Duration (min)"
            value={newStopDuration}
            onChangeText={setNewStopDuration}
            keyboardType="number-pad"
          />
          <TouchableOpacity className="bg-accent rounded-lg px-4 items-center justify-center" onPress={handleAddStop}>
            <Ionicons name="add" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stops List */}
      <View>
        {stops.length > 0 ? (
          stops.map((stop, index) => (
            <View
              key={index}
              className="bg-white border border-gray-200 rounded-lg p-4 mb-3 flex-row items-center justify-between"
            >
              <View className="flex-row items-center gap-3 flex-1">
                <View className="w-10 h-10 bg-primary rounded-full items-center justify-center">
                  <Text className="text-white font-bold text-lg">{index + 1}</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-800">{stop.location_name}</Text>
                  <Text className="text-xs text-gray-600">{stop.estimated_duration} min</Text>
                </View>
              </View>
              <TouchableOpacity className="p-2" onPress={() => onRemoveStop(index)}>
                <Ionicons name="trash" size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View className="bg-gray-50 rounded-lg p-8 items-center border border-dashed border-gray-300">
            <Ionicons name="location-outline" size={32} color="#d1d5db" />
            <Text className="text-gray-600 mt-2 text-center">Add stops to build your itinerary</Text>
          </View>
        )}
      </View>
    </View>
  )
}
