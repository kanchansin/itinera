import { View, ActivityIndicator } from "react-native"

export const LoadingSpinner = ({ color = "#1e3a8a", size = "large" }) => {
  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size={size} color={color} />
    </View>
  )
}
