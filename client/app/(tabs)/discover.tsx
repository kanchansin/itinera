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
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/services/firebase';
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc, setDoc, deleteDoc, updateDoc, increment } from 'firebase/firestore';

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
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover</Text>
        <Text style={styles.headerSubtitle}>Explore community travel guides</Text>
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
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
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
                    <Ionicons name="person" size={20} color="#A0B4C8" />
                  </View>
                )}
                <View>
                  <Text style={styles.userName}>{guide.userName}</Text>
                  <Text style={styles.timeAgo}>{guide.destination}</Text>
                </View>
              </View>
              <TouchableOpacity>
                <Ionicons name="ellipsis-horizontal" size={24} color="#A0B4C8" />
              </TouchableOpacity>
            </View>

            <Image
              source={{
                uri:
                  guide.coverImage ||
                  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
              }}
              style={styles.guideImage}
            />

            <View style={styles.cardActions}>
              <View style={styles.actionsLeft}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleLike(guide.id, guide.isLiked)}
                >
                  <Ionicons
                    name={guide.isLiked ? 'heart' : 'heart-outline'}
                    size={28}
                    color={guide.isLiked ? '#FF6B6B' : '#0E2954'}
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="chatbubble-outline" size={26} color="#0E2954" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="paper-plane-outline" size={26} color="#0E2954" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity>
                <Ionicons name="bookmark-outline" size={26} color="#0E2954" />
              </TouchableOpacity>
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.likesText}>{guide.likesCount || 0} likes</Text>
              <Text style={styles.guideTitle}>
                <Text style={styles.guideUserName}>{guide.userName} </Text>
                {guide.title}
              </Text>
              <Text style={styles.guideDescription} numberOfLines={2}>
                {guide.description || 'Explore this amazing travel guide'}
              </Text>
              <TouchableOpacity>
                <Text style={styles.viewMore}>View all details</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0E2954',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#5DA7DB',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#F5F9FC',
    borderWidth: 1,
    borderColor: '#E8F1F8',
    marginRight: 12,
  },
  filterChipActive: {
    backgroundColor: '#5DA7DB',
    borderColor: '#5DA7DB',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0E2954',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  guideCard: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
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
  },
  avatarPlaceholder: {
    backgroundColor: '#F5F9FC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0E2954',
  },
  timeAgo: {
    fontSize: 12,
    color: '#A0B4C8',
  },
  guideImage: {
    width: width,
    height: width * 1.1,
    backgroundColor: '#F5F9FC',
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
    paddingHorizontal: 20,
  },
  likesText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0E2954',
    marginBottom: 4,
  },
  guideTitle: {
    fontSize: 14,
    color: '#0E2954',
    marginBottom: 4,
  },
  guideUserName: {
    fontWeight: '700',
  },
  guideDescription: {
    fontSize: 14,
    color: '#A0B4C8',
    lineHeight: 20,
    marginBottom: 4,
  },
  viewMore: {
    fontSize: 13,
    color: '#5DA7DB',
    fontWeight: '600',
  },
});