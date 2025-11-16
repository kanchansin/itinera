import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Polyline, Marker } from 'react-native-maps';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/services/firebase';
import { doc, setDoc, updateDoc } from 'firebase/firestore';

const { width } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.100:5000/api';

const travelModes = [
  { id: 'driving', icon: 'car', label: 'Car' },
  { id: 'walking', icon: 'walk', label: 'Walk' },
  { id: 'bicycling', icon: 'bicycle', label: 'Bike' },
  { id: 'transit', icon: 'bus', label: 'Transit' },
];

interface Stop {
  id: number;
  name: string;
  estimatedTime?: string;
  distance?: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

interface LocationSuggestion {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

export default function CreateTripScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { user, accessToken } = useAuth();
  const editMode = params.editMode === 'true';
  const existingTrip = params.tripData ? JSON.parse(params.tripData as string) : null;

  const [currentStep, setCurrentStep] = useState(1);
  const [startLocation, setStartLocation] = useState(existingTrip?.startLocation || '');
  const [startTime, setStartTime] = useState(existingTrip?.startTime || '');
  const [selectedMode, setSelectedMode] = useState(existingTrip?.transport || 'driving');
  const [destinations, setDestinations] = useState<Stop[]>(existingTrip?.stops || []);
  const [newDestination, setNewDestination] = useState('');
  const [mapRoute, setMapRoute] = useState<Array<{ latitude: number; longitude: number }>>([]);
  const [startSuggestions, setStartSuggestions] = useState<LocationSuggestion[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<LocationSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [startCoords, setStartCoords] = useState<{ latitude: number; longitude: number } | null>(
    existingTrip?.stops?.[0]?.location || null
  );
  const [tripTitle, setTripTitle] = useState(existingTrip?.tripName || '');

  const totalSteps = 4;

  useEffect(() => {
    if (destinations.length >= 1 && startCoords) {
      calculateRoute();
    }
  }, [destinations, selectedMode, startCoords]);

  const searchLocations = async (query: string, isStart: boolean) => {
    if (query.length < 3) {
      if (isStart) setStartSuggestions([]);
      else setDestSuggestions([]);
      return;
    }

    setLoadingSuggestions(true);
    try {
      const response = await axios.get(`${API_URL}/destinations/search`, {
        params: { query },
      });

      const suggestions = response.data.external || [];
      if (isStart) {
        setStartSuggestions(suggestions);
      } else {
        setDestSuggestions(suggestions);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const selectStartLocation = (suggestion: LocationSuggestion) => {
    setStartLocation(suggestion.name);
    setStartCoords({
      latitude: suggestion.geometry.location.lat,
      longitude: suggestion.geometry.location.lng,
    });
    setStartSuggestions([]);
  };

  const selectDestination = (suggestion: LocationSuggestion) => {
    const newDest: Stop = {
      id: Date.now(),
      name: suggestion.name,
      location: {
        latitude: suggestion.geometry.location.lat,
        longitude: suggestion.geometry.location.lng,
      },
    };
    setDestinations([...destinations, newDest]);
    setNewDestination('');
    setDestSuggestions([]);
  };

  const addDestination = () => {
    if (newDestination.trim() && destSuggestions.length > 0) {
      selectDestination(destSuggestions[0]);
    }
  };

  const removeDestination = (id: number) => {
    setDestinations(destinations.filter((d) => d.id !== id));
  };

  const calculateRoute = async () => {
    if (!startCoords || destinations.length === 0) return;

    setRecalculating(true);
    try {
      const allPoints = [startCoords, ...destinations.map((d) => d.location)];
      
      const response = await axios.post(`${API_URL}/trips/calculate-route`, {
        stops: allPoints,
        transport: selectedMode,
      });

      if (response.data.route && response.data.route.length > 0) {
        setMapRoute(response.data.route);
      } else {
        setMapRoute(allPoints);
      }
    } catch (error) {
      console.error('Route calculation error:', error);
      setMapRoute([startCoords, ...destinations.map((d) => d.location)]);
    } finally {
      setRecalculating(false);
    }
  };

  const handleRecalculate = () => {
    calculateRoute();
  };

  const handleSaveTrip = async () => {
    if (!startLocation || !startTime || destinations.length === 0 || !tripTitle) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const tripData = {
        tripName: tripTitle,
        date: startTime,
        startLocation: startLocation,
        startTime: startTime,
        transport: selectedMode,
        stops: [
          {
            id: 0,
            name: startLocation,
            location: startCoords,
            status: 'upcoming',
          },
          ...destinations.map((dest, index) => ({
            id: index + 1,
            name: dest.name,
            location: dest.location,
            status: 'upcoming',
          })),
        ],
        userId: user?.id || '',
        destination: destinations[destinations.length - 1]?.name || startLocation,
        isPublic: false,
        createdAt: new Date().toISOString(),
      };

      // Use the correct trip ID from existing trip or generate new one
      const tripId = editMode && existingTrip?.id ? existingTrip.id : `trip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const tripRef = doc(db, 'trips', tripId);
      
      if (editMode && existingTrip?.id) {
        await updateDoc(tripRef, {
          ...tripData,
          updatedAt: new Date().toISOString(),
        });
      } else {
        await setDoc(tripRef, {
          ...tripData,
          id: tripId,
        });
      }

      Alert.alert('Success', editMode ? 'Trip updated successfully' : 'Trip created successfully');
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Save trip error:', error);
      Alert.alert('Error', `Failed to save trip: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <LinearGradient colors={['#FFFFFF', '#E8F1F8']} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0E2954" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{editMode ? 'Edit Trip' : 'Create My Trip'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.stepperContainer}>
        {[1, 2, 3, 4].map((step) => (
          <View key={step} style={styles.stepItem}>
            <View
              style={[
                styles.stepCircle,
                currentStep >= step && styles.stepCircleActive,
              ]}
            >
              <Text
                style={[
                  styles.stepNumber,
                  currentStep >= step && styles.stepNumberActive,
                ]}
              >
                {step}
              </Text>
            </View>
            {step < totalSteps && (
              <View
                style={[
                  styles.stepLine,
                  currentStep > step && styles.stepLineActive,
                ]}
              />
            )}
          </View>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {currentStep === 1 && (
          <View style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <Ionicons name="location" size={28} color="#5DA7DB" />
              <Text style={styles.stepTitle}>Start Your Journey</Text>
            </View>
            <Text style={styles.stepDescription}>
              Tell us where and when you'd like to start
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Trip Title</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="pencil" size={20} color="#5DA7DB" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter trip title"
                  placeholderTextColor="#A0B4C8"
                  value={tripTitle}
                  onChangeText={setTripTitle}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Starting Location</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="pin" size={20} color="#5DA7DB" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your starting point"
                  placeholderTextColor="#A0B4C8"
                  value={startLocation}
                  onChangeText={(text) => {
                    setStartLocation(text);
                    searchLocations(text, true);
                  }}
                />
              </View>
              {startSuggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  {startSuggestions.map((suggestion) => (
                    <TouchableOpacity
                      key={suggestion.place_id}
                      style={styles.suggestionItem}
                      onPress={() => selectStartLocation(suggestion)}
                    >
                      <Ionicons name="location" size={16} color="#5DA7DB" />
                      <View style={styles.suggestionText}>
                        <Text style={styles.suggestionName}>{suggestion.name}</Text>
                        <Text style={styles.suggestionAddress}>{suggestion.formatted_address}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Start Time</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="time" size={20} color="#5DA7DB" />
                <TextInput
                  style={styles.input}
                  placeholder="09:00 AM"
                  placeholderTextColor="#A0B4C8"
                  value={startTime}
                  onChangeText={setStartTime}
                />
              </View>
            </View>
          </View>
        )}

        {currentStep === 2 && (
          <View style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <Ionicons name="flag" size={28} color="#5DA7DB" />
              <Text style={styles.stepTitle}>Add Destinations</Text>
            </View>
            <Text style={styles.stepDescription}>
              Where would you like to visit?
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Add a Place</Text>
              <View style={styles.addDestinationRow}>
                <View style={[styles.inputWrapper, { flex: 1 }]}>
                  <Ionicons name="search" size={20} color="#5DA7DB" />
                  <TextInput
                    style={styles.input}
                    placeholder="Search destinations..."
                    placeholderTextColor="#A0B4C8"
                    value={newDestination}
                    onChangeText={(text) => {
                      setNewDestination(text);
                      searchLocations(text, false);
                    }}
                  />
                </View>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={addDestination}
                >
                  <Ionicons name="add" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              {destSuggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  {destSuggestions.map((suggestion) => (
                    <TouchableOpacity
                      key={suggestion.place_id}
                      style={styles.suggestionItem}
                      onPress={() => selectDestination(suggestion)}
                    >
                      <Ionicons name="location" size={16} color="#5DA7DB" />
                      <View style={styles.suggestionText}>
                        <Text style={styles.suggestionName}>{suggestion.name}</Text>
                        <Text style={styles.suggestionAddress}>{suggestion.formatted_address}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {destinations.length > 0 && (
              <View style={styles.destinationsList}>
                {destinations.map((dest, index) => (
                  <View key={dest.id} style={styles.destinationItem}>
                    <View style={styles.destinationNumber}>
                      <Text style={styles.destinationNumberText}>
                        {index + 1}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.destinationName}>{dest.name}</Text>
                      {dest.estimatedTime && (
                        <View style={styles.aiTag}>
                          <Ionicons name="sparkles" size={12} color="#5DA7DB" />
                          <Text style={styles.aiTagText}>
                            AI suggests: {dest.estimatedTime}
                          </Text>
                        </View>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={() => removeDestination(dest.id)}
                    >
                      <Ionicons name="close-circle" size={24} color="#FF6B6B" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {destinations.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="map" size={48} color="#A0B4C8" />
                <Text style={styles.emptyText}>
                  No destinations added yet
                </Text>
                <Text style={styles.emptySubtext}>
                  Start by adding places you'd like to visit
                </Text>
              </View>
            )}
          </View>
        )}

        {currentStep === 3 && (
          <View style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <Ionicons name="car-sport" size={28} color="#5DA7DB" />
              <Text style={styles.stepTitle}>How Will You Travel?</Text>
            </View>
            <Text style={styles.stepDescription}>
              Select your preferred mode of transport
            </Text>

            <View style={styles.travelModesGrid}>
              {travelModes.map((mode) => (
                <TouchableOpacity
                  key={mode.id}
                  style={[
                    styles.travelModeCard,
                    selectedMode === mode.id && styles.travelModeCardActive,
                  ]}
                  onPress={() => setSelectedMode(mode.id)}
                >
                  <Ionicons
                    name={mode.icon as any}
                    size={32}
                    color={selectedMode === mode.id ? '#5DA7DB' : '#A0B4C8'}
                  />
                  <Text
                    style={[
                      styles.travelModeLabel,
                      selectedMode === mode.id && styles.travelModeLabelActive,
                    ]}
                  >
                    {mode.label}
                  </Text>
                  {selectedMode === mode.id && (
                    <View style={styles.selectedBadge}>
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {currentStep === 4 && (
          <View style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <Ionicons name="eye" size={28} color="#5DA7DB" />
              <Text style={styles.stepTitle}>Trip Preview</Text>
            </View>
            <Text style={styles.stepDescription}>
              Review your trip before saving
            </Text>

            <View style={styles.previewCard}>
              <View style={styles.previewRow}>
                <Ionicons name="document-text" size={20} color="#5DA7DB" />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.previewLabel}>Trip Title</Text>
                  <Text style={styles.previewValue}>
                    {tripTitle || 'Not set'}
                  </Text>
                </View>
              </View>

              <View style={styles.previewDivider} />

              <View style={styles.previewRow}>
                <Ionicons name="location" size={20} color="#5DA7DB" />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.previewLabel}>Starting Point</Text>
                  <Text style={styles.previewValue}>
                    {startLocation || 'Not set'}
                  </Text>
                </View>
              </View>

              <View style={styles.previewDivider} />

              <View style={styles.previewRow}>
                <Ionicons name="time" size={20} color="#5DA7DB" />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.previewLabel}>Start Time</Text>
                  <Text style={styles.previewValue}>
                    {startTime || 'Not set'}
                  </Text>
                </View>
              </View>

              <View style={styles.previewDivider} />

              <View style={styles.previewRow}>
                <Ionicons name="flag" size={20} color="#5DA7DB" />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.previewLabel}>Destinations</Text>
                  <Text style={styles.previewValue}>
                    {destinations.length} places
                  </Text>
                </View>
              </View>

              <View style={styles.previewDivider} />

              <View style={styles.previewRow}>
                <Ionicons name="car-sport" size={20} color="#5DA7DB" />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.previewLabel}>Travel Mode</Text>
                  <Text style={styles.previewValue}>
                    {travelModes.find((m) => m.id === selectedMode)?.label}
                  </Text>
                </View>
              </View>
            </View>

            {startCoords && destinations.length > 0 && (
              <View style={styles.mapPreview}>
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: startCoords.latitude,
                    longitude: startCoords.longitude,
                    latitudeDelta: 0.1,
                    longitudeDelta: 0.1,
                  }}
                >
                  {mapRoute.length > 0 && (
                    <Polyline
                      coordinates={mapRoute}
                      strokeColor="#5DA7DB"
                      strokeWidth={3}
                    />
                  )}
                  <Marker
                    coordinate={startCoords}
                    pinColor="#22c55e"
                    title="Start"
                  />
                  {destinations.map((dest, index) => (
                    <Marker
                      key={dest.id}
                      coordinate={dest.location}
                      pinColor={index === destinations.length - 1 ? '#FF6B6B' : '#5DA7DB'}
                      title={dest.name}
                    />
                  ))}
                </MapView>
                <View style={styles.mapOverlay}>
                  <Ionicons name="map" size={24} color="#5DA7DB" />
                  <Text style={styles.mapOverlayText}>Route Preview</Text>
                  {recalculating && <ActivityIndicator size="small" color="#5DA7DB" />}
                </View>
                <TouchableOpacity
                  style={styles.recalculateButton}
                  onPress={handleRecalculate}
                  disabled={recalculating}
                >
                  <Ionicons name="refresh" size={20} color="#FFFFFF" />
                  <Text style={styles.recalculateButtonText}>
                    {recalculating ? 'Recalculating...' : 'Recalculate'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity 
              style={styles.generateButton}
              onPress={handleSaveTrip}
              disabled={saving}
            >
              <LinearGradient
                colors={['#5DA7DB', '#0E2954']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.generateGradient}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                    <Text style={styles.generateText}>
                      {editMode ? 'Save Changes' : 'Save Trip'}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <View style={styles.navigationContainer}>
        {currentStep > 1 && (
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => setCurrentStep(currentStep - 1)}
          >
            <Ionicons name="chevron-back" size={20} color="#5DA7DB" />
            <Text style={styles.navButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }} />
        {currentStep < totalSteps && (
          <TouchableOpacity
            style={styles.navButtonPrimary}
            onPress={() => setCurrentStep(currentStep + 1)}
          >
            <Text style={styles.navButtonPrimaryText}>Next</Text>
            <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0E2954',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F9FC',
    borderWidth: 2,
    borderColor: '#E8F1F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#5DA7DB',
    borderColor: '#5DA7DB',
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#A0B4C8',
  },
  stepNumberActive: {
    color: '#FFFFFF',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E8F1F8',
    marginHorizontal: 4,
  },
  stepLineActive: {
    backgroundColor: '#5DA7DB',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#0E2954',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0E2954',
    marginLeft: 12,
  },
  stepDescription: {
    fontSize: 14,
    color: '#A0B4C8',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
    position: 'relative',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0E2954',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F9FC',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#E8F1F8',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#0E2954',
    marginLeft: 12,
  },
  suggestionsContainer: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8F1F8',
    maxHeight: 200,
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F9FC',
  },
  suggestionText: {
    flex: 1,
    marginLeft: 12,
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0E2954',
    marginBottom: 4,
  },
  suggestionAddress: {
    fontSize: 12,
    color: '#A0B4C8',
  },
  addDestinationRow: {
    flexDirection: 'row',
    gap: 12,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#5DA7DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  destinationsList: {
    marginTop: 16,
  },
  destinationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F9FC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8F1F8',
  },
  destinationNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#5DA7DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  destinationNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  destinationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0E2954',
    marginBottom: 4,
  },
  aiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  aiTagText: {
    fontSize: 12,
    color: '#5DA7DB',
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0E2954',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#A0B4C8',
    marginTop: 4,
  },
  travelModesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  travelModeCard: {
    width: (width - 88) / 3,
    aspectRatio: 1,
    backgroundColor: '#F5F9FC',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E8F1F8',
    position: 'relative',
  },
  travelModeCardActive: {
    backgroundColor: '#EBF5FA',
    borderColor: '#5DA7DB',
  },
  travelModeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A0B4C8',
    marginTop: 8,
  },
  travelModeLabelActive: {
    color: '#5DA7DB',
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#5DA7DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewCard: {
    backgroundColor: '#F5F9FC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 12,
    color: '#A0B4C8',
    marginBottom: 4,
  },
  previewValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0E2954',
  },
  previewDivider: {
    height: 1,
    backgroundColor: '#E8F1F8',
    marginVertical: 12,
  },
  mapPreview: {
    height: 300,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mapOverlayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0E2954',
  },
  recalculateButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#5DA7DB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#0E2954',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  recalculateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  generateButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  generateGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  generateText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8F1F8',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#F5F9FC',
    gap: 4,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5DA7DB',
  },
  navButtonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#5DA7DB',
    gap: 4,
  },
  navButtonPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});