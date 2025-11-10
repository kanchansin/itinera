"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator } from "react-native"
import { useAuth } from "../../hooks/useAuth"

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
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
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center px-6">
        <Text className="text-4xl font-bold text-primary mb-2">Itenera</Text>
        <Text className="text-gray-500 mb-12">AI-Powered Travel Planner</Text>

        <TextInput
          className="bg-neutral border border-gray-300 rounded-lg px-4 py-3 mb-4"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          editable={!loading}
        />
        <TextInput
          className="bg-neutral border border-gray-300 rounded-lg px-4 py-3 mb-6"
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />

        <TouchableOpacity
          className="bg-primary rounded-lg py-3 items-center mb-4 opacity-90"
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white font-bold text-lg">Login</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Register")} disabled={loading}>
          <Text className="text-center text-gray-600">
            Don't have an account? <Text className="text-accent font-bold">Register</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default LoginScreen
