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
  View
} from 'react-native';

export default function Profile() {
  const { logout, user } = useAuth();
  const router = useRouter();
  
  const userData = user ? {
    name: user.name,
    email: user.email,
    phone: "+91 70814 99993",
    joinDate: "March 2023",
    totalTrips: 12,
    upcomingTrips: 2,
    savedPlans: 5,
  } : {
    name: "User",
    email: "user@example.com",
    phone: "+91 XXXXXXXXXX",
    joinDate: "Now",
    totalTrips: 0,
    upcomingTrips: 0,
    savedPlans: 0,
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => {
            logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const menuItems = [
    { icon: "map", label: "My Trips", onPress: () => {} },
    { icon: "bookmark", label: "Saved Plans", onPress: () => {} },
    { icon: "settings", label: "Settings", onPress: () => {} },
    { icon: "help-circle", label: "Help & Support", onPress: () => {} },
    { icon: "information-circle", label: "About", onPress: () => {} },
  ];
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#22c55e', '#000000']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.6 }}
      >
        <ScrollView bounces={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.profileInfo}>
              <Image
                source={require('../../assets/profile.jpg')}
                style={styles.avatar}
              />
              <View style={styles.nameContainer}>
                <Text style={styles.name}>{userData.name}</Text>
                <Text style={styles.email}>{userData.email}</Text>
                <View style={styles.membershipContainer}>
                  <Ionicons name="leaf" size={16} color="#4ade80" />
                  <Text style={styles.membershipText}>Eco-Traveler</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {}}
              >
                <Ionicons name="pencil" size={20} color="#22c55e" />
              </TouchableOpacity>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userData.totalTrips}</Text>
                <Text style={styles.statLabel}>Total Trips</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userData.upcomingTrips}</Text>
                <Text style={styles.statLabel}>Upcoming</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userData.savedPlans}</Text>
                <Text style={styles.statLabel}>Saved Plans</Text>
              </View>
            </View>

            <View style={styles.contactContainer}>
              <View style={styles.contactItem}>
                <View style={styles.contactIconContainer}>
                  <Ionicons name="call-outline" size={20} color="#22c55e" />
                </View>
                <View>
                  <Text style={styles.contactLabel}>Phone Number</Text>
                  <Text style={styles.contactValue}>{userData.phone}</Text>
                </View>
              </View>
              <View style={[styles.contactItem, { marginBottom: 0 }]}>
                <View style={styles.contactIconContainer}>
                  <Ionicons name="calendar-outline" size={20} color="#22c55e" />
                </View>
                <View>
                  <Text style={styles.contactLabel}>Member Since</Text>
                  <Text style={styles.contactValue}>{userData.joinDate}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.menuContainer}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.label}
                style={[
                  styles.menuItem,
                  index === menuItems.length - 1 && styles.menuItemLast,
                ]}
                onPress={item.onPress}
              >
                <View style={styles.menuItemContent}>
                  <View style={styles.menuItemLeft}>
                    <View style={styles.menuIconContainer}>
                      <Ionicons name={item.icon as any} size={24} color="#22c55e" />
                    </View>
                    <Text style={styles.menuItemLabel}>{item.label}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out" size={24} color="#ef4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    padding: 24,
    paddingTop: 48,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#414543ff',
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 8,
  },
  membershipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2f2f2f',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  membershipText: {
    color: '#22c55e',
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  editButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#1f2937',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#22c55e',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#374151',
    marginHorizontal: 12,
  },
  contactContainer: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  contactIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  menuContainer: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    marginHorizontal: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemLabel: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginHorizontal: 24,
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ef4444',
    marginLeft: 8,
  },
});