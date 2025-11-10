import { View, Text, TouchableOpacity } from "react-native"

export const ErrorMessage = ({ message, onRetry }) => {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <Text className="text-lg font-semibold text-gray-800 mb-4">Oops!</Text>
      <Text className="text-gray-600 text-center mb-6">{message}</Text>
      {onRetry && (
        <TouchableOpacity className="bg-accent rounded-lg px-6 py-3" onPress={onRetry}>
          <Text className="text-white font-semibold">Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}
