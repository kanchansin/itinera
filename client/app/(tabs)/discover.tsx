// client/app/(tabs)/discover.tsx - AI ENHANCED VERSION
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import axios from 'axios';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 52) / 2;
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.100:5000/api';

export default function AIDiscoverTab() {
  const [activeTab, setActiveTab] = useState('ai');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [location, setLocation] = useState<any>(null);
  const [aiRecommendations, setAiRecommendations] = useState<any>(null);

  useEffect(() => {
    loadDiscoverData();
  }, []);

  const loadDiscoverData = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);

        // Get AI recommendations
        const response = await axios.post(`${API_URL}/ai/discover-recommendations`, {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          userPreferences: {
            mood: 'adventurous',
            locationType: 'nature',
            travelerType: 'solo',
          },
        });

        setAiRecommendations(response.data);
      }
    } catch (error) {
      console.error('Load discover data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDiscoverData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Finding amazing places...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <View>
          <View style={styles.headerTop}>
            <Ionicons name="sparkles" size={24} color="#667eea" />
            <Text style={styles.headerTitle}>Discover</Text>
          </View>
          <Text style={styles.headerSubtitle}>AI-powered location recommendations</Text>
        </View>
        <TouchableOpacity style={styles.locationButton}>
          <Ionicons name="location" size={20} color="#667eea" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'ai' && styles.tabActive]}
          onPress={() => setActiveTab('ai')}
        >
          <Ionicons
            name="sparkles"
            size={18}
            color={activeTab === 'ai' ? '#FFFFFF' : '#6B7280'}
          />
          <Text style={[styles.tabText, activeTab === 'ai' && styles.tabTextActive]}>
            AI Picks
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'trending' && styles.tabActive]}
          onPress={() => setActiveTab('trending')}
        >
          <Ionicons
            name="trending-up"
            size={18}
            color={activeTab === 'trending' ? '#FFFFFF' : '#6B7280'}
          />
          <Text style={[styles.tabText, activeTab === 'trending' && styles.tabTextActive]}>
            Trending
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'seasonal' && styles.tabActive]}
          onPress={() => setActiveTab('seasonal')}
        >
          <Ionicons
            name="leaf"
            size={18}
            color={activeTab === 'seasonal' ? '#FFFFFF' : '#6B7280'}
          />
          <Text style={[styles.tabText, activeTab === 'seasonal' && styles.tabTextActive]}>
            Seasonal
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {activeTab === 'ai' && aiRecommendations && (
          <>
            <SectionHeader
              icon="sparkles"
              title="Trending Near You"
              subtitle="Popular spots right now"
            />
            <View style={styles.categoryGrid}>
              {aiRecommendations.trending?.map((item: any, index: number) => (
                <CategoryCard key={index} item={item} type="trending" />
              ))}
            </View>

            <SectionHeader
              icon="wallet"
              title="Budget-Friendly"
              subtitle="Amazing experiences without breaking the bank"
            />
            <View style={styles.categoryGrid}>
              {aiRecommendations.budgetFriendly?.map((item: any, index: number) => (
                <CategoryCard key={index} item={item} type="budget" />
              ))}
            </View>

            <SectionHeader
              icon="diamond"
              title="Hidden Gems"
              subtitle="Off-beat places locals love"
            />
            <View style={styles.categoryGrid}>
              {aiRecommendations.hiddenGems?.map((item: any, index: number) => (
                <CategoryCard key={index} item={item} type="gem" />
              ))}
            </View>
          </>
        )}

        {activeTab === 'seasonal' && aiRecommendations && (
          <>
            <SectionHeader
              icon="leaf"
              title="Perfect for This Season"
              subtitle="Best experiences for the current season"
            />
            <View style={styles.categoryGrid}>
              {aiRecommendations.seasonal?.map((item: any, index: number) => (
                <CategoryCard key={index} item={item} type="seasonal" />
              ))}
            </View>
          </>
        )}

        <View style={styles.aiInfoCard}>
          <View style={styles.aiInfoIcon}>
            <Ionicons name="information-circle" size={24} color="#667eea" />
          </View>
          <View style={styles.aiInfoContent}>
            <Text style={styles.aiInfoTitle}>Powered by AI</Text>
            <Text style={styles.aiInfoText}>
              These recommendations are personalized based on your location, preferences,
              and current trends
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const SectionHeader = ({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle: string;
}) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionHeaderLeft}>
      <View style={styles.sectionIcon}>
        <Ionicons name={icon as any} size={20} color="#667eea" />
      </View>
      <View>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      </View>
    </View>
  </View>
);

const CategoryCard = ({ item, type }: { item: any; type: string }) => {
  const getIconForCategory = (category: string) => {
    const icons: any = {
      food: 'restaurant',
      adventure: 'trail-sign',
      culture: 'library',
      nature: 'leaf',
    };
    return icons[category] || 'location';
  };

  const getColorForType = (type: string) => {
    const colors: any = {
      trending: ['#f59e0b', '#f97316'],
      budget: ['#10b981', '#059669'],
      gem: ['#8b5cf6', '#7c3aed'],
      seasonal: ['#3b82f6', '#2563eb'],
    };
    return colors[type] || ['#667eea', '#764ba2'];
  };

  return (
    <TouchableOpacity style={styles.categoryCard}>
      <LinearGradient colors={getColorForType(type)} style={styles.categoryGradient}>
        <View style={styles.categoryIcon}>
          <Ionicons name={getIconForCategory(item.category)} size={24} color="#FFFFFF" />
        </View>
        <View style={styles.categoryContent}>
          <Text style={styles.categoryName}>{item.name}</Text>
          <Text style={styles.categoryReason}>{item.reason}</Text>
          {item.estimatedCost && (
            <View style={styles.categoryMeta}>
              <Ionicons name="cash" size={14} color="#FFFFFF" />
              <Text style={styles.categoryMetaText}>{item.estimatedCost}</Text>
            </View>
          )}
          {item.distance && (
            <View style={styles.categoryMeta}>
              <Ionicons name="navigate" size={14} color="#FFFFFF" />
              <Text style={styles.categoryMetaText}>{item.distance}</Text>
            </View>
          )}
        </View>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{item.category}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
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
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#1a1a1a' },
  headerSubtitle: { fontSize: 13, color: '#666' },
  locationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    gap: 12,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  tabActive: { backgroundColor: '#667eea' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  tabTextActive: { color: '#fff' },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  sectionSubtitle: { fontSize: 13, color: '#666', marginTop: 2 },
  categoryGrid: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 12,
    height: 180,
  },
  categoryGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryContent: {
    flex: 1,
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },
  categoryReason: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
    lineHeight: 20,
  },
  categoryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  categoryMetaText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'capitalize',
  },
  aiInfoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
    padding: 16,
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
  },
  aiInfoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiInfoContent: {
    flex: 1,
  },
  aiInfoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  aiInfoText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
});