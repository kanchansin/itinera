import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  StyleSheet,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Polyline, Marker } from 'react-native-maps';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { db } from '@/services/firebase';
import { collection, query, where, orderBy, getDocs, onSnapshot } from 'firebase/firestore';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentTrip, setCurrentTrip] = useState<any>(null);
  const [mapRoute, setMapRoute] = useState<Array<{ latitude: number; longitude: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const tripsRef = collection(db, 'trips');
    const q = query(
      tripsRef,
      where('userId', '==', user.id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const tripData = snapshot.docs[0].data();
        setCurrentTrip(tripData);
        
        if (tripData.stops && tripData.stops.length > 0) {
          const routePoints = tripData.stops.map((stop: any) => stop.location);
          setMapRoute(routePoints);
        }
      } else {
        setCurrentTrip(null);
        setMapRoute([]);
      }
      setLoading(false);
      setRefreshing(false);
    }, (error) => {
      console.error('Load trips error:', error);
      setLoading(false);
      setRefreshing(false);
    });

    return () => unsubscribe();
  }, [user?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
  };

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

  const handleEditTrip = () => {
    if (!currentTrip) return;
    
    router.push({
      pathname: '/(tabs)/create-trip',
      params: {
        editMode: 'true',
        tripData: JSON.stringify({
          id: currentTrip.id,
          tripName: currentTrip.tripName,
          startLocation: currentTrip.startLocation,
          startTime: currentTrip.startTime,
          transport: currentTrip.transport,
          stops: currentTrip.stops || [],
        }),
      },
    });
  };

  if (loading) {
    return (
      <LinearGradient colors={['#FFFFFF', '#E8F1F8']} style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5DA7DB" />
          <Text style={styles.loadingText}>Loading your trips...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (!currentTrip) {
    return (
      <LinearGradient colors={['#FFFFFF', '#E8F1F8']} style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>My Trips</Text>
            <Text style={styles.headerDate}>No active trips</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => router.push('/(tabs)/profile')}
          >
            {user?.profilePicture ? (
              <Image
                source={{ uri: user.profilePicture }}
                style={styles.profileImage}
              />
            ) : (
              <View style={[styles.profileImage, styles.profilePlaceholder]}>
                <Ionicons name="person" size={24} color="#A0B4C8" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.emptyStateContainer}>
          <Ionicons name="map-outline" size={80} color="#E8F1F8" />
          <Text style={styles.emptyStateTitle}>No Trips Yet</Text>
          <Text style={styles.emptyStateText}>
            Create your first trip to start exploring
          </Text>
          <TouchableOpacity
            style={styles.createTripButton}
            onPress={() => router.push('/(tabs)/create-trip')}
          >
            <LinearGradient
              colors={['#5DA7DB', '#0E2954']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.createTripGradient}
            >
              <Ionicons name="add-circle" size={24} color="#FFFFFF" />
              <Text style={styles.createTripText}>Create Trip</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#FFFFFF', '#E8F1F8']} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{currentTrip.tripName}</Text>
          <Text style={styles.headerDate}>{currentTrip.date || currentTrip.startTime}</Text>
        </View>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => router.push('/(tabs)/profile')}
        >
          {user?.profilePicture ? (
            <Image
              source={{ uri: user.profilePicture }}
              style={styles.profileImage}
            />
          ) : (
            <View style={[styles.profileImage, styles.profilePlaceholder]}>
              <Ionicons name="person" size={24} color="#A0B4C8" />
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.mapCard}>
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: currentTrip.stops[0]?.location?.latitude || 12.9716,
                longitude: currentTrip.stops[0]?.location?.longitude || 77.5946,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
              rotateEnabled={false}
              pitchEnabled={false}
            >
              {mapRoute.length > 0 && (
                <Polyline
                  coordinates={mapRoute}
                  strokeColor="#5DA7DB"
                  strokeWidth={3}
                />
              )}
              {currentTrip.stops && currentTrip.stops.map((stop: any, index: number) => (
                <Marker
                  key={stop.id}
                  coordinate={stop.location}
                  pinColor={
                    index === 0 
                      ? '#22c55e' 
                      : index === currentTrip.stops.length - 1 
                        ? '#FF6B6B' 
                        : '#5DA7DB'
                  }
                  title={stop.name}
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
                {currentTrip.stops?.length || 0} Stops
              </Text>
            </View>
            <View style={styles.mapInfoItem}>
              <Ionicons name="car-sport" size={16} color="#5DA7DB" />
              <Text style={styles.mapInfoText}>
                {currentTrip.transport || 'driving'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.timelineSection}>
          <Text style={styles.sectionTitle}>Trip Timeline</Text>
          <View style={styles.timeline}>
            {currentTrip.stops && currentTrip.stops.map((stop: any, index: number) => (
              <View key={stop.id} style={styles.timelineItemContainer}>
                {index > 0 && (
                  <View
                    style={[
                      styles.timelineLine,
                      { backgroundColor: getStatusColor(stop.status || 'upcoming') },
                    ]}
                  />
                )}

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

                  <View
                    style={[
                      styles.stopIconContainer,
                      { backgroundColor: getStatusColor(stop.status || 'upcoming') },
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
                    {stop.description && (
                      <Text style={styles.stopDescription}>
                        {stop.description}
                      </Text>
                    )}
                    {stop.arrival && stop.departure && (
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
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Trip Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <View style={styles.summaryIcon}>
                <Ionicons name="checkmark-done" size={20} color="#22c55e" />
              </View>
              <Text style={styles.summaryValue}>
                {currentTrip.stops?.filter((s: any) => s.status === 'completed').length || 0}
              </Text>
              <Text style={styles.summaryLabel}>Completed</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <View style={styles.summaryIcon}>
                <Ionicons name="time" size={20} color="#5DA7DB" />
              </View>
              <Text style={styles.summaryValue}>
                {currentTrip.stops?.filter((s: any) => s.status === 'upcoming').length || currentTrip.stops?.length || 0}
              </Text>
              <Text style={styles.summaryLabel}>Remaining</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <View style={styles.summaryIcon}>
                <Ionicons name="location" size={20} color="#FFB800" />
              </View>
              <Text style={styles.summaryValue}>{currentTrip.stops?.length || 0}</Text>
              <Text style={styles.summaryLabel}>Total Stops</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.fabContainer}>
        <TouchableOpacity 
          style={styles.fabSecondary}
          onPress={onRefresh}
        >
          <Ionicons name="refresh" size={24} color="#5DA7DB" />
          <Text style={styles.fabSecondaryText}>Refresh</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.fabPrimary} onPress={handleEditTrip}>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#5DA7DB',
    marginTop: 16,
    fontWeight: '600',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0E2954',
    marginTop: 24,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#A0B4C8',
    textAlign: 'center',
    marginBottom: 32,
  },
  createTripButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#5DA7DB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  createTripGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 8,
  },
  createTripText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
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
  profilePlaceholder: {
    backgroundColor: '#F5F9FC',
    justifyContent: 'center',
    alignItems: 'center',
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