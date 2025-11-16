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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const { width } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.100:5000/api';

const popularDestinations = [
  {
    id: 1,
    name: 'Coorg, Karnataka',
    image: 'https://images.unsplash.com/photo-1587241321921-91eed3df0d29?w=800',
    description: 'Coffee plantations and misty hills',
  },
  {
    id: 2,
    name: 'Hampi, Karnataka',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800',
    description: 'Ancient ruins and temples',
  },
  {
    id: 3,
    name: 'Gokarna, Karnataka',
    image: 'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?w=800',
    description: 'Pristine beaches and spiritual vibes',
  },
];

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'nature', 'adventure', 'cultural', 'beach', 'mountains'];

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/destinations/search`, {
        params: { query: searchQuery },
      });

      const results = [
        ...(response.data.database || []),
        ...(response.data.external || []).map((place: any) => ({
          id: place.place_id,
          name: place.name,
          latitude: place.geometry?.location?.lat,
          longitude: place.geometry?.location?.lng,
          description: place.formatted_address,
          rating: place.rating,
          isExternal: true,
        })),
      ];

      setSearchResults(results);

      await getAISuggestions(searchQuery);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getAISuggestions = async (destination: string) => {
    try {
      const response = await axios.post(`${API_URL}/ai/generate-summary`, {
        title: `Trip to ${destination}`,
        destination: destination,
        stops: [],
        duration: 0,
        transport: 'car',
      });

      setAiSuggestions([
        {
          type: 'summary',
          content: response.data.summary,
        },
      ]);
    } catch (error) {
      console.error('AI suggestions error:', error);
    }
  };

  const estimateDuration = async (placeName: string) => {
    try {
      const response = await axios.post(`${API_URL}/ai/estimate-duration`, {
        placeName: placeName,
        reviews: [],
      });

      return response.data.duration;
    } catch (error) {
      console.error('Estimate duration error:', error);
      return 60;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
        <Text style={styles.headerSubtitle}>Discover new destinations with AI</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#5DA7DB" />
          <TextInput
            style={styles.searchInput}
            placeholder="Where do you want to go?"
            placeholderTextColor="#A0B4C8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#A0B4C8" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Ionicons name="sparkles" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category && styles.categoryTextActive,
              ]}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#5DA7DB" />
            <Text style={styles.loadingText}>Finding amazing places...</Text>
          </View>
        )}

        {aiSuggestions.length > 0 && !loading && (
          <View style={styles.aiSuggestionsCard}>
            <View style={styles.aiHeader}>
              <Ionicons name="sparkles" size={24} color="#5DA7DB" />
              <Text style={styles.aiTitle}>AI Recommendations</Text>
            </View>
            <Text style={styles.aiContent}>{aiSuggestions[0].content}</Text>
          </View>
        )}

        {searchResults.length > 0 && !loading && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Search Results</Text>
            {searchResults.map((result) => (
              <TouchableOpacity key={result.id} style={styles.resultCard}>
                <View style={styles.resultIcon}>
                  <Ionicons name="location" size={24} color="#5DA7DB" />
                </View>
                <View style={styles.resultContent}>
                  <Text style={styles.resultName}>{result.name}</Text>
                  {result.description && (
                    <Text style={styles.resultDescription} numberOfLines={1}>
                      {result.description}
                    </Text>
                  )}
                  {result.rating && (
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={14} color="#FFD700" />
                      <Text style={styles.ratingText}>{result.rating}</Text>
                    </View>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color="#A0B4C8" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {searchResults.length === 0 && !loading && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Popular Destinations</Text>
            </View>
            {popularDestinations.map((destination) => (
              <TouchableOpacity key={destination.id} style={styles.popularCard}>
                <Image source={{ uri: destination.image }} style={styles.popularImage} />
                <View style={styles.popularContent}>
                  <Text style={styles.popularName}>{destination.name}</Text>
                  <Text style={styles.popularDescription}>{destination.description}</Text>
                  <TouchableOpacity
                    style={styles.exploreButton}
                    onPress={() => {
                      setSearchQuery(destination.name);
                      handleSearch();
                    }}
                  >
                    <Text style={styles.exploreButtonText}>Explore with AI</Text>
                    <Ionicons name="sparkles" size={16} color="#5DA7DB" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.aiFeatureCard}>
          <View style={styles.aiFeatureHeader}>
            <Ionicons name="bulb" size={32} color="#5DA7DB" />
            <Text style={styles.aiFeatureTitle}>AI-Powered Planning</Text>
          </View>
          <Text style={styles.aiFeatureDescription}>
            Get personalized recommendations, estimated visit durations, and smart itineraries
            powered by advanced AI
          </Text>
          <View style={styles.featuresGrid}>
            <View style={styles.featureItem}>
              <Ionicons name="time" size={20} color="#5DA7DB" />
              <Text style={styles.featureText}>Duration Estimates</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="map" size={20} color="#5DA7DB" />
              <Text style={styles.featureText}>Smart Routes</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="star" size={20} color="#5DA7DB" />
              <Text style={styles.featureText}>Personalized Tips</Text>
            </View>
          </View>
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
    height: 52,
    borderWidth: 2,
    borderColor: '#E8F1F8',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#0E2954',
  },
  searchButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
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
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#F5F9FC',
    borderWidth: 1,
    borderColor: '#E8F1F8',
    marginRight: 12,
  },
  categoryChipActive: {
    backgroundColor: '#5DA7DB',
    borderColor: '#5DA7DB',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0E2954',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#5DA7DB',
    marginTop: 16,
    fontWeight: '600',
  },
  aiSuggestionsCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: '#EBF5FA',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#5DA7DB',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  aiTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0E2954',
  },
  aiContent: {
    fontSize: 15,
    color: '#0E2954',
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0E2954',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F9FC',
    gap: 12,
  },
  resultIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EBF5FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultContent: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0E2954',
    marginBottom: 4,
  },
  resultDescription: {
    fontSize: 13,
    color: '#A0B4C8',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0E2954',
  },
  popularCard: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#0E2954',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  popularImage: {
    width: 120,
    height: 120,
    backgroundColor: '#F5F9FC',
  },
  popularContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  popularName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0E2954',
    marginBottom: 4,
  },
  popularDescription: {
    fontSize: 13,
    color: '#A0B4C8',
    marginBottom: 12,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  exploreButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5DA7DB',
  },
  aiFeatureCard: {
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: '#F5F9FC',
    borderRadius: 20,
    padding: 24,
  },
  aiFeatureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  aiFeatureTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0E2954',
  },
  aiFeatureDescription: {
    fontSize: 14,
    color: '#A0B4C8',
    lineHeight: 20,
    marginBottom: 20,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  featureText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0E2954',
  },
});