import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { db } from '@/services/firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';

const { width } = Dimensions.get('window');
const GRID_ITEM_SIZE = (width - 6) / 3;

export default function ProfileScreen() {
  const { logout, user } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [guides, setGuides] = useState<any[]>([]);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [selectedTab, setSelectedTab] = useState('guides');
  const [refreshing, setRefreshing] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userDocRef = doc(db, 'users', user?.id || '');
      const userDoc = await getDoc(userDocRef);
      const data = userDoc.data();
      setUserData(data);
      setIsPrivate(data?.isPrivate || false);

      const followersQuery = query(
        collection(db, 'followers'),
        where('followingId', '==', user?.id)
      );
      const followersSnapshot = await getDocs(followersQuery);
      setFollowers(followersSnapshot.docs.length);

      const followingQuery = query(
        collection(db, 'followers'),
        where('followerId', '==', user?.id)
      );
      const followingSnapshot = await getDocs(followingQuery);
      setFollowing(followingSnapshot.docs.length);

      const guidesQuery = query(
        collection(db, 'trips'),
        where('userId', '==', user?.id),
        where('isPublic', '==', true),
        orderBy('createdAt', 'desc')
      );
      const guidesSnapshot = await getDocs(guidesQuery);

      const guidesData = guidesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGuides(guidesData);
    } catch (error) {
      console.error('Load user data error:', error);
    }
  };

  const togglePrivacy = async () => {
    try {
      const newPrivacy = !isPrivate;
      const userDocRef = doc(db, 'users', user?.id || '');

      await updateDoc(userDocRef, {
        isPrivate: newPrivacy,
        updatedAt: new Date().toISOString(),
      });

      setIsPrivate(newPrivacy);
      Alert.alert(
        'Privacy Updated',
        newPrivacy ? 'Your account is now private' : 'Your account is now public'
      );
    } catch (error) {
      console.error('Toggle privacy error:', error);
      Alert.alert('Error', 'Failed to update privacy settings');
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <TouchableOpacity onPress={togglePrivacy}>
          <Ionicons
            name={isPrivate ? 'lock-closed' : 'lock-open'}
            size={24}
            color="#0E2954"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{userData?.name || 'Profile'}</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="menu" size={28} color="#0E2954" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              {userData?.profilePicture ? (
                <Image source={{ uri: userData.profilePicture }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Ionicons name="person" size={48} color="#A0B4C8" />
                </View>
              )}
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{guides.length}</Text>
                <Text style={styles.statLabel}>Guides</Text>
              </View>
              <TouchableOpacity style={styles.statItem}>
                <Text style={styles.statValue}>{followers}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.statItem}>
                <Text style={styles.statValue}>{following}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userData?.name || 'User'}</Text>
            {userData?.bio && <Text style={styles.profileBio}>{userData.bio}</Text>}
          </View>

          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'guides' && styles.tabActive]}
            onPress={() => setSelectedTab('guides')}
          >
            <Ionicons
              name="grid"
              size={24}
              color={selectedTab === 'guides' ? '#0E2954' : '#A0B4C8'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'saved' && styles.tabActive]}
            onPress={() => setSelectedTab('saved')}
          >
            <Ionicons
              name="bookmark"
              size={24}
              color={selectedTab === 'saved' ? '#0E2954' : '#A0B4C8'}
            />
          </TouchableOpacity>
        </View>

        {selectedTab === 'guides' && (
          <View style={styles.gridContainer}>
            {guides.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="images-outline" size={80} color="#E8F1F8" />
                <Text style={styles.emptyTitle}>No Guides Yet</Text>
                <Text style={styles.emptySubtitle}>
                  Share your travel experiences with the community
                </Text>
              </View>
            ) : (
              guides.map((guide) => (
                <TouchableOpacity key={guide.id} style={styles.gridItem}>
                  <Image
                    source={{
                      uri:
                        guide.coverImage ||
                        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
                    }}
                    style={styles.gridImage}
                  />
                  <View style={styles.gridOverlay}>
                    <View style={styles.gridStats}>
                      <View style={styles.gridStat}>
                        <Ionicons name="heart" size={16} color="#FFFFFF" />
                        <Text style={styles.gridStatText}>{guide.likesCount || 0}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {selectedTab === 'saved' && (
          <View style={styles.emptyState}>
            <Ionicons name="bookmark-outline" size={80} color="#E8F1F8" />
            <Text style={styles.emptyTitle}>No Saved Guides</Text>
            <Text style={styles.emptySubtitle}>Save guides to view them later</Text>
          </View>
        )}

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0E2954',
  },
  content: {
    flex: 1,
  },
  profileSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    marginRight: 24,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  avatarPlaceholder: {
    backgroundColor: '#F5F9FC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0E2954',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#A0B4C8',
  },
  profileInfo: {
    marginBottom: 16,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0E2954',
    marginBottom: 4,
  },
  profileBio: {
    fontSize: 14,
    color: '#0E2954',
    lineHeight: 20,
  },
  editButton: {
    backgroundColor: '#F5F9FC',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8F1F8',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0E2954',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E8F1F8',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#0E2954',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
  },
  gridItem: {
    width: GRID_ITEM_SIZE,
    height: GRID_ITEM_SIZE,
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F9FC',
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
  },
  gridStats: {
    flexDirection: 'row',
    gap: 16,
  },
  gridStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  gridStatText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
    width: '100%',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0E2954',
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#A0B4C8',
    textAlign: 'center',
    lineHeight: 20,
  },
});