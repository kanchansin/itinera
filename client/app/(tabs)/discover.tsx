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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/services/firebase';
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc, setDoc, deleteDoc, updateDoc, increment, onSnapshot } from 'firebase/firestore';

const { width } = Dimensions.get('window');

export default function DiscoverScreen() {
  const { user } = useAuth();
  const [guides, setGuides] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  const filters = ['all', 'trending', 'new', 'popular'];

  useEffect(() => {
    loadGuides();
  }, [filter]);

  const loadGuides = async () => {
    try {
      let q;
      const tripsRef = collection(db, 'trips');

      if (filter === 'trending') {
        q = query(
          tripsRef,
          where('isPublic', '==', true),
          orderBy('likesCount', 'desc'),
          limit(20)
        );
      } else if (filter === 'new') {
        q = query(
          tripsRef,
          where('isPublic', '==', true),
          orderBy('createdAt', 'desc'),
          limit(20)
        );
      } else if (filter === 'popular') {
        q = query(
          tripsRef,
          where('isPublic', '==', true),
          where('likesCount', '>=', 5),
          orderBy('likesCount', 'desc'),
          limit(20)
        );
      } else {
        q = query(
          tripsRef,
          where('isPublic', '==', true),
          orderBy('createdAt', 'desc'),
          limit(20)
        );
      }

      const snapshot = await getDocs(q);
      const guidesData = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const guide = docSnap.data();
          const userDocRef = doc(db, 'users', guide.userId);
          const userSnap = await getDoc(userDocRef);
          const userData = userSnap.data();

          const likesQuery = query(
            collection(db, 'tripLikes'),
            where('tripId', '==', docSnap.id),
            where('userId', '==', user?.id)
          );
          const likesSnapshot = await getDocs(likesQuery);
          const isLiked = !likesSnapshot.empty;

          return {
            ...guide,
            id: docSnap.id,
            userName: userData?.name || 'Unknown',
            userAvatar: userData?.profilePicture || null,
            isLiked,
          };
        })
      );

      setGuides(guidesData);
    } catch (error) {
      console.error('Load guides error:', error);
    }
  };

  const handleLike = async (guideId: string, isLiked: boolean) => {
    try {
      const likeId = `${user?.id}_${guideId}`;
      const likeRef = doc(db, 'tripLikes', likeId);

      if (isLiked) {
        await deleteDoc(likeRef);
        const tripRef = doc(db, 'trips', guideId);
        await updateDoc(tripRef, {
          likesCount: increment(-1),
        });
      } else {
        await setDoc(likeRef, {
          userId: user?.id,
          tripId: guideId,
          createdAt: new Date().toISOString(),
        });
        const tripRef = doc(db, 'trips', guideId);
        await updateDoc(tripRef, {
          likesCount: increment(1),
        });
      }

      setGuides((prev) =>
        prev.map((guide) =>
          guide.id === guideId
            ? {
                ...guide,
                isLiked: !isLiked,
                likesCount: isLiked
                  ? (guide.likesCount || 1) - 1
                  : (guide.likesCount || 0) + 1,
              }
            : guide
        )
      );
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGuides();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFF" />

      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Explore</Text>
          <Text style={styles.headerTitle}>Travel Stories</Text>
        </View>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={20} color="#1F2937" />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      >
        {filters.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            {filter === f && (
              <LinearGradient
                colors={['#A78BFA', '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.filterGradient}
              >
                <Text style={styles.filterTextActive}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Text>
              </LinearGradient>
            )}
            {filter !== f && (
              <Text style={styles.filterText}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {guides.map((guide) => (
          <View key={guide.id} style={styles.guideCard}>
            <View style={styles.cardHeader}>
              <View style={styles.userInfo}>
                {guide.userAvatar ? (
                  <Image source={{ uri: guide.userAvatar }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder]}>
                    <Ionicons name="person" size={16} color="#A78BFA" />
                  </View>
                )}
                <View>
                  <Text style={styles.userName}>{guide.userName}</Text>
                  <View style={styles.locationBadge}>
                    <Ionicons name="location" size={12} color="#9CA3AF" />
                    <Text style={styles.locationText}>{guide.destination}</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity style={styles.moreButton}>
                <Ionicons name="ellipsis-horizontal" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <View style={styles.imageContainer}>
              <Image
                source={{
                  uri:
                    guide.coverImage ||
                    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
                }}
                style={styles.guideImage}
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.3)']}
                style={styles.imageGradient}
              />
            </View>

            <View style={styles.cardActions}>
              <View style={styles.actionsLeft}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleLike(guide.id, guide.isLiked)}
                >
                  <Ionicons
                    name={guide.isLiked ? 'heart' : 'heart-outline'}
                    size={24}
                    color={guide.isLiked ? '#F87171' : '#1F2937'}
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="chatbubble-outline" size={22} color="#1F2937" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="paper-plane-outline" size={22} color="#1F2937" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity>
                <Ionicons name="bookmark-outline" size={22} color="#1F2937" />
              </TouchableOpacity>
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.likesText}>{guide.likesCount || 0} likes</Text>
              <Text style={styles.guideTitle}>
                <Text style={styles.guideUserName}>{guide.userName} </Text>
                {guide.title || 'Amazing travel experience'}
              </Text>
              <Text style={styles.guideDescription} numberOfLines={2}>
                {guide.description || 'Explore this beautiful destination and create unforgettable memories'}
              </Text>
              <TouchableOpacity>
                <Text style={styles.viewMore}>View all details</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={styles.aiInsightCard}>
          <LinearGradient
            colors={['#E0E7FF', '#DDD6FE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.aiInsightGradient}
          >
            <View style={styles.aiInsightHeader}>
              <View style={styles.aiIconCircle}>
                <Ionicons name="sparkles" size={20} color="#8B5CF6" />
              </View>
              <Text style={styles.aiInsightTitle}>AI Travel Tips</Text>
            </View>
            <Text style={styles.aiInsightText}>
              Based on your preferences, we recommend exploring coastal destinations in spring. Perfect weather and fewer crowds!
            </Text>
            <TouchableOpacity style={styles.aiInsightButton}>
              <Text style={styles.aiInsightButtonText}>Explore More</Text>
              <Ionicons name="arrow-forward" size={16} color="#8B5CF6" />
            </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 56,
    paddingHorizontal: 24,
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
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
  },
  filtersContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    gap: 12,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
    marginRight: 12,
  },
  filterChipActive: {
    borderWidth: 0,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  filterGradient: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterTextActive: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  guideCard: {
    marginBottom: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginHorizontal: 24,
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  avatarPlaceholder: {
    backgroundColor: '#FAF5FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  moreButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    height: width - 48,
    position: 'relative',
  },
  guideImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F9FAFB',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionsLeft: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    padding: 4,
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  likesText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  guideTitle: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 20,
  },
  guideUserName: {
    fontWeight: '700',
  },
  guideDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  viewMore: {
    fontSize: 13,
    color: '#A78BFA',
    fontWeight: '600',
  },
  aiInsightCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  aiInsightGradient: {
    padding: 24,
  },
  aiInsightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  aiIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiInsightTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  aiInsightText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 16,
  },
  aiInsightButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiInsightButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8B5CF6',
  },
});