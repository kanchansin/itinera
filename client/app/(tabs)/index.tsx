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
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { db } from '@/services/firebase';
import { collection, query, where, orderBy, onSnapshot, limit, getDocs } from 'firebase/firestore';

const { width } = Dimensions.get('window');

const popularDestinations = [
  {
    id: 1,
    name: 'Coorg',
    region: 'Karnataka',
    image: 'https://images.unsplash.com/photo-1587241321921-91eed3df0d29?w=400',
    description: 'Coffee plantations',
  },
  {
    id: 2,
    name: 'Hampi',
    region: 'Karnataka',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400',
    description: 'Ancient ruins',
  },
  {
    id: 3,
    name: 'Gokarna',
    region: 'Karnataka',
    image: 'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?w=400',
    description: 'Pristine beaches',
  },
  {
    id: 4,
    name: 'Chikmagalur',
    region: 'Karnataka',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    description: 'Hill station',
  },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentTrip, setCurrentTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nearbyPlaces, setNearbyPlaces] = useState<any[]>([]);
  const [aiRecommendations, setAIRecommendations] = useState<any[]>([]);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const tripsRef = collection(db, 'trips');
    const q = query(
      tripsRef,
      where('userId', '==', user.id),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const tripData = snapshot.docs[0].data();
        setCurrentTrip(tripData);
      } else {
        setCurrentTrip(null);
      }
      setLoading(false);
      setRefreshing(false);
    }, (error) => {
      console.error('Load trips error:', error);
      setLoading(false);
      setRefreshing(false);
    });

    loadNearbyPlaces();
    loadAIRecommendations();

    return () => unsubscribe();
  }, [user?.id]);

  const loadNearbyPlaces = async () => {
    setNearbyPlaces([
      {
        id: 1,
        name: 'Nandi Hills',
        distance: '15 km',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
      },
      {
        id: 2,
        name: 'Wonderla',
        distance: '28 km',
        image: 'https://images.unsplash.com/photo-1594643781191-8c9e221d5d4e?w=400',
      },
      {
        id: 3,
        name: 'Bannerghatta',
        distance: '22 km',
        image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400',
      },
    ]);
  };

  const loadAIRecommendations = async () => {
    setAIRecommendations([
      {
        id: 1,
        name: 'Weekend Getaway',
        subtitle: 'Coorg Coffee Trail',
        image: 'https://images.unsplash.com/photo-1587241321921-91eed3df0d29?w=400',
        duration: '2 days',
      },
      {
        id: 2,
        name: 'Adventure Trip',
        subtitle: 'Dandeli Water Sports',
        image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400',
        duration: '3 days',
      },
      {
        id: 3,
        name: 'Cultural Experience',
        subtitle: 'Hampi Heritage Tour',
        image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400',
        duration: '2 days',
      },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNearbyPlaces();
    await loadAIRecommendations();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0E2954" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5DA7DB" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0E2954" />

      <LinearGradient
        colors={['#0E2954', '#1F4788']}
        style={styles.heroSection}
      >
        <View style={styles.heroContent}>
          <View style={styles.heroHeader}>
            <View>
              <Text style={styles.greetingText}>{greeting}</Text>
              <Text style={styles.userName}>{user?.name || 'Traveler'}</Text>
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
                <View style={styles.profilePlaceholder}>
                  <Ionicons name="person" size={24} color="#5DA7DB" />
                </View>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.planTripCard}
            onPress={() => router.push('/(tabs)/create-trip')}
          >
            <BlurView intensity={20} style={styles.blurCard}>
              <LinearGradient
                colors={['rgba(93, 167, 219, 0.3)', 'rgba(31, 71, 136, 0.3)']}
                style={styles.cardGradient}
              >
                <View style={styles.cardContent}>
                  <View style={styles.cardIcon}>
                    <Ionicons name="add-circle" size={32} color="#FFFFFF" />
                  </View>
                  <View style={styles.cardTextContainer}>
                    <Text style={styles.cardTitle}>Plan a New Trip</Text>
                    <Text style={styles.cardSubtitle}>
                      Create your perfect itinerary
                    </Text>
                  </View>
                  <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
                </View>
              </LinearGradient>
            </BlurView>
          </TouchableOpacity>

          {currentTrip && (
            <View style={styles.currentTripBadge}>
              <Ionicons name="navigate" size={16} color="#FFFFFF" />
              <Text style={styles.currentTripText}>
                Current trip: {currentTrip.tripName}
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Destinations</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carousel}
          >
            {popularDestinations.map((dest) => (
              <TouchableOpacity key={dest.id} style={styles.destinationCard}>
                <Image
                  source={{ uri: dest.image }}
                  style={styles.destinationImage}
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  style={styles.destinationGradient}
                >
                  <View style={styles.destinationInfo}>
                    <Text style={styles.destinationName}>{dest.name}</Text>
                    <View style={styles.destinationMeta}>
                      <Ionicons name="location" size={14} color="#FFFFFF" />
                      <Text style={styles.destinationRegion}>{dest.region}</Text>
                    </View>
                    <Text style={styles.destinationDescription}>
                      {dest.description}
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="location" size={24} color="#5DA7DB" />
              <Text style={styles.sectionTitle}>Near You</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carousel}
          >
            {nearbyPlaces.map((place) => (
              <TouchableOpacity key={place.id} style={styles.nearbyCard}>
                <Image
                  source={{ uri: place.image }}
                  style={styles.nearbyImage}
                />
                <View style={styles.nearbyInfo}>
                  <Text style={styles.nearbyName}>{place.name}</Text>
                  <View style={styles.nearbyDistance}>
                    <Ionicons name="navigate" size={14} color="#5DA7DB" />
                    <Text style={styles.nearbyDistanceText}>{place.distance}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="sparkles" size={24} color="#5DA7DB" />
              <Text style={styles.sectionTitle}>AI Recommendations</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carousel}
          >
            {aiRecommendations.map((rec) => (
              <TouchableOpacity key={rec.id} style={styles.aiCard}>
                <Image
                  source={{ uri: rec.image }}
                  style={styles.aiImage}
                />
                <LinearGradient
                  colors={['transparent', 'rgba(93, 167, 219, 0.95)']}
                  style={styles.aiGradient}
                >
                  <View style={styles.aiInfo}>
                    <View style={styles.aiIconBadge}>
                      <Ionicons name="sparkles" size={16} color="#FFFFFF" />
                    </View>
                    <Text style={styles.aiTitle}>{rec.name}</Text>
                    <Text style={styles.aiSubtitle}>{rec.subtitle}</Text>
                    <View style={styles.aiDuration}>
                      <Ionicons name="time" size={14} color="#FFFFFF" />
                      <Text style={styles.aiDurationText}>{rec.duration}</Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.statsSection}>
          <LinearGradient
            colors={['#EBF5FA', '#FFFFFF']}
            style={styles.statsCard}
          >
            <Text style={styles.statsTitle}>Your Travel Stats</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: '#D1FAE5' }]}>
                  <Ionicons name="map" size={24} color="#10B981" />
                </View>
                <Text style={styles.statValue}>5</Text>
                <Text style={styles.statLabel}>Trips</Text>
              </View>
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="location" size={24} color="#F59E0B" />
                </View>
                <Text style={styles.statValue}>12</Text>
                <Text style={styles.statLabel}>Places</Text>
              </View>
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: '#E0E7FF' }]}>
                  <Ionicons name="heart" size={24} color="#6366F1" />
                </View>
                <Text style={styles.statValue}>24</Text>
                <Text style={styles.statLabel}>Favorites</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
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
    color: '#5DA7DB',
    marginTop: 16,
    fontWeight: '500',
  },
  heroSection: {
    paddingTop: 56,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  heroContent: {
    gap: 20,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingText: {
    fontSize: 14,
    color: '#E8F1F8',
    marginBottom: 4,
    fontWeight: '500',
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profilePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  planTripCard: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  blurCard: {
    overflow: 'hidden',
    borderRadius: 24,
  },
  cardGradient: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#E8F1F8',
  },
  currentTripBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
    alignSelf: 'flex-start',
  },
  currentTripText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5DA7DB',
  },
  carousel: {
    paddingHorizontal: 24,
    gap: 16,
  },
  destinationCard: {
    width: 280,
    height: 360,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#F9FAFB',
  },
  destinationImage: {
    width: '100%',
    height: '100%',
  },
  destinationGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    justifyContent: 'flex-end',
    padding: 20,
  },
  destinationInfo: {
    gap: 4,
  },
  destinationName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  destinationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  destinationRegion: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  destinationDescription: {
    fontSize: 14,
    color: '#E8F1F8',
  },
  nearbyCard: {
    width: 200,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#0E2954',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  nearbyImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#F9FAFB',
  },
  nearbyInfo: {
    padding: 16,
  },
  nearbyName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  nearbyDistance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  nearbyDistanceText: {
    fontSize: 14,
    color: '#5DA7DB',
    fontWeight: '600',
  },
  aiCard: {
    width: 240,
    height: 320,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#F9FAFB',
  },
  aiImage: {
    width: '100%',
    height: '100%',
  },
  aiGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
    justifyContent: 'flex-end',
    padding: 20,
  },
  aiInfo: {
    gap: 6,
  },
  aiIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiTitle: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  aiSubtitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  aiDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiDurationText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statsSection: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  statsCard: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#5DA7DB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});