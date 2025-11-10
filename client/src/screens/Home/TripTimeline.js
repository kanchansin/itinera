import { View, Text } from "react-native"
import { Ionicons } from "@expo/vector-icons"

export const TripTimeline = ({ stops = [] }) => {
  if (!stops || stops.length === 0) {
    return <Text className="text-gray-600 text-center py-4">No stops planned for this trip</Text>
  }

  return (
    <View>
      {stops.map((stop, index) => (
        <View key={stop.id || index} className="mb-6">
          {/* Timeline dot and line */}
          <View className="flex-row">
            <View className="items-center mr-4">
              <View className="w-12 h-12 bg-primary rounded-full items-center justify-center">
                <Ionicons name="location" size={24} color="#ffffff" />
              </View>
              {index < stops.length - 1 && <View className="w-1 bg-primary" style={{ height: 60 }} />}
            </View>

            {/* Stop details */}
            <View className="flex-1 pt-2 pb-4">
              <Text className="font-bold text-gray-800 text-base">{stop.location_name}</Text>
              <View className="flex-row items-center gap-1 mt-2">
                <Ionicons name="time" size={14} color="#6b7280" />
                <Text className="text-sm text-gray-600">
                  {stop.estimated_duration ? `${stop.estimated_duration} min` : "N/A"}
                </Text>
              </View>
              {stop.arrival_time && (
                <Text className="text-xs text-gray-500 mt-1">
                  Arrive: {new Date(stop.arrival_time).toLocaleTimeString()}
                </Text>
              )}
            </View>
          </View>
        </View>
      ))}
    </View>
  )
}
