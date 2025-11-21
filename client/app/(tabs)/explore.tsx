import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  FlatList,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/services/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import axios from 'axios';

const { width } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.100:5000/api';

export default function AIExplore() {
  const { user, accessToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [userTrips, setUserTrips] = useState<any[]>([]);
  const [guidePost, setGuidePost] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const tripsQuery = query(
        collection(db, 'trips'),
        where('userId', '==', user.id),
        limit(10)
      );
      const tripsSnapshot = await getDocs(tripsQuery);
      const trips = tripsSnapshot.docs.map(doc => doc.data());
      setUserTrips(trips);

      if (trips.length > 0) {
        const response = await axios.post(
          `${API_URL}/ai/generate-guide`,
          {
            userTrips: trips,
            userPreferences: {
              mood: 'adventurous',
              locationType: 'nature',
              travelerType: 'solo',
            },
          },
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        setGuidePost(response.data);
      }

      const publicTripsQuery = query(
        collection(db, 'trips'),
        where('isPublic', '==', true),
        limit(20)
      );
      const publicSnapshot = await getDocs(publicTripsQuery);
      const publicTrips = publicSnapshot.docs.map(doc => doc.data());

      const recommended = publicTrips.filter(trip => {
        if (trips.length === 0) return true;
        
        const userDestinations = trips.map(t => t.destination?.toLowerCase());
        const hasVisited = userDestinations.includes(trip.destination?.toLowerCase());
        
        return !hasVisited; 
      });

      setAiRecommendations(recommended.slice(0, 10));
    } catch (error) {
      console.error('Load user data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', label: 'For You', icon: 'sparkles' },
    { id: 'similar', label: 'Similar Trips', icon: 'repeat' },
    { id: 'trending', label: 'Trending', icon: 'trending-up' },
    { id: 'nearby', label: 'Nearby', icon: 'location' },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Personalizing your feed...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Explore</Text>
          <Text style={styles.headerSubtitle}>AI-curated trips for you</Text>
        </View>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={20} color="#1F2937" />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScroll}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryChip,
              selectedCategory === cat.id && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(cat.id)}
          >
            <Ionicons
              name={cat.icon as any}
              size={16}
              color={selectedCategory === cat.id ? '#FFFFFF' : '#6B7280'}
            />
            <Text
              style={[
                styles.categoryLabel,
                selectedCategory === cat.id && styles.categoryLabelActive,
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {guidePost && (
          <View style={styles.aiGuideSection}>
            <View style={styles.aiHeader}>
              <Ionicons name="sparkles" size={20} color="#667eea" />
              <Text style={styles.aiHeaderText}>AI Guide Post for You</Text>
            </View>
            
            <View style={styles.guideCard}>
              <Text style={styles.guideTitle}>{guidePost.title}</Text>
              <Text style={styles.guideDescription}>{guidePost.description}</Text>
              
              <View style={styles.guideTags}>
                {guidePost.tags?.map((tag: string, index: number) => (
                  <View key={index} style={styles.guideTag}>
                    <Text style={styles.guideTagText}>{tag}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.guideSpots}>
                {guidePost.spots?.slice(0, 3).map((spot: any, index: number) => (
                  <View key={index} style={styles.spotCard}>
                    <Text style={styles.spotName}>{spot.name}</Text>
                    <Text style={styles.spotWhy}>{spot.why}</Text>
                    <View style={styles.spotMeta}>
                      <Ionicons name="time" size={14} color="#6B7280" />
                      <Text style={styles.spotTime}>{spot.bestTime}</Text>
                    </View>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={styles.viewFullButton}>
                <Text style={styles.viewFullText}>View Full Guide</Text>
                <Ionicons name="arrow-forward" size={16} color="#667eea" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.recommendationsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended for You</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {aiRecommendations.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="compass" size={64} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No recommendations yet</Text>
              <Text style={styles.emptySubtitle}>
                Create more trips to get personalized recommendations
              </Text>
            </View>
          ) : (
            <FlatList
              data={aiRecommendations}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.gridRow}
              renderItem={({ item, index }) => (
                <TripCard trip={item} index={index} />
              )}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const TripCard = ({ trip, index }: { trip: any; index: number }) => {
  return (
    <TouchableOpacity style={styles.tripCard}>
      <Image
        source={{
          uri: trip.coverImage || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
        }}
        style={styles.tripImage}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.tripGradient}
      >
        <View style={styles.aiMatchBadge}>
          <Ionicons name="sparkles" size={12} color="#FFFFFF" />
          <Text style={styles.aiMatchText}>AI Match</Text>
        </View>
        <View style={styles.tripInfo}>
          <Text style={styles.tripName}>{trip.tripName}</Text>
          <Text style={styles.tripDestination}>{trip.destination}</Text>
          <View style={styles.tripMeta}>
            <Ionicons name="heart" size={14} color="#FFFFFF" />
            <Text style={styles.tripLikes}>{trip.likesCount || 0}</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  loadingText: {
    fontSize: 16,
    color: '#667eea',
    marginTop: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#1F2937' },
  headerSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesScroll: { paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryChipActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  categoryLabel: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  categoryLabelActive: { color: '#FFFFFF' },
  content: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  aiGuideSection: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  aiHeaderText: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  guideCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  guideTitle: { fontSize: 22, fontWeight: '700', color: '#1F2937', marginBottom: 8 },
  guideDescription: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 16,
  },
  guideTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  guideTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
  },
  guideTagText: { fontSize: 12, fontWeight: '600', color: '#667eea' },
  guideSpots: { gap: 12, marginBottom: 16 },
  spotCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
  },
  spotName: { fontSize: 15, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
  spotWhy: { fontSize: 13, color: '#6B7280', marginBottom: 8, lineHeight: 18 },
  spotMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  spotTime: { fontSize: 12, color: '#6B7280' },
  viewFullButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
  },
  viewFullText: { fontSize: 15, fontWeight: '600', color: '#667eea' },
  recommendationsSection: { paddingHorizontal: 20 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#1F2937' },
  seeAllText: { fontSize: 14, fontWeight: '600', color: '#667eea' },
  gridRow: { justifyContent: 'space-between', marginBottom: 12 },
  tripCard: {
    width: (width - 52) / 2,
    height: 240,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F9FAFB',
  },
  tripImage: { width: '100%', height: '100%' },
  tripGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
    justifyContent: 'space-between',
    padding: 12,
  },
  aiMatchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(102, 126, 234, 0.9)',
    borderRadius: 8,
  },
  aiMatchText: { fontSize: 10, fontWeight: '600', color: '#FFFFFF' },
  tripInfo: { gap: 4 },
  tripName: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  tripDestination: { fontSize: 13, color: 'rgba(255, 255, 255, 0.9)' },
  tripMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  tripLikes: { fontSize: 12, color: '#FFFFFF', fontWeight: '600' },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
});