import { View, Text, TouchableOpacity, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"

export const TripCard = ({ trip, onPress, onLike, onSave }) => {
  return (
    <TouchableOpacity 
      className="bg-white rounded-3xl overflow-hidden mb-4 shadow-lg"
      style={{ elevation: 3 }}
      onPress={onPress}
    >
      {trip.image ? (
        <Image 
          source={{ uri: trip.image }} 
          className="w-full h-48"
        />
      ) : (
        <View className="w-full h-48 bg-gradient-to-br from-primary-400 to-ocean-400 items-center justify-center">
          <Ionicons name="airplane" size={64} color="rgba(255,255,255,0.6)" />
        </View>
      )}
      
      <View className="absolute top-3 right-3 flex-row gap-2">
        <TouchableOpacity 
          className="bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow-md"
          onPress={() => onLike?.(trip.id)}
        >
          <Ionicons 
            name={trip.liked ? "heart" : "heart-outline"} 
            size={20} 
            color={trip.liked ? "#ef4444" : "#6b7280"} 
          />
        </TouchableOpacity>
        <TouchableOpacity 
          className="bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow-md"
          onPress={() => onSave?.(trip.id)}
        >
          <Ionicons 
            name={trip.saved ? "bookmark" : "bookmark-outline"} 
            size={20} 
            color={trip.saved ? "#3b82f6" : "#6b7280"} 
          />
        </TouchableOpacity>
      </View>

      <View className="p-5">
        <Text className="text-xl font-bold text-gray-900 mb-2">{trip.title}</Text>
        <View className="flex-row items-center mb-4">
          <Ionicons name="location" size={16} color="#06b6d4" />
          <Text className="text-ocean-600 text-sm ml-1 font-medium">{trip.destination}</Text>
        </View>

        <View className="flex-row items-center justify-between pt-4 border-t border-gray-100">
          <View className="flex-row items-center">
            <View className="bg-primary-50 p-2 rounded-lg mr-3">
              <Ionicons name="time-outline" size={16} color="#3b82f6" />
            </View>
            <View>
              <Text className="text-gray-500 text-xs">Duration</Text>
              <Text className="text-gray-900 font-semibold">
                {trip.duration ? `${trip.duration}h` : "N/A"}
              </Text>
            </View>
          </View>

          {trip.likes_count > 0 && (
            <View className="flex-row items-center bg-red-50 px-3 py-2 rounded-full">
              <Ionicons name="heart" size={14} color="#ef4444" />
              <Text className="text-red-600 text-sm font-semibold ml-1">
                {trip.likes_count}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )
}