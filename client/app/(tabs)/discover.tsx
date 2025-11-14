import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const categories = [
  { id: 1, name: 'All', icon: 'grid' },
  { id: 2, name: 'Nature', icon: 'leaf' },
  { id: 3, name: 'Culture', icon: 'color-palette' },
  { id: 4, name: 'Adventure', icon: 'bonfire' },
  { id: 5, name: 'Food', icon: 'restaurant' },
];

const popularPlaces = [
  {
    id: 1,
    name: 'Nandi Hills',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800',
    rating: 4.8,
    distance: '60 km',
    avgTime: '3-4 hours',
    category: 'Nature',
    saved: false,
  },
  {
    id: 2,
    name: 'Wonderla',
    image: 'https://images.unsplash.com/photo-1594623930572-300a3011d9ae?w=800',
    rating: 4.7,
    distance: '28 km',
    avgTime: '6-8 hours',
    category: 'Adventure',
    saved: false,
  },
  {
    id: 3,
    name: 'VV Puram Food Street',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
    rating: 4.9,
    distance: '8 km',
    avgTime: '2-3 hours',
    category: 'Food',
    saved: true,
  },
];

const hiddenGems = [
  {
    id: 4,
    name: 'Devanahalli Fort',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800',
    rating: 4.5,
    distance: '45 km',
    avgTime: '1-2 hours',
    category: 'Culture',
  },
  {
    id: 5,
    name: 'Hesaraghatta Lake',
    image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800',
    rating: 4.6,
    distance: '32 km',
    avgTime: '2-3 hours',
    category: 'Nature',
  },
];

const localsRecommend = [
  {
    id: 6,
    name: 'Sankey Tank',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    rating: 4.4,
    distance: '5 km',
    avgTime: '1-2 hours',
    category: 'Nature',
    description: 'Perfect for evening walks',
  },
  {
    id: 7,
    name: 'Tipu Sultan Fort',
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800',
    rating: 4.7,
    distance: '12 km',
    avgTime: '1.5 hours',
    category: 'Culture',
    description: 'Historical monument',
  },
  {
    id: 8,
    name: 'Pottery Town',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
    rating: 4.6,
    distance: '7 km',
    avgTime: '2 hours',
    category: 'Culture',
    description: 'Traditional crafts hub',
  },
];

export default function DiscoverScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [savedPlaces, setSavedPlaces] = useState<Set<number>>(new Set([3]));

  const toggleSave = (placeId: number) => {
    setSavedPlaces((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(placeId)) {
        newSet.delete(placeId);
      } else {
        newSet.add(placeId);
      }
      return newSet;
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Discover</Text>
          <Text style={styles.headerSubtitle}>
            Find amazing places around you
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#5DA7DB" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search places, attractions..."
            placeholderTextColor="#A0B4C8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options" size={24} color="#5DA7DB" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.locationButton}>
          <Ionicons name="navigate" size={24} color="#5DA7DB" />
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              selectedCategory === category.name && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(category.name)}
          >
            <Ionicons
              name={category.icon as any}
              size={18}
              color={
                selectedCategory === category.name ? '#FFFFFF' : '#5DA7DB'
              }
            />
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.name && styles.categoryTextActive,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Popular Now */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Now</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {popularPlaces.map((place) => (
              <TouchableOpacity key={place.id} style={styles.popularCard}>
                <Image source={{ uri: place.image }} style={styles.popularImage} />
                <LinearGradient
                  colors={['transparent', 'rgba(14, 41, 84, 0.8)']}
                  style={styles.popularGradient}
                />
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={() => toggleSave(place.id)}
                >
                  <Ionicons
                    name={savedPlaces.has(place.id) ? 'heart' : 'heart-outline'}
                    size={24}
                    color={savedPlaces.has(place.id) ? '#FF6B6B' : '#FFFFFF'}
                  />
                </TouchableOpacity>
                <View style={styles.popularContent}>
                  <Text style={styles.popularName}>{place.name}</Text>
                  <View style={styles.popularInfo}>
                    <View style={styles.infoItem}>
                      <Ionicons name="star" size={14} color="#FFD700" />
                      <Text style={styles.infoText}>{place.rating}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Ionicons name="location" size={14} color="#FFFFFF" />
                      <Text style={styles.infoText}>{place.distance}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Ionicons name="time" size={14} color="#FFFFFF" />
                      <Text style={styles.infoText}>{place.avgTime}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Hidden Gems */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Hidden Gems</Text>
              <Text style={styles.sectionSubtitle}>
                Off the beaten path 💎
              </Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.verticalList}>
            {hiddenGems.map((place) => (
              <TouchableOpacity key={place.id} style={styles.listCard}>
                <Image source={{ uri: place.image }} style={styles.listImage} />
                <View style={styles.listContent}>
                  <Text style={styles.listTitle}>{place.name}</Text>
                  <View style={styles.listInfo}>
                    <View style={styles.infoRow}>
                      <Ionicons name="star" size={14} color="#FFD700" />
                      <Text style={styles.listInfoText}>{place.rating}</Text>
                      <Text style={styles.listDivider}>•</Text>
                      <Ionicons name="location" size={14} color="#5DA7DB" />
                      <Text style={styles.listInfoText}>{place.distance}</Text>
                    </View>
                    <View style={styles.timeTag}>
                      <Ionicons name="time" size={12} color="#5DA7DB" />
                      <Text style={styles.timeText}>{place.avgTime}</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity onPress={() => toggleSave(place.id)}>
                  <Ionicons
                    name={savedPlaces.has(place.id) ? 'heart' : 'heart-outline'}
                    size={24}
                    color={savedPlaces.has(place.id) ? '#FF6B6B' : '#A0B4C8'}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Locals Recommend */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Locals Recommend</Text>
              <Text style={styles.sectionSubtitle}>
                Trusted by residents 🌟
              </Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {localsRecommend.map((place) => (
              <TouchableOpacity key={place.id} style={styles.recommendCard}>
                <Image source={{ uri: place.image }} style={styles.recommendImage} />
                <LinearGradient
                  colors={['transparent', 'rgba(14, 41, 84, 0.9)']}
                  style={styles.recommendGradient}
                />
                <View style={styles.localBadge}>
                  <Ionicons name="people" size={12} color="#FFFFFF" />
                  <Text style={styles.localBadgeText}>Local Pick</Text>
                </View>
                <TouchableOpacity
                  style={styles.saveButtonSmall}
                  onPress={() => toggleSave(place.id)}
                >
                  <Ionicons
                    name={savedPlaces.has(place.id) ? 'heart' : 'heart-outline'}
                    size={20}
                    color={savedPlaces.has(place.id) ? '#FF6B6B' : '#FFFFFF'}
                  />
                </TouchableOpacity>
                <View style={styles.recommendContent}>
                  <Text style={styles.recommendName}>{place.name}</Text>
                  <Text style={styles.recommendDesc}>{place.description}</Text>
                  <View style={styles.recommendInfo}>
                    <View style={styles.infoItem}>
                      <Ionicons name="star" size={12} color="#FFD700" />
                      <Text style={styles.recommendInfoText}>{place.rating}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Ionicons name="location" size={12} color="#FFFFFF" />
                      <Text style={styles.recommendInfoText}>{place.distance}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
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
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0E2954',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#5DA7DB',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F9FC',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: '#E8F1F8',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#0E2954',
    marginLeft: 12,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F9FC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8F1F8',
  },
  locationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#5DA7DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#F5F9FC',
    borderWidth: 1,
    borderColor: '#E8F1F8',
    gap: 6,
    marginRight: 12,
  },
  categoryChipActive: {
    backgroundColor: '#5DA7DB',
    borderColor: '#5DA7DB',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5DA7DB',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0E2954',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#A0B4C8',
    marginTop: 2,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5DA7DB',
  },
  horizontalScroll: {
    paddingHorizontal: 20,
    gap: 16,
  },
  popularCard: {
    width: 280,
    height: 320,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#0E2954',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  popularImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  popularGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  saveButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  popularContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  popularName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  popularInfo: {
    flexDirection: 'row',
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  verticalList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  listCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#0E2954',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    padding: 12,
    gap: 12,
  },
  listImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  listContent: {
    flex: 1,
    justifyContent: 'center',
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0E2954',
    marginBottom: 8,
  },
  listInfo: {
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  listInfoText: {
    fontSize: 14,
    color: '#0E2954',
    fontWeight: '500',
  },
  listDivider: {
    fontSize: 14,
    color: '#A0B4C8',
    marginHorizontal: 4,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#EBF5FA',
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  timeText: {
    fontSize: 12,
    color: '#5DA7DB',
    fontWeight: '600',
  },
  recommendCard: {
    width: 200,
    height: 280,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#0E2954',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  recommendImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  recommendGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  localBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 24,
    backgroundColor: 'rgba(93, 167, 219, 0.9)',
  },
  localBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  saveButtonSmall: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  recommendName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  recommendDesc: {
    fontSize: 12,
    color: '#E8F1F8',
    marginBottom: 8,
  },
  recommendInfo: {
    flexDirection: 'row',
    gap: 12,
  },
  recommendInfoText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});