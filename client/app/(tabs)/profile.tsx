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
import { LinearGradient } from 'expo-linear-gradient';
import { db } from '@/services/firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';

const { width } = Dimensions.get('window');
const GRID_ITEM_SIZE = (width - 54) / 3;

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

  const menuItems = [
    { icon: 'settings-outline', label: 'Settings', color: '#A78BFA' },
    { icon: 'bookmark-outline', label: 'Saved', color: '#60A5FA' },
    { icon: 'heart-outline', label: 'Favorites', color: '#F87171' },
    { icon: 'notifications-outline', label: 'Notifications', color: '#FBBF24' },
    { icon: 'shield-checkmark-outline', label: 'Privacy', color: '#34D399', action: togglePrivacy },
    { icon: 'help-circle-outline', label: 'Help & Support', color: '#A78BFA' },
    { icon: 'log-out-outline', label: 'Logout', color: '#F87171', action: handleLogout },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFF" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={togglePrivacy} style={styles.lockButton}>
          <Ionicons
            name={isPrivate ? 'lock-closed' : 'lock-open'}
            size={20}
            color="#A78BFA"
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {userData?.profilePicture || user?.profilePicture ? (
              <Image source={{ uri: userData?.profilePicture || user?.profilePicture }} style={styles.avatar} />
            ) : (
              <LinearGradient
                colors={['#E0E7FF', '#DDD6FE']}
                style={[styles.avatar, styles.avatarPlaceholder]}
              >
                <Ionicons name="person" size={48} color="#8B5CF6" />
              </LinearGradient>
            )}
            <View style={styles.editAvatarButton}>
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </View>
          </View>

          <Text style={styles.profileName}>{userData?.name || user?.name || 'User'}</Text>
          {userData?.bio && <Text style={styles.profileBio}>{userData.bio}</Text>}

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{guides.length}</Text>
              <Text style={styles.statLabel}>Trips</Text>
            </View>
            <View style={styles.statDivider} />
            <TouchableOpacity style={styles.statItem}>
              <Text style={styles.statValue}>{followers}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <TouchableOpacity style={styles.statItem}>
              <Text style={styles.statValue}>{following}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
            <Ionicons name="create-outline" size={16} color="#A78BFA" />
          </TouchableOpacity>
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'guides' && styles.tabActive]}
            onPress={() => setSelectedTab('guides')}
          >
            <Ionicons
              name="grid"
              size={20}
              color={selectedTab === 'guides' ? '#A78BFA' : '#9CA3AF'}
            />
            <View style={[styles.tabIndicator, selectedTab === 'guides' && styles.tabIndicatorActive]} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'saved' && styles.tabActive]}
            onPress={() => setSelectedTab('saved')}
          >
            <Ionicons
              name="bookmark"
              size={20}
              color={selectedTab === 'saved' ? '#A78BFA' : '#9CA3AF'}
            />
            <View style={[styles.tabIndicator, selectedTab === 'saved' && styles.tabIndicatorActive]} />
          </TouchableOpacity>
        </View>

        {selectedTab === 'guides' && (
          <View style={styles.gridContainer}>
            {guides.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="images-outline" size={64} color="#C4B5FD" />
                </View>
                <Text style={styles.emptyTitle}>No Trips Yet</Text>
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
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.5)']}
                    style={styles.gridOverlay}
                  >
                    <View style={styles.gridStats}>
                      <View style={styles.gridStat}>
                        <Ionicons name="heart" size={14} color="#FFFFFF" />
                        <Text style={styles.gridStatText}>{guide.likesCount || 0}</Text>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {selectedTab === 'saved' && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="bookmark-outline" size={64} color="#C4B5FD" />
            </View>
            <Text style={styles.emptyTitle}>No Saved Trips</Text>
            <Text style={styles.emptySubtitle}>Save trips to view them later</Text>
          </View>
        )}

        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Account</Text>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.action}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: `${item.color}15` }]}>
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                </View>
                <Text style={styles.menuItemText}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </TouchableOpacity>
          ))}
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
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  lockButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FAF5FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#A78BFA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  profileBio: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    width: '100%',
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#F3F4F6',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FAF5FF',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E9D5FF',
    width: '100%',
  },
  editButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#A78BFA',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    position: 'relative',
  },
  tabActive: {
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'transparent',
  },
  tabIndicatorActive: {
    backgroundColor: '#A78BFA',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
    paddingHorizontal: 24,
  },
  gridItem: {
    width: GRID_ITEM_SIZE,
    height: GRID_ITEM_SIZE,
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F9FAFB',
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    padding: 8,
  },
  gridStats: {
    flexDirection: 'row',
    gap: 12,
  },
  gridStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  gridStatText: {
    fontSize: 12,
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
  emptyIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FAF5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  menuSection: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  menuSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
});