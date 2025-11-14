// client/app/(tabs)/profile.tsx
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
} from 'react-native';

const myTrips = [
  {
    id: 1,
    destination: 'Coorg, Karnataka',
    image: 'https://images.unsplash.com/photo-1587241321921-91eed3df0d29?w=400',
    date: 'Nov 10-12',
    status: 'completed',
  },
  {
    id: 2,
    destination: 'Hampi, Karnataka',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400',
    date: 'Oct 28-30',
    status: 'completed',
  },
  {
    id: 3,
    destination: 'Gokarna Beach',
    image: 'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?w=400',
    date: 'Dec 5-7',
    status: 'upcoming',
  },
];

const achievements = [
  {
    id: 1,
    icon: 'airplane',
    title: 'Explorer',
    description: 'Completed 10+ trips',
    color: '#5DA7DB',
    unlocked: true,
  },
  {
    id: 2,
    icon: 'heart',
    title: 'Community Star',
    description: 'Shared 5 trip guides',
    color: '#FF6B6B',
    unlocked: true,
  },
  {
    id: 3,
    icon: 'compass',
    title: 'Adventurer',
    description: 'Visit 20 destinations',
    color: '#FFB800',
    unlocked: false,
  },
  {
    id: 4,
    icon: 'camera',
    title: 'Photographer',
    description: 'Upload 50 photos',
    color: '#A855F7',
    unlocked: false,
  },
];

const settingsItems = [
  {
    id: 1,
    icon: 'notifications',
    label: 'Notifications',
    subtitle: 'Push, Email, SMS',
    action: 'notifications',
  },
  {
    id: 2,
    icon: 'lock-closed',
    label: 'Privacy',
    subtitle: 'Data & Security',
    action: 'privacy',
  },
  {
    id: 3,
    icon: 'help-circle',
    label: 'Help & Support',
    subtitle: 'FAQs, Contact Us',
    action: 'help',
  },
  {
    id: 4,
    icon: 'information-circle',
    label: 'About',
    subtitle: 'Version 1.0.0',
    action: 'about',
  },
];

export default function ProfileScreen() {
  const { logout, user } = useAuth();
  const router = useRouter();

  const userData = user
    ? {
        name: user.name,
        email: user.email,
        totalTrips: 12,
        sharedGuides: 4,
        savedPlaces: 28,
      }
    : {
        name: 'User',
        email: 'user@example.com',
        totalTrips: 0,
        sharedGuides: 0,
        savedPlaces: 0,
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

  const handleSettingPress = (action: string) => {
    console.log('Setting pressed:', action);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7FAFC" />
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Header Section */}
        <LinearGradient
          colors={['#E8F1F8', '#F7FAFC']}
          style={styles.headerGradient}
        >
          <View style={styles.profileHeader}>
            <View style={styles.profileImageContainer}>
              <Image
                source={require('../../assets/profile.jpg')}
                style={styles.profileImage}
              />
              <View style={styles.onlineBadge} />
            </View>
            <Text style={styles.profileName}>{userData.name}</Text>
            <Text style={styles.profileEmail}>{userData.email}</Text>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="create-outline" size={18} color="#5DA7DB" />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>

          {/* Stats Row */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userData.totalTrips}</Text>
              <Text style={styles.statLabel}>Trips</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userData.sharedGuides}</Text>
              <Text style={styles.statLabel}>Shared</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userData.savedPlaces}</Text>
              <Text style={styles.statLabel}>Saved</Text>
            </View>
          </View>
        </LinearGradient>

        {/* My Trips Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Trips</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tripsScroll}
          >
            {myTrips.map((trip) => (
              <TouchableOpacity key={trip.id} style={styles.tripCard}>
                <Image source={{ uri: trip.image }} style={styles.tripImage} />
                <LinearGradient
                  colors={['transparent', 'rgba(14, 41, 84, 0.8)']}
                  style={styles.tripGradient}
                />
                {trip.status === 'upcoming' && (
                  <View style={styles.upcomingBadge}>
                    <Ionicons name="calendar" size={12} color="#FFFFFF" />
                    <Text style={styles.upcomingText}>Upcoming</Text>
                  </View>
                )}
                <View style={styles.tripInfo}>
                  <Text style={styles.tripDestination}>{trip.destination}</Text>
                  <Text style={styles.tripDate}>{trip.date}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Achievements Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.achievementsGrid}>
            {achievements.map((achievement) => (
              <View
                key={achievement.id}
                style={[
                  styles.achievementCard,
                  !achievement.unlocked && styles.achievementLocked,
                ]}
              >
                <View
                  style={[
                    styles.achievementIcon,
                    { backgroundColor: achievement.unlocked ? achievement.color : '#E8F1F8' },
                  ]}
                >
                  <Ionicons
                    name={achievement.icon as any}
                    size={24}
                    color={achievement.unlocked ? '#FFFFFF' : '#A0B4C8'}
                  />
                </View>
                <Text
                  style={[
                    styles.achievementTitle,
                    !achievement.unlocked && styles.achievementTitleLocked,
                  ]}
                >
                  {achievement.title}
                </Text>
                <Text style={styles.achievementDescription}>
                  {achievement.description}
                </Text>
                {achievement.unlocked && (
                  <View style={styles.unlockedBadge}>
                    <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.settingsList}>
            {settingsItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.settingItem,
                  index === settingsItems.length - 1 && styles.settingItemLast,
                ]}
                onPress={() => handleSettingPress(item.action)}
              >
                <View style={styles.settingIconContainer}>
                  <Ionicons name={item.icon as any} size={22} color="#5DA7DB" />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>{item.label}</Text>
                  <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#A0B4C8" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#FF6B6B" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  scrollView: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: 48,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#22c55e',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  profileName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0E2954',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#5DA7DB',
    marginBottom: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#5DA7DB',
    backgroundColor: '#FFFFFF',
    gap: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5DA7DB',
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 24,
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#0E2954',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0E2954',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#A0B4C8',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E8F1F8',
    marginHorizontal: 16,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0E2954',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5DA7DB',
  },
  tripsScroll: {
    gap: 16,
  },
  tripCard: {
    width: 180,
    height: 240,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#0E2954',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  tripImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  tripGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  upcomingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5DA7DB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 24,
    gap: 4,
  },
  upcomingText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tripInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  tripDestination: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  tripDate: {
    fontSize: 12,
    color: '#E8F1F8',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#0E2954',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  achievementLocked: {
    opacity: 0.6,
  },
  achievementIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0E2954',
    marginBottom: 4,
    textAlign: 'center',
  },
  achievementTitleLocked: {
    color: '#A0B4C8',
  },
  achievementDescription: {
    fontSize: 11,
    color: '#A0B4C8',
    textAlign: 'center',
    lineHeight: 16,
  },
  unlockedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  settingsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#0E2954',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F9FC',
  },
  settingItemLast: {
    borderBottomWidth: 0,
  },
  settingIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EBF5FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0E2954',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#A0B4C8',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderWidth: 2,
    borderColor: '#FFE8E8',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B6B',
  },
});