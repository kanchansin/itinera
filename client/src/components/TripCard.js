import { View, Text, TouchableOpacity, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"

export const TripCard = ({ trip, onPress, onLike, onSave }) => {
  return (
    <TouchableOpacity className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-4" onPress={onPress}>
      {trip.image && <Image source={{ uri: trip.image }} className="w-full h-40 bg-gray-200" />}
      <View className="p-4">
        <Text className="text-lg font-bold text-gray-800 mb-1">{trip.title}</Text>
        <Text className="text-sm text-gray-600 mb-3">{trip.destination}</Text>

        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center gap-2">
            <Ionicons name="time" size={16} color="#1e3a8a" />
            <Text className="text-xs text-gray-600">{trip.duration ? `${trip.duration}h` : "N/A"}</Text>
          </View>

          <View className="flex-row gap-3">
            <TouchableOpacity onPress={() => onLike?.(trip.id)}>
              <Ionicons name="heart" size={18} color={trip.liked ? "#ef4444" : "#d1d5db"} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onSave?.(trip.id)}>
              <Ionicons name="bookmark" size={18} color={trip.saved ? "#1e3a8a" : "#d1d5db"} />
            </TouchableOpacity>
          </View>
        </View>

        {trip.likes_count > 0 && <Text className="text-xs text-gray-500 mt-2">{trip.likes_count} likes</Text>}
      </View>
    </TouchableOpacity>
  )
}
