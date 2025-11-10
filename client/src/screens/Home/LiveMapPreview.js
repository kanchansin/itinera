import { View, Text, Dimensions } from "react-native"

export const LiveMapPreview = ({ trip, userLocation, eta }) => {
  const screenWidth = Dimensions.get("window").width
  const mapHeight = 200

  return (
    <View className="bg-blue-100 rounded-lg overflow-hidden" style={{ height: mapHeight }}>
      <View className="flex-1 items-center justify-center relative">
        {/* Map placeholder with gradient */}
        <View className="absolute inset-0 bg-gradient-to-b from-blue-200 to-blue-100" />

        {/* User location indicator */}
        {userLocation && (
          <View className="absolute items-center">
            <View className="w-8 h-8 bg-accent rounded-full border-4 border-white shadow-lg" />
            <View className="w-16 h-16 border-2 border-accent rounded-full opacity-30" />
          </View>
        )}

        {/* Map info overlay */}
        <View className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-30 px-3 py-2 flex-row justify-between">
          <View>
            <Text className="text-white text-xs font-semibold">📍 {trip.destination}</Text>
          </View>
          {eta && <Text className="text-white text-xs font-semibold">ETA: {eta.duration} min</Text>}
        </View>
      </View>
    </View>
  )
}
