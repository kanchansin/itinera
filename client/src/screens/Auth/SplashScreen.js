import { View, ActivityIndicator, SafeAreaView } from "react-native"

const SplashScreen = () => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#1e3a8a" />
      </View>
    </SafeAreaView>
  )
}

export default SplashScreen
