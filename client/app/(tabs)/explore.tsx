import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Dimensions,
  StatusBar,
  StyleSheet
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Mock data for trips
const featuredTrips = [
  {
    id: 1,
    title: 'Mysore Heritage Tour',
    location: 'Mysore, Karnataka',
    duration: '2 Days',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1609920658906-8223bd289001?w=800',
    tags: ['Heritage', 'Solo']
  },
  {
    id: 2,
    title: 'Coorg Coffee Trail',
    location: 'Coorg, Karnataka',
    duration: '3 Days',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1587241321921-91eed3df0d29?w=800',
    tags: ['Nature', 'Family']
  },
  {
    id: 3,
    title: 'Gokarna Beach Retreat',
    location: 'Gokarna, Karnataka',
    duration: '2 Days',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?w=800',
    tags: ['Beach', 'Romantic']
  }
];

const communityTrips = [
  {
    id: 4,
    title: 'Weekend in Chikmagalur',
    location: 'Chikmagalur, Karnataka',
    duration: '2 Days',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
    tags: ['Weekend', 'Adventure'],
    author: 'Priya M.'
  },
  {
    id: 5,
    title: 'Hampi Ancient Wonders',
    location: 'Hampi, Karnataka',
    duration: '3 Days',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800',
    tags: ['History', 'Solo'],
    author: 'Rahul K.'
  },
  {
    id: 6,
    title: 'Wayanad Nature Escape',
    location: 'Wayanad, Kerala',
    duration: '4 Days',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?w=800',
    tags: ['Nature', 'Family'],
    author: 'Anjali S.'
  }
];

const filterOptions = ['All Trips', '2-Day Trips', 'Adventure', 'Weekend Getaway', 'Family', 'Solo'];

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All Trips');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
        <Text style={styles.headerSubtitle}>
          Discover amazing trips from our community
        </Text>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#5DA7DB" style={{ marginRight: 12 }} />
          <TextInput
            placeholder="Search destinations, trips..."
            placeholderTextColor="#A0B4C8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        {/* Filter Chips */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {filterOptions.map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => setSelectedFilter(filter)}
              style={[
                styles.filterChip,
                selectedFilter === filter && styles.filterChipActive
              ]}
            >
              <Text style={[
                styles.filterText,
                selectedFilter === filter && styles.filterTextActive
              ]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Trips Carousel */}
        <View style={{ marginBottom: 32 }}>
          <Text style={styles.sectionTitle}>Featured Trips</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContainer}
            snapToInterval={width - 80}
            decelerationRate="fast"
          >
            {featuredTrips.map((trip) => (
              <TouchableOpacity
                key={trip.id}
                style={styles.featuredCard}
              >
                <Image
                  source={{ uri: trip.image }}
                  style={StyleSheet.absoluteFill}
                />
                <LinearGradient
                  colors={['transparent', 'rgba(14, 41, 84, 0.9)']}
                  style={styles.cardGradient}
                />
                <View style={styles.cardContent}>
                  <View style={styles.tagsContainer}>
                    {trip.tags.map((tag) => (
                      <View key={tag} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                  <Text style={styles.cardTitle}>{trip.title}</Text>
                  <View style={styles.cardFooter}>
                    <Text style={styles.cardLocation}>
                      {trip.location} • {trip.duration}
                    </Text>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={16} color="#FFD700" />
                      <Text style={styles.ratingText}>{trip.rating}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Community Trips */}
        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
          <Text style={styles.sectionTitle}>Community Favorites</Text>
          {communityTrips.map((trip) => (
            <TouchableOpacity key={trip.id} style={styles.communityCard}>
              <Image
                source={{ uri: trip.image }}
                style={styles.communityImage}
              />
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.ratingBadgeText}>{trip.rating}</Text>
              </View>
              <View style={styles.communityCardContent}>
                <Text style={styles.communityTitle}>{trip.title}</Text>
                <Text style={styles.communityLocation}>
                  {trip.location} • {trip.duration}
                </Text>
                <View style={styles.communityFooter}>
                  <View style={styles.tagsRow}>
                    {trip.tags.map((tag) => (
                      <View key={tag} style={styles.communityTag}>
                        <Text style={styles.communityTagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                  <Text style={styles.authorText}>by {trip.author}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Create Button */}
      <TouchableOpacity style={styles.createButton}>
        <Ionicons name="add-circle" size={24} color="#FFFFFF" />
        <Text style={styles.createButtonText}>Create Your Trip</Text>
      </TouchableOpacity>
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
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#5DA7DB',
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
    shadowColor: '#0E2954',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E8F1F8',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#0E2954',
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
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
    fontWeight: '500',
    color: '#0E2954',
  },
  filterTextActive: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0E2954',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  carouselContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  featuredCard: {
    width: width - 80,
    height: 320,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#0E2954',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  cardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 24,
    backgroundColor: 'rgba(93, 167, 219, 0.9)',
  },
  tagText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLocation: {
    fontSize: 16,
    color: '#E8F1F8',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  communityCard: {
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#0E2954',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  communityImage: {
    width: '100%',
    height: 240,
  },
  ratingBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0E2954',
  },
  communityCardContent: {
    padding: 16,
  },
  communityTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0E2954',
    marginBottom: 8,
  },
  communityLocation: {
    fontSize: 14,
    color: '#5DA7DB',
    marginBottom: 12,
  },
  communityFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  communityTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 24,
    backgroundColor: '#F5F9FC',
    borderWidth: 1,
    borderColor: '#E8F1F8',
  },
  communityTagText: {
    fontSize: 12,
    color: '#0E2954',
    fontWeight: '500',
  },
  authorText: {
    fontSize: 12,
    color: '#A0B4C8',
    fontStyle: 'italic',
  },
  createButton: {
    position: 'absolute',
    bottom: 32,
    right: 20,
    backgroundColor: '#5DA7DB',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#5DA7DB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});