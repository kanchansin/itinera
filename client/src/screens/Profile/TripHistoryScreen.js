"use client"

import { useState, useEffect } from "react"
import { View, FlatList, TouchableOpacity, Text, ActivityIndicator, RefreshControl, StyleSheet } from "react-native"
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
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeFilter: {
    borderBottomColor: "#0084FF",
  },
  filterText: {
    fontSize: 13,
    color: "#757575",
    fontWeight: "500",
  },
  activeFilterText: {
    color: "#0084FF",
    fontWeight: "700",
  },
  listContainer: {
    padding: 10,
    paddingBottom: 20,
  },
  tripCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#0084FF",
  },
  tripCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  tripTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F1F1F",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  tripMeta: {
    fontSize: 12,
    color: "#757575",
    marginBottom: 8,
  },
  tripDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  tripDate: {
    fontSize: 11,
    color: "#BDBDBD",
    fontWeight: "500",
  },
  publicBadge: {
    fontSize: 10,
    color: "#4CAF50",
    fontWeight: "600",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 14,
    color: "#9E9E9E",
    textAlign: "center",
  },
})

const TripHistoryScreen = ({ navigation }) => {
  const { user } = useAuth()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    fetchTrips()
  }, [])

  const fetchTrips = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/trips`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      })
      const data = await response.json()
      setTrips(data)
    } catch (error) {
      console.log("[v0] Fetch trips error:", error)
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchTrips()
    setRefreshing(false)
  }

  const filteredTrips = trips.filter((trip) => {
    if (filter === "all") return true
    return trip.status === filter
  })

  const renderTripCard = ({ item: trip }) => (
    <TouchableOpacity style={styles.tripCard} onPress={() => navigation.navigate("TripDetail", { tripId: trip.id })}>
      <View style={styles.tripCardHeader}>
        <Text style={styles.tripTitle} numberOfLines={2}>
          {trip.title}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: trip.status === "completed" ? "#4CAF50" : "#FFA500" }]}>
          <Text style={styles.statusText}>{trip.status}</Text>
        </View>
      </View>

      <Text style={styles.tripMeta}>
        {trip.stops?.length || 0} stops • {Math.round(trip.total_distance || 0)} km
      </Text>

      <View style={styles.tripDetails}>
        <Text style={styles.tripDate}>
          {new Date(trip.start_date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </Text>
      </View>
    </TouchableOpacity>
  )

  if (loading && trips.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0084FF" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        {["all", "active", "completed", "draft"].map((filterOption) => (
          <TouchableOpacity
            key={filterOption}
            style={[styles.filterTab, filter === filterOption && styles.activeFilter]}
            onPress={() => setFilter(filterOption)}
          >
            <Text style={[styles.filterText, filter === filterOption && styles.activeFilterText]}>
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredTrips}
        renderItem={renderTripCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {filter === "all" ? "No trips yet. Start exploring!" : `No ${filter} trips found.`}
            </Text>
          </View>
        }
      />
    </View>
  )
}

export default TripHistoryScreen
