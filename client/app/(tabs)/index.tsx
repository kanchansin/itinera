// client/app/(tabs)/index.tsx - UPDATED WITH AI
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
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { db } from '@/services/firebase';
import { collection, query, where, orderBy, onSnapshot, limit, getDocs } from 'firebase/firestore';
import * as Location from 'expo-location';
import axios from 'axios';
import LiveTripWidget from '@/components/LiveTripWidget';

const { width } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.100:5000/api';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentTrip, setCurrentTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [nearbyPlaces, setNearbyPlaces] = useState<any[]>([]);
  const [greeting, setGreeting] = useState('');
  const [userLocation, setUserLocation] = useState<any>(null);

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

    getUserLocation();

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

    loadAISuggestions();

    return () => unsubscribe();
  }, [user?.id]);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation(location.coords);
        loadNearbyPlaces(location.coords);
      }
    } catch (error) {
      console.error('Location error:', error);
    }
  };

  const loadNearbyPlaces = async (coords: any) => {
    try {
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
        {
          params: {
            location: `${coords.latitude},${coords.longitude}`,
            radius: 5000,
            type: 'tourist_attraction',
            key: process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY,
          },
        }
      );

      if (response.data.results) {
        setNearbyPlaces(response.data.results.slice(0, 5));
      }
    } catch (error) {
      console.error('Nearby places error:', error);
    }
  };

  const loadAISuggestions = async () => {
    try {
      const tripsQuery = query(
        collection(db, 'trips'),
        where('userId', '==', user?.id),
        limit(5)
      );
      const tripsSnapshot = await getDocs(tripsQuery);
      const userTrips = tripsSnapshot.docs.map(doc => doc.data());

      if (userTrips.length > 0) {
        const suggestions = [
          {
            id: 1,
            title: 'Weekend Getaway',
            subtitle: 'Based on your travel style',
            description: 'Coorg Coffee Trail - 2 days',
            icon: 'sparkles',
            image: 'https://images.unsplash.com/photo-1560357647-2d624edb51b1?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            action: () => router.push('/(tabs)/ai-trip-creator'),
          },
          {
            id: 2,
            title: 'Quick Day Trip',
            subtitle: 'Perfect for today',
            description: 'Explore Nandi Hills',
            icon: 'sunny',
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
            action: () => router.push('/(tabs)/ai-trip-creator'),
          },
        ];
        setAiSuggestions(suggestions);
      }
    } catch (error) {
      console.error('Load AI suggestions error:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await getUserLocation();
    await loadAISuggestions();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0E2954" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />

      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.heroSection}>
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
                  <Ionicons name="person" size={24} color="#667eea" />
                </View>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.aiTripCard}
            onPress={() => router.push('/(tabs)/ai-trip-creator')}
          >
            <View style={styles.aiTripContent}>
              <View style={styles.aiTripIcon}>
                <Ionicons name="sparkles" size={28} color="#667eea" />
              </View>
              <View style={styles.aiTripText}>
                <Text style={styles.aiTripTitle}>Create AI Trip</Text>
                <Text style={styles.aiTripSubtitle}>
                  Let AI plan your perfect journey
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={24} color="#667eea" />
            </View>
          </TouchableOpacity>

          {currentTrip && (
            <TouchableOpacity
              style={styles.currentTripBadge}
              onPress={() => router.push({
                pathname: '/(tabs)/create-trip',
                params: {
                  editMode: 'true',
                  tripData: JSON.stringify(currentTrip)
                }
              })}
            >
              <Ionicons name="navigate" size={16} color="#FFFFFF" />
              <Text style={styles.currentTripText}>
                Continue: {currentTrip.tripName}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>
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
        <LiveTripWidget onEndTrip={onRefresh} />

        {aiSuggestions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="sparkles" size={24} color="#667eea" />
                <Text style={styles.sectionTitle}>AI Recommendations</Text>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carousel}
            >
              {aiSuggestions.map((suggestion) => (
                <TouchableOpacity
                  key={suggestion.id}
                  style={styles.aiCard}
                  onPress={suggestion.action}
                >
                  <Image
                    source={{ uri: suggestion.image }}
                    style={styles.aiImage}
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(102, 126, 234, 0.95)']}
                    style={styles.aiGradient}
                  >
                    <View style={styles.aiInfo}>
                      <View style={styles.aiIconBadge}>
                        <Ionicons name={suggestion.icon as any} size={16} color="#FFFFFF" />
                      </View>
                      <Text style={styles.aiTitle}>{suggestion.title}</Text>
                      <Text style={styles.aiSubtitle}>{suggestion.subtitle}</Text>
                      <Text style={styles.aiDescription}>{suggestion.description}</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {nearbyPlaces.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="location" size={24} color="#10B981" />
                <Text style={styles.sectionTitle}>Near You</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/(tabs)/discover')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carousel}
            >
              {nearbyPlaces.map((place, index) => (
                <TouchableOpacity key={index} style={styles.nearbyCard}>
                  {place.photos && place.photos[0] ? (
                    <Image
                      source={{
                        uri: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY}`,
                      }}
                      style={styles.nearbyImage}
                    />
                  ) : (
                    <View style={[styles.nearbyImage, { backgroundColor: '#E5E7EB' }]}>
                      <Ionicons name="image" size={32} color="#9CA3AF" />
                    </View>
                  )}
                  <View style={styles.nearbyInfo}>
                    <Text style={styles.nearbyName} numberOfLines={1}>
                      {place.name}
                    </Text>
                    <View style={styles.nearbyRating}>
                      <Ionicons name="star" size={14} color="#F59E0B" />
                      <Text style={styles.nearbyRatingText}>
                        {place.rating || 'N/A'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.quickActions}>
          <Text style={styles.quickActionsTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/create-trip')}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.actionGradient}
              >
                <Ionicons name="add-circle" size={32} color="#FFFFFF" />
                <Text style={styles.actionText}>Manual Trip</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/explore')}
            >
              <LinearGradient
                colors={['#F59E0B', '#D97706']}
                style={styles.actionGradient}
              >
                <Ionicons name="compass" size={32} color="#FFFFFF" />
                <Text style={styles.actionText}>Explore</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/discover')}
            >
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                style={styles.actionGradient}
              >
                <Ionicons name="search" size={32} color="#FFFFFF" />
                <Text style={styles.actionText}>Discover</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => {/* Navigate to saved trips */ }}
            >
              <LinearGradient
                colors={['#EF4444', '#DC2626']}
                style={styles.actionGradient}
              >
                <Ionicons name="bookmark" size={32} color="#FFFFFF" />
                <Text style={styles.actionText}>Saved</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 15,
    color: '#667eea',
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
    color: 'rgba(255, 255, 255, 0.8)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiTripCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  aiTripContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  aiTripIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiTripText: {
    flex: 1,
  },
  aiTripTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  aiTripSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  currentTripBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
  },
  currentTripText: {
    flex: 1,
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
    color: '#667eea',
  },
  carousel: {
    paddingHorizontal: 24,
    gap: 16,
  },
  aiCard: {
    width: 240,
    height: 280,
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
    height: '65%',
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
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  aiDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  nearbyCard: {
    width: 180,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  nearbyImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nearbyInfo: {
    padding: 12,
  },
  nearbyName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
  },
  nearbyRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  nearbyRatingText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  quickActions: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  quickActionsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: (width - 60) / 2,
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});