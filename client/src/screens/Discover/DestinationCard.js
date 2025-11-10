import { View, Text, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"

export const DestinationCard = ({ destination, onPress }) => {
  const renderStars = (rating) => {
    const stars = []
    for (let i = 0; i < 5; i++) {
      stars.push(<Ionicons key={i} name={i < Math.floor(rating) ? "star" : "star-outline"} size={14} color="#fbbf24" />)
    }
    return stars
  }

  return (
    <TouchableOpacity
      className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-4 shadow-sm"
      onPress={onPress}
    >
      <View className="p-4">
        {/* Header */}
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-800 mb-1">{destination.name}</Text>
            {destination.average_rating && (
              <View className="flex-row items-center gap-1 mb-2">
                <View className="flex-row">{renderStars(destination.average_rating)}</View>
                <Text className="text-xs text-gray-600 ml-1">
                  {destination.average_rating.toFixed(1)} ({destination.total_reviews || 0})
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity className="p-2">
            <Ionicons name="bookmark-outline" size={20} color="#3b82f6" />
          </TouchableOpacity>
        </View>

        {/* Description */}
        {destination.description && (
          <Text className="text-sm text-gray-600 mb-3 line-clamp-2">{destination.description}</Text>
        )}

        {/* Stats */}
        <View className="flex-row gap-4 border-t border-gray-200 pt-3">
          {destination.estimated_visit_duration && (
            <View className="flex-row items-center gap-1">
              <Ionicons name="time" size={14} color="#6b7280" />
              <Text className="text-xs text-gray-600">{destination.estimated_visit_duration} min</Text>
            </View>
          )}
          <TouchableOpacity className="flex-row items-center gap-1 ml-auto">
            <Ionicons name="navigate" size={14} color="#3b82f6" />
            <Text className="text-xs text-accent font-semibold">Directions</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  )
}
