"use client"

import { useState } from "react"
import { View, ScrollView, TextInput, TouchableOpacity, Text, ActivityIndicator, Alert, StyleSheet } from "react-native"
import { useAuth } from "../../hooks/useAuth"

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  form: {
    padding: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F1F1F",
    marginTop: 15,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#1F1F1F",
  },
  disabledInput: {
    backgroundColor: "#F5F5F5",
    color: "#BDBDBD",
  },
  textArea: {
    textAlignVertical: "top",
    paddingTop: 12,
  },
  saveButton: {
    backgroundColor: "#0084FF",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 25,
    marginBottom: 20,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
})

const EditProfileScreen = ({ navigation }) => {
  const { user, updateProfile } = useAuth()
  const [formData, setFormData] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    phone: user?.phone || "",
  })
  const [loading, setLoading] = useState(false)
  const [changed, setChanged] = useState(false)

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setChanged(true)
  }

  const handleSaveProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      Alert.alert("Success", "Profile updated successfully!")
      setChanged(false)
      navigation.goBack()
    } catch (error) {
      Alert.alert("Error", "Failed to update profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your full name"
          value={formData.name}
          onChangeText={(value) => handleInputChange("name", value)}
          editable={!loading}
        />

        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Tell us about yourself"
          value={formData.bio}
          onChangeText={(value) => handleInputChange("bio", value)}
          multiline
          numberOfLines={4}
          editable={!loading}
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your phone number"
          value={formData.phone}
          onChangeText={(value) => handleInputChange("phone", value)}
          keyboardType="phone-pad"
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.saveButton, { opacity: changed && !loading ? 1 : 0.5 }]}
          onPress={handleSaveProfile}
          disabled={!changed || loading}
        >
          {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

export default EditProfileScreen
