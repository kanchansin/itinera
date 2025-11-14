// client/app/(tabs)/index.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Polyline, Marker } from 'react-native-maps';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const mockTripData = {
  tripName: 'Bangalore Weekend',
  date: 'Nov 16-17, 2024',
  currentStop: 2,
  stops: [
    {
      id: 1,
      name: 'Lalbagh Botanical Garden',
      arrival: '09:00 AM',
      departure: '11:30 AM',
      description: 'Explore the historic gardens and glass house',
      status: 'completed',
      location: { latitude: 12.9507, longitude: 77.5847 },
    },
    {
      id: 2,
      name: 'VV Puram Food Street',
      arrival: '12:00 PM',
      departure: '02:00 PM',
      description: 'Lunch at authentic South Indian street food',
      status: 'current',
      location: { latitude: 12.9352, longitude: 77.5740 },
    },
    {
      id: 3,
      name: 'Cubbon Park',
      arrival: '03:00 PM',
      departure: '05:00 PM',
      description: 'Relaxing walk through the green oasis',
      status: 'upcoming',
      location: { latitude: 12.9762, longitude: 77.5929 },
    },
    {
      id: 4,
      name: 'UB City Mall',
      arrival: '06:00 PM',
      departure: '08:30 PM',
      description: 'Shopping and dinner at luxury mall',
      status: 'upcoming',
      location: { latitude: 12.9716, longitude: 77.5946 },
    },
  ],
};

const mapRoute = [
  { latitude: 12.9507, longitude: 77.5847 },
  { latitude: 12.9352, longitude: 77.5740 },
  { latitude: 12.9762, longitude: 77.5929 },
  { latitude: 12.9716, longitude: 77.5946 },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentTrip] = useState(mockTripData);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#22c55e';
      case 'current':
        return '#5DA7DB';
      case 'upcoming':
        return '#A0B4C8';
      default:
        return '#A0B4C8';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'current':
        return 'radio-button-on';
      case 'upcoming':
        return 'ellipse-outline';
      default:
        return 'ellipse-outline';
    }
  };

  return (
    <LinearGradient colors={['#FFFFFF', '#E8F1F8']} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Trip</Text>
          <Text style={styles.headerDate}>{currentTrip.date}</Text>
        </View>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <Image
            source={require('../../assets/profile.jpg')}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Map Preview Card */}
        <View style={styles.mapCard}>
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: 12.9507,
                longitude: 77.5847,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
              rotateEnabled={false}
              pitchEnabled={false}
            >
              <Polyline
                coordinates={mapRoute}
                strokeColor="#5DA7DB"
                strokeWidth={3}
              />
              {currentTrip.stops.map((stop) => (
                <Marker
                  key={stop.id}
                  coordinate={stop.location}
                  pinColor={getStatusColor(stop.status)}
                />
              ))}
            </MapView>
            <LinearGradient
              colors={['rgba(255,255,255,0.9)', 'transparent']}
              style={styles.mapOverlay}
            />
          </View>
          <View style={styles.mapInfo}>
            <View style={styles.mapInfoItem}>
              <Ionicons name="location" size={16} color="#5DA7DB" />
              <Text style={styles.mapInfoText}>
                {currentTrip.stops.length} Stops
              </Text>
            </View>
            <View style={styles.mapInfoItem}>
              <Ionicons name="time" size={16} color="#5DA7DB" />
              <Text style={styles.mapInfoText}>~8 Hours</Text>
            </View>
            <View style={styles.mapInfoItem}>
              <Ionicons name="navigate" size={16} color="#5DA7DB" />
              <Text style={styles.mapInfoText}>32 km</Text>
            </View>
          </View>
        </View>

        {/* Trip Timeline */}
        <View style={styles.timelineSection}>
          <Text style={styles.sectionTitle}>Trip Timeline</Text>
          <View style={styles.timeline}>
            {currentTrip.stops.map((stop, index) => (
              <View key={stop.id} style={styles.timelineItemContainer}>
                {/* Timeline Line */}
                {index > 0 && (
                  <View
                    style={[
                      styles.timelineLine,
                      { backgroundColor: getStatusColor(stop.status) },
                    ]}
                  />
                )}

                {/* Stop Card */}
                <View
                  style={[
                    styles.stopCard,
                    stop.status === 'current' && styles.stopCardCurrent,
                  ]}
                >
                  {stop.status === 'current' && (
                    <View style={styles.currentIndicator}>
                      <View style={styles.pulseOuter} />
                      <View style={styles.pulseInner} />
                    </View>
                  )}

                  {/* Stop Number/Status Icon */}
                  <View
                    style={[
                      styles.stopIconContainer,
                      { backgroundColor: getStatusColor(stop.status) },
                    ]}
                  >
                    {stop.status === 'completed' ? (
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color="#FFFFFF"
                      />
                    ) : (
                      <Text style={styles.stopNumber}>{index + 1}</Text>
                    )}
                  </View>

                  {/* Stop Details */}
                  <View style={styles.stopContent}>
                    <View style={styles.stopHeader}>
                      <Text style={styles.stopName}>{stop.name}</Text>
                      {stop.status === 'current' && (
                        <View style={styles.liveTag}>
                          <View style={styles.liveDot} />
                          <Text style={styles.liveText}>Live</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.stopDescription}>
                      {stop.description}
                    </Text>
                    <View style={styles.stopTime}>
                      <View style={styles.timeBlock}>
                        <Ionicons name="log-in" size={14} color="#5DA7DB" />
                        <Text style={styles.timeText}>{stop.arrival}</Text>
                      </View>
                      <Ionicons name="arrow-forward" size={14} color="#A0B4C8" />
                      <View style={styles.timeBlock}>
                        <Ionicons name="log-out" size={14} color="#5DA7DB" />
                        <Text style={styles.timeText}>{stop.departure}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Trip Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Trip Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <View style={styles.summaryIcon}>
                <Ionicons name="checkmark-done" size={20} color="#22c55e" />
              </View>
              <Text style={styles.summaryValue}>
                {currentTrip.stops.filter((s) => s.status === 'completed').length}
              </Text>
              <Text style={styles.summaryLabel}>Completed</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <View style={styles.summaryIcon}>
                <Ionicons name="time" size={20} color="#5DA7DB" />
              </View>
              <Text style={styles.summaryValue}>
                {currentTrip.stops.filter((s) => s.status === 'upcoming').length}
              </Text>
              <Text style={styles.summaryLabel}>Remaining</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <View style={styles.summaryIcon}>
                <Ionicons name="speedometer" size={20} color="#FFB800" />
              </View>
              <Text style={styles.summaryValue}>75%</Text>
              <Text style={styles.summaryLabel}>Progress</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Buttons */}
      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.fabSecondary}>
          <Ionicons name="refresh" size={24} color="#5DA7DB" />
          <Text style={styles.fabSecondaryText}>Recalculate</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.fabPrimary}>
          <LinearGradient
            colors={['#5DA7DB', '#0E2954']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.fabGradient}
          >
            <Ionicons name="create" size={24} color="#FFFFFF" />
            <Text style={styles.fabPrimaryText}>Edit Trip</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0E2954',
    marginBottom: 4,
  },
  headerDate: {
    fontSize: 14,
    color: '#5DA7DB',
    fontWeight: '500',
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E8F1F8',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  mapCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#0E2954',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  mapContainer: {
    height: 200,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  mapInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  mapInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mapInfoText: {
    fontSize: 14,
    color: '#0E2954',
    fontWeight: '600',
  },
  timelineSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0E2954',
    marginBottom: 16,
  },
  timeline: {
    position: 'relative',
  },
  timelineItemContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  timelineLine: {
    position: 'absolute',
    left: 27,
    top: -16,
    width: 2,
    height: 16,
  },
  stopCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    shadowColor: '#0E2954',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  stopCardCurrent: {
    borderWidth: 2,
    borderColor: '#5DA7DB',
    shadowColor: '#5DA7DB',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  currentIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  pulseOuter: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#5DA7DB',
    opacity: 0.3,
  },
  pulseInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#5DA7DB',
    marginLeft: 4,
    marginTop: 4,
  },
  stopIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stopNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stopContent: {
    flex: 1,
  },
  stopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  stopName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0E2954',
    flex: 1,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF5FA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#5DA7DB',
  },
  liveText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#5DA7DB',
    textTransform: 'uppercase',
  },
  stopDescription: {
    fontSize: 14,
    color: '#A0B4C8',
    marginBottom: 12,
    lineHeight: 20,
  },
  stopTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0E2954',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#0E2954',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0E2954',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F9FC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0E2954',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#A0B4C8',
    fontWeight: '500',
  },
  summaryDivider: {
    width: 1,
    height: 60,
    backgroundColor: '#E8F1F8',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    flexDirection: 'row',
    gap: 12,
  },
  fabSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 16,
    gap: 8,
    borderWidth: 2,
    borderColor: '#5DA7DB',
    shadowColor: '#0E2954',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  fabSecondaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5DA7DB',
  },
  fabPrimary: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#5DA7DB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  fabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  fabPrimaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});