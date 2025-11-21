import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { improveSearchQuery, rankPlacesByPreferences } from '@/services/geminiService';
import axios from 'axios';

const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;

interface AIAutocompleteProps {
  onPlaceSelect: (place: any) => void;
  userPreferences?: any;
  placeholder?: string;
}

export default function AIAutocomplete({
  onPlaceSelect,
  userPreferences,
  placeholder = 'Search for places...',
}: AIAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiImproved, setAiImproved] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      searchPlaces(query);
    }, 500);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query]);

  const searchPlaces = async (searchQuery: string) => {
    setLoading(true);
    setAiImproved(false);

    try {
      // First, try to improve the query with AI if it seems vague
      const isVague = /peaceful|romantic|fun|nice|good|best|quiet/i.test(searchQuery);
      let finalQuery = searchQuery;

      if (isVague) {
        try {
          finalQuery = await improveSearchQuery(searchQuery);
          setAiImproved(true);
        } catch (error) {
          console.log('AI improvement failed, using original query');
        }
      }

      // Search with Google Places Autocomplete
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json`,
        {
          params: {
            input: finalQuery,
            key: GOOGLE_PLACES_API_KEY,
            types: 'establishment|geocode',
          },
        }
      );

      if (response.data.status === 'OK') {
        let places = response.data.predictions || [];

        // If user has preferences, rank the places using AI
        if (userPreferences && places.length > 0) {
          try {
            const placeDetails = await Promise.all(
              places.slice(0, 10).map(async (place: any) => {
                const details = await getPlaceDetails(place.place_id);
                return details;
              })
            );

            const rankedPlaces = await rankPlacesByPreferences(
              placeDetails,
              userPreferences
            );
            
            places = rankedPlaces.map((detail: any) => ({
              place_id: detail.place_id,
              description: detail.name,
              structured_formatting: {
                main_text: detail.name,
                secondary_text: detail.formatted_address,
              },
              ai_ranked: true,
            }));
          } catch (error) {
            console.log('AI ranking failed, using default order');
          }
        }

        setSuggestions(places);
      }
    } catch (error) {
      console.error('Autocomplete error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlaceDetails = async (placeId: string) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/details/json`,
        {
          params: {
            place_id: placeId,
            key: GOOGLE_PLACES_API_KEY,
            fields: 'name,formatted_address,geometry,types,rating,place_id',
          },
        }
      );

      if (response.data.status === 'OK') {
        return response.data.result;
      }
    } catch (error) {
      console.error('Place details error:', error);
    }
    return null;
  };

  const handlePlaceSelect = async (suggestion: any) => {
    const placeDetails = await getPlaceDetails(suggestion.place_id);
    if (placeDetails) {
      onPlaceSelect(placeDetails);
      setQuery(placeDetails.name);
      setSuggestions([]);
    }
  };

  const renderSuggestion = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handlePlaceSelect(item)}
    >
      <View style={styles.suggestionIcon}>
        <Ionicons
          name={item.ai_ranked ? 'sparkles' : 'location'}
          size={18}
          color={item.ai_ranked ? '#667eea' : '#6B7280'}
        />
      </View>
      <View style={styles.suggestionText}>
        <Text style={styles.suggestionName}>
          {item.structured_formatting?.main_text}
        </Text>
        <Text style={styles.suggestionAddress}>
          {item.structured_formatting?.secondary_text}
        </Text>
      </View>
      {item.ai_ranked && (
        <View style={styles.aiBadge}>
          <Text style={styles.aiBadgeText}>AI Match</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={query}
          onChangeText={setQuery}
        />
        {loading && (
          <ActivityIndicator size="small" color="#667eea" style={styles.loader} />
        )}
        {query.length > 0 && !loading && (
          <TouchableOpacity
            onPress={() => {
              setQuery('');
              setSuggestions([]);
            }}
            style={styles.clearButton}
          >
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {aiImproved && (
        <View style={styles.aiNotice}>
          <Ionicons name="sparkles" size={14} color="#667eea" />
          <Text style={styles.aiNoticeText}>AI enhanced your search</Text>
        </View>
      )}

      {suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.place_id}
            renderItem={renderSuggestion}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={styles.suggestionsList}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  loader: {
    marginLeft: 8,
  },
  clearButton: {
    padding: 4,
  },
  aiNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  aiNoticeText: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '600',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 72,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    zIndex: 1000,
  },
  suggestionsList: {
    maxHeight: 300,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  suggestionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  suggestionText: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  suggestionAddress: {
    fontSize: 13,
    color: '#6B7280',
  },
  aiBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
  },
  aiBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#667eea',
  },
});