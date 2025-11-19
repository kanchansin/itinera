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
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';

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
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAFAFF" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#A78BFA" />
          <Text style={styles.loadingText}>Loading your trips...</Text>
        </View>
      </View>
    );
  }

  if (!currentTrip) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAFAFF" />
        
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning</Text>
            <Text style={styles.headerTitle}>My Trips</Text>
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
                <Ionicons name="person" size={20} color="#A78BFA" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="airplane-outline" size={64} color="#C4B5FD" />
          </View>
          <Text style={styles.emptyStateTitle}>Start Your Journey</Text>
          <Text style={styles.emptyStateText}>
            Create your first trip and explore the world with AI-powered planning
          </Text>
          <TouchableOpacity
            style={styles.createTripButton}
            onPress={() => router.push('/(tabs)/create-trip')}
          >
            <LinearGradient
              colors={['#A78BFA', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.createTripGradient}
            >
              <Ionicons name="add" size={24} color="#FFFFFF" />
              <Text style={styles.createTripText}>Create Trip</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFF" />

      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Current Trip</Text>
          <Text style={styles.headerTitle}>{currentTrip.tripName}</Text>
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
              <Ionicons name="person" size={20} color="#A78BFA" />
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
        <View style={styles.liveCard}>
          <View style={styles.liveHeader}>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE NOW</Text>
            </View>
            <TouchableOpacity style={styles.navigationButton}>
              <Ionicons name="navigate" size={18} color="#FFFFFF" />
              <Text style={styles.navigationText}>Navigate</Text>
            </TouchableOpacity>
          </View>
          
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
                  strokeColor="#A78BFA"
                  strokeWidth={4}
                />
              )}
              {currentTrip.stops && currentTrip.stops.map((stop: any, index: number) => (
                <Marker
                  key={stop.id}
                  coordinate={stop.location}
                  pinColor={
                    index === 0 
                      ? '#34D399' 
                      : index === currentTrip.stops.length - 1 
                        ? '#F87171' 
                        : '#A78BFA'
                  }
                />
              ))}
            </MapView>
          </View>

          <View style={styles.tripStats}>
            <View style={styles.statItem}>
              <Ionicons name="location" size={16} color="#A78BFA" />
              <Text style={styles.statValue}>{currentTrip.stops?.length || 0}</Text>
              <Text style={styles.statLabel}>stops</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="car-sport" size={16} color="#A78BFA" />
              <Text style={styles.statValue}>{currentTrip.transport || 'driving'}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="time" size={16} color="#A78BFA" />
              <Text style={styles.statValue}>{currentTrip.startTime}</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Timeline</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllButton}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.timeline}>
          {currentTrip.stops && currentTrip.stops.slice(0, 3).map((stop: any, index: number) => (
            <View key={stop.id} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View
                  style={[
                    styles.timelineDot,
                    stop.status === 'completed' && styles.timelineDotCompleted,
                    stop.status === 'current' && styles.timelineDotCurrent,
                  ]}
                >
                  {stop.status === 'completed' ? (
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  ) : stop.status === 'current' ? (
                    <View style={styles.currentPulse} />
                  ) : (
                    <Text style={styles.timelineDotText}>{index + 1}</Text>
                  )}
                </View>
                {index < 2 && <View style={styles.timelineLine} />}
              </View>
              
              <View style={[
                styles.timelineCard,
                stop.status === 'current' && styles.timelineCardActive
              ]}>
                <Text style={styles.timelineStopName}>{stop.name}</Text>
                {stop.status === 'current' && (
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentBadgeText}>Current</Text>
                  </View>
                )}
                {stop.arrival && stop.departure && (
                  <View style={styles.timelineTime}>
                    <Ionicons name="time-outline" size={14} color="#9CA3AF" />
                    <Text style={styles.timelineTimeText}>
                      {stop.arrival} - {stop.departure}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Trip Overview</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <View style={[styles.summaryIcon, { backgroundColor: '#D1FAE5' }]}>
                <Ionicons name="checkmark-done" size={20} color="#10B981" />
              </View>
              <Text style={styles.summaryValue}>
                {currentTrip.stops?.filter((s: any) => s.status === 'completed').length || 0}
              </Text>
              <Text style={styles.summaryLabel}>Completed</Text>
            </View>
            <View style={styles.summaryItem}>
              <View style={[styles.summaryIcon, { backgroundColor: '#E0E7FF' }]}>
                <Ionicons name="time-outline" size={20} color="#6366F1" />
              </View>
              <Text style={styles.summaryValue}>
                {currentTrip.stops?.filter((s: any) => s.status === 'upcoming').length || currentTrip.stops?.length || 0}
              </Text>
              <Text style={styles.summaryLabel}>Remaining</Text>
            </View>
            <View style={styles.summaryItem}>
              <View style={[styles.summaryIcon, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="location" size={20} color="#F59E0B" />
              </View>
              <Text style={styles.summaryValue}>{currentTrip.stops?.length || 0}</Text>
              <Text style={styles.summaryLabel}>Total</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.fabSecondary} onPress={onRefresh}>
          <Ionicons name="refresh" size={22} color="#A78BFA" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.fabPrimary} onPress={handleEditTrip}>
          <LinearGradient
            colors={['#A78BFA', '#8B5CF6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.fabGradient}
          >
            <Ionicons name="create-outline" size={22} color="#FFFFFF" />
            <Text style={styles.fabText}>Edit Trip</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 15,
    color: '#A78BFA',
    marginTop: 16,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 4,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profilePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FAF5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  createTripButton: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
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
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  liveCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginBottom: 24,
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    overflow: 'hidden',
  },
  liveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  liveText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
    letterSpacing: 1,
  },
  navigationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#A78BFA',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  navigationText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  mapContainer: {
    height: 200,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F9FAFB',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  tripStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
    paddingTop: 16,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#F3F4F6',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  seeAllButton: {
    fontSize: 14,
    color: '#A78BFA',
    fontWeight: '600',
  },
  timeline: {
    marginBottom: 24,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  timelineDotCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  timelineDotCurrent: {
    backgroundColor: '#A78BFA',
    borderColor: '#A78BFA',
  },
  timelineDotText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  currentPulse: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  timelineCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
  },
  timelineCardActive: {
    borderColor: '#A78BFA',
    backgroundColor: '#FAF5FF',
  },
  timelineStopName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  currentBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  currentBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6366F1',
    letterSpacing: 0.5,
  },
  timelineTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timelineTimeText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    flexDirection: 'row',
    gap: 12,
  },
  fabSecondary: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
  },
  fabPrimary: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
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
  fabText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});