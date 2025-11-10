"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator } from "react-native"
import { useAuth } from "../../hooks/useAuth"

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    setLoading(true)
    try {
      await signUp(name, email, password)
    } catch (error) {
      Alert.alert("Registration Failed", error.response?.data?.error || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center px-6">
        <Text className="text-3xl font-bold text-primary mb-2">Create Account</Text>
        <Text className="text-gray-500 mb-12">Start your travel journey</Text>

        <TextInput
          className="bg-neutral border border-gray-300 rounded-lg px-4 py-3 mb-4"
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
          editable={!loading}
        />
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
          className="bg-primary rounded-lg py-3 items-center mb-4"
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white font-bold text-lg">Register</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Login")} disabled={loading}>
          <Text className="text-center text-gray-600">
            Already have an account? <Text className="text-accent font-bold">Login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default RegisterScreen
