"use client"

import { useState, useEffect } from "react"
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
  StyleSheet,
} from "react-native"
import { useAuth } from "../../hooks/useAuth"

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  profileHeader: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  profileInfo: {
    alignItems: "center",
  },
  nameText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F1F1F",
  },
  emailText: {
    fontSize: 14,
    color: "#757575",
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 15,
    backgroundColor: "#FFFFFF",
    marginTop: 10,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0084FF",
  },
  statLabel: {
    fontSize: 12,
    color: "#757575",
    marginTop: 4,
  },
  sectionContainer: {
    backgroundColor: "#FFFFFF",
    marginTop: 10,
    padding: 15,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F1F1F",
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  menuText: {
    fontSize: 15,
    color: "#1F1F1F",
    fontWeight: "500",
  },
  menuArrow: {
    fontSize: 20,
    color: "#BDBDBD",
  },
  logoutItem: {
    borderBottomWidth: 0,
    marginTop: 10,
    backgroundColor: "#FFEBEE",
    borderRadius: 8,
  },
  logoutText: {
    fontSize: 15,
    color: "#D32F2F",
    fontWeight: "600",
  },
})

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth()
  const [profileData, setProfileData] = useState(null)
  const [tripStats, setTripStats] = useState({
    totalTrips: 0,
    completedTrips: 0,
    totalDistance: 0,
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadProfileData()
  }, [user?.id])

  const loadProfileData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/profile`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      })
      const data = await response.json()
      setProfileData(data)

      // Calculate trip statistics
      if (data.trips && Array.isArray(data.trips)) {
        const stats = data.trips.reduce(
          (acc, trip) => ({
            totalTrips: acc.totalTrips + 1,
            completedTrips: acc.completedTrips + (trip.status === "completed" ? 1 : 0),
            totalDistance: acc.totalDistance + (trip.totalDistance || 0),
          }),
          { totalTrips: 0, completedTrips: 0, totalDistance: 0 },
        )
        setTripStats(stats)
      }
    } catch (error) {
      console.log("[v0] Profile load error:", error)
      Alert.alert("Error", "Failed to load profile data")
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadProfileData()
    setRefreshing(false)
  }

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", onPress: () => {} },
      {
        text: "Logout",
        onPress: async () => {
          await logout()
        },
      },
    ])
  }

  if (loading && !profileData) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0084FF" />
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <Image
          source={{ uri: profileData?.profile_picture || "https://via.placeholder.com/100" }}
          style={styles.profileImage}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.nameText}>{profileData?.name || "User"}</Text>
          <Text style={styles.emailText}>{profileData?.email}</Text>
        </View>
      </View>

      {/* Trip Statistics */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{tripStats.totalTrips}</Text>
          <Text style={styles.statLabel}>Total Trips</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{tripStats.completedTrips}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{Math.round(tripStats.totalDistance)}</Text>
          <Text style={styles.statLabel}>km</Text>
        </View>
      </View>

      {/* Settings Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Settings</Text>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("EditProfile")}>
          <Text style={styles.menuText}>Edit Profile</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("TripHistory")}>
          <Text style={styles.menuText}>Trip History</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

export default ProfileScreen
