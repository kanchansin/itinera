// client/app/(tabs)/profile.tsx - ENHANCED VERSION
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
    { 
      icon: 'settings-outline', 
      label: 'Settings', 
      gradient: ['#667eea', '#764ba2'],
      action: () => {} 
    },
    { 
      icon: 'bookmark-outline', 
      label: 'Saved Trips', 
      gradient: ['#10B981', '#059669'],
      action: () => {} 
    },
    { 
      icon: 'heart-outline', 
      label: 'Favorites', 
      gradient: ['#EF4444', '#DC2626'],
      action: () => {} 
    },
    { 
      icon: 'notifications-outline', 
      label: 'Notifications', 
      gradient: ['#F59E0B', '#D97706'],
      action: () => {} 
    },
    { 
      icon: 'shield-checkmark-outline', 
      label: 'Privacy', 
      gradient: ['#8B5CF6', '#7C3AED'],
      action: togglePrivacy 
    },
    { 
      icon: 'help-circle-outline', 
      label: 'Help & Support', 
      gradient: ['#3B82F6', '#2563EB'],
      action: () => {} 
    },
    { 
      icon: 'log-out-outline', 
      label: 'Logout', 
      gradient: ['#EF4444', '#DC2626'],
      action: handleLogout 
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />

      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity onPress={togglePrivacy} style={styles.lockButton}>
            <Ionicons
              name={isPrivate ? 'lock-closed' : 'lock-open'}
              size={20}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {userData?.profilePicture || user?.profilePicture ? (
              <Image 
                source={{ uri: userData?.profilePicture || user?.profilePicture }} 
                style={styles.avatar} 
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={48} color="#667eea" />
              </View>
            )}
            <TouchableOpacity style={styles.editAvatarButton}>
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.profileName}>{userData?.name || user?.name || 'User'}</Text>
          {userData?.bio && <Text style={styles.profileBio}>{userData.bio}</Text>}
        </View>
      </LinearGradient>

      <View style={styles.statsCard}>
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

      <TouchableOpacity style={styles.editProfileButton}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.editGradient}
        >
          <Ionicons name="create-outline" size={18} color="#FFFFFF" />
          <Text style={styles.editProfileText}>Edit Profile</Text>
        </LinearGradient>
      </TouchableOpacity>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'guides' && styles.tabActive]}
            onPress={() => setSelectedTab('guides')}
          >
            <Ionicons
              name="grid"
              size={20}
              color={selectedTab === 'guides' ? '#667eea' : '#9CA3AF'}
            />
            <Text style={[styles.tabText, selectedTab === 'guides' && styles.tabTextActive]}>
              Trips
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'saved' && styles.tabActive]}
            onPress={() => setSelectedTab('saved')}
          >
            <Ionicons
              name="bookmark"
              size={20}
              color={selectedTab === 'saved' ? '#667eea' : '#9CA3AF'}
            />
            <Text style={[styles.tabText, selectedTab === 'saved' && styles.tabTextActive]}>
              Saved
            </Text>
          </TouchableOpacity>
        </View>

        {selectedTab === 'guides' && (
          <View style={styles.gridContainer}>
            {guides.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="map-outline" size={64} color="#667eea" />
                </View>
                <Text style={styles.emptyTitle}>No Public Trips Yet</Text>
                <Text style={styles.emptySubtitle}>
                  Share your travel experiences with the community
                </Text>
                <TouchableOpacity 
                  style={styles.createTripButton}
                  onPress={() => router.push('/(tabs)/ai-trip-creator')}
                >
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.createTripGradient}
                  >
                    <Ionicons name="add" size={20} color="#FFFFFF" />
                    <Text style={styles.createTripText}>Create Trip</Text>
                  </LinearGradient>
                </TouchableOpacity>
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
                    colors={['transparent', 'rgba(0,0,0,0.6)']}
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
              <Ionicons name="bookmark-outline" size={64} color="#667eea" />
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
                <LinearGradient
                  colors={item.gradient}
                  style={styles.menuIconGradient}
                >
                  <Ionicons name={item.icon as any} size={20} color="#FFFFFF" />
                </LinearGradient>
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
    backgroundColor: '#FAFAFA',
  },
  headerGradient: {
    paddingTop: 56,
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  lockButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  profileBio: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    marginTop: -20,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
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
  editProfileButton: {
    marginHorizontal: 24,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  editGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  editProfileText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    marginTop: 24,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  tabActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#667eea',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  tabTextActive: {
    color: '#667eea',
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
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#EEF2FF',
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
    marginBottom: 24,
  },
  createTripButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  createTripGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  createTripText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  menuSection: {
    paddingHorizontal: 24,
    marginTop: 32,
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
    shadowColor: '#000',
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
  menuIconGradient: {
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