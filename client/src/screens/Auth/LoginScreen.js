import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator, ImageBackground } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../hooks/useAuth"
import { LinearGradient } from "expo-linear-gradient"

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { signIn } = useAuth()

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    setLoading(true)
    try {
      await signIn(email, password)
    } catch (error) {
      Alert.alert("Login Failed", error.response?.data?.error || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-primary-500 to-ocean-500">
      <View className="flex-1 px-6 justify-center">
        <View className="items-center mb-12">
          <View className="bg-white/20 p-6 rounded-full mb-6">
            <Ionicons name="airplane" size={64} color="#ffffff" />
          </View>
          <Text className="text-5xl font-bold text-white mb-2">Itenera</Text>
          <Text className="text-white/90 text-lg">Your Journey, Perfected</Text>
        </View>

        <View className="bg-white/95 rounded-3xl p-6 shadow-2xl">
          <View className="mb-4">
            <Text className="text-gray-700 font-semibold mb-2 ml-1">Email</Text>
            <View className="flex-row items-center bg-gray-50 rounded-2xl px-4 py-4 border border-gray-200">
              <Ionicons name="mail-outline" size={20} color="#6b7280" />
              <TextInput
                className="flex-1 ml-3 text-base text-gray-900"
                placeholder="your@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-gray-700 font-semibold mb-2 ml-1">Password</Text>
            <View className="flex-row items-center bg-gray-50 rounded-2xl px-4 py-4 border border-gray-200">
              <Ionicons name="lock-closed-outline" size={20} color="#6b7280" />
              <TextInput
                className="flex-1 ml-3 text-base text-gray-900"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!loading}
                placeholderTextColor="#9ca3af"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            className="bg-gradient-to-r from-primary-600 to-ocean-500 rounded-2xl py-4 items-center mb-4 shadow-lg"
            style={{
              shadowColor: '#3b82f6',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <View className="flex-row items-center">
                <Text className="text-white font-bold text-lg mr-2">Sign In</Text>
                <Ionicons name="arrow-forward" size={20} color="#ffffff" />
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Register")} disabled={loading}>
            <Text className="text-center text-gray-600">
              Don't have an account?{" "}
              <Text className="text-primary-600 font-bold">Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity className="mt-8 items-center">
          <Text className="text-white/80 text-sm">Forgot Password?</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default LoginScreen