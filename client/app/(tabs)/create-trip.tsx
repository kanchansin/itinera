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
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Polyline, Marker } from 'react-native-maps';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/services/firebase';
import { doc, setDoc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const { width } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.100:5000/api';
const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;

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

interface PlaceSuggestion {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
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
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedMode, setSelectedMode] = useState(existingTrip?.transport || 'driving');
  const [destinations, setDestinations] = useState<Stop[]>(existingTrip?.stops || []);
  const [newDestination, setNewDestination] = useState('');
  const [mapRoute, setMapRoute] = useState<Array<{ latitude: number; longitude: number }>>([]);
  const [startSuggestions, setStartSuggestions] = useState<PlaceSuggestion[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [startCoords, setStartCoords] = useState<{ latitude: number; longitude: number } | null>(
    existingTrip?.stops?.[0]?.location || null
  );
  const [tripTitle, setTripTitle] = useState(existingTrip?.tripName || '');
  const [showStartSuggestions, setShowStartSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);

  const totalSteps = 4;

  useEffect(() => {
    if (destinations.length >= 1 && startCoords) {
      calculateRoute();
    }
  }, [destinations, selectedMode, startCoords]);

  const searchPlacesAutocomplete = async (query: string, isStart: boolean) => {
    if (query.length < 3) {
      if (isStart) {
        setStartSuggestions([]);
        setShowStartSuggestions(false);
      } else {
        setDestSuggestions([]);
        setShowDestSuggestions(false);
      }
      return;
    }

    setLoadingSuggestions(true);
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json`,
        {
          params: {
            input: query,
            key: GOOGLE_PLACES_API_KEY,
            types: 'establishment|geocode',
          },
        }
      );

      if (response.data.status === 'OK') {
        const suggestions = response.data.predictions || [];
        if (isStart) {
          setStartSuggestions(suggestions);
          setShowStartSuggestions(true);
        } else {
          setDestSuggestions(suggestions);
          setShowDestSuggestions(true);
        }
      } else if (response.data.status === 'REQUEST_DENIED') {
        Alert.alert('Error', 'Google Places API access denied. Please check your API key.');
      }
    } catch (error) {
      console.error('Autocomplete error:', error);
      Alert.alert('Error', 'Failed to fetch location suggestions');
    } finally {
      setLoadingSuggestions(false);
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
            fields: 'name,formatted_address,geometry',
          },
        }
      );

      if (response.data.status === 'OK') {
        return response.data.result;
      } else {
        throw new Error('Failed to get place details');
      }
    } catch (error) {
      console.error('Place details error:', error);
      throw error;
    }
  };

  const selectStartLocation = async (suggestion: PlaceSuggestion) => {
    try {
      const placeDetails = await getPlaceDetails(suggestion.place_id);
      setStartLocation(placeDetails.name);
      setStartCoords({
        latitude: placeDetails.geometry.location.lat,
        longitude: placeDetails.geometry.location.lng,
      });
      setShowStartSuggestions(false);
      setStartSuggestions([]);
    } catch (error) {
      Alert.alert('Error', 'Failed to select location');
    }
  };

  const selectDestination = async (suggestion: PlaceSuggestion) => {
    try {
      const placeDetails = await getPlaceDetails(suggestion.place_id);
      const newDest: Stop = {
        id: Date.now(),
        name: placeDetails.name,
        location: {
          latitude: placeDetails.geometry.location.lat,
          longitude: placeDetails.geometry.location.lng,
        },
      };
      setDestinations([...destinations, newDest]);
      setNewDestination('');
      setShowDestSuggestions(false);
      setDestSuggestions([]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add destination');
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

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setStartTime(selectedDate);
    }
  };

  const handleSaveTrip = async () => {
    if (!startLocation || !tripTitle || destinations.length === 0) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    if (!startCoords) {
      Alert.alert('Error', 'Starting location coordinates not found');
      return;
    }

    setSaving(true);
    try {
      const tripId = editMode && existingTrip?.id
        ? existingTrip.id
        : `trip_${user.id}_${Date.now()}`;

      const tripData = {
        id: tripId,
        tripName: tripTitle,
        date: formatTime(startTime),
        startLocation: startLocation,
        startTime: formatTime(startTime),
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
        userId: user.id,
        destination: destinations[destinations.length - 1]?.name || startLocation,
        isPublic: false,
        likesCount: 0,
        createdAt: editMode && existingTrip?.createdAt ? existingTrip.createdAt : serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const tripRef = doc(db, 'trips', tripId);

      if (editMode && existingTrip?.id) {
        const tripSnapshot = await getDoc(tripRef);
        if (!tripSnapshot.exists()) {
          throw new Error('Trip not found');
        }

        const existingData = tripSnapshot.data();
        if (existingData.userId !== user.id) {
          throw new Error('Not authorized to update this trip');
        }

        await updateDoc(tripRef, {
          tripName: tripData.tripName,
          date: tripData.date,
          startLocation: tripData.startLocation,
          startTime: tripData.startTime,
          transport: tripData.transport,
          stops: tripData.stops,
          destination: tripData.destination,
          updatedAt: tripData.updatedAt,
        });
      } else {
        await setDoc(tripRef, tripData);
      }

      Alert.alert('Success', editMode ? 'Trip updated successfully' : 'Trip created successfully');
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Save trip error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Error', `Failed to save trip: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />

      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{editMode ? 'Edit Trip' : 'Create Trip'}</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(currentStep / totalSteps) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            Step {currentStep} of {totalSteps}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
        {currentStep === 1 && (
          <View style={styles.stepCard}>
            <View style={styles.stepIconContainer}>
              <Ionicons name="location" size={32} color="#667eea" />
            </View>
            <Text style={styles.stepTitle}>Start Your Journey</Text>
            <Text style={styles.stepDescription}>
              Tell us where and when you'd like to begin
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Trip Title</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="pencil" size={20} color="#667eea" />
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Weekend Getaway"
                  placeholderTextColor="#9CA3AF"
                  value={tripTitle}
                  onChangeText={setTripTitle}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Starting Location</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="pin" size={20} color="#667eea" />
                <TextInput
                  style={styles.input}
                  placeholder="Search for starting point"
                  placeholderTextColor="#9CA3AF"
                  value={startLocation}
                  onChangeText={(text) => {
                    setStartLocation(text);
                    searchPlacesAutocomplete(text, true);
                  }}
                  onFocus={() => {
                    if (startSuggestions.length > 0) {
                      setShowStartSuggestions(true);
                    }
                  }}
                />
                {loadingSuggestions && (
                  <ActivityIndicator size="small" color="#667eea" />
                )}
              </View>
              {showStartSuggestions && startSuggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  <ScrollView style={styles.suggestionsList} nestedScrollEnabled>
                    {startSuggestions.map((suggestion) => (
                      <TouchableOpacity
                        key={suggestion.place_id}
                        style={styles.suggestionItem}
                        onPress={() => selectStartLocation(suggestion)}
                      >
                        <View style={styles.suggestionIcon}>
                          <Ionicons name="location" size={18} color="#667eea" />
                        </View>
                        <View style={styles.suggestionText}>
                          <Text style={styles.suggestionName}>
                            {suggestion.structured_formatting.main_text}
                          </Text>
                          <Text style={styles.suggestionAddress}>
                            {suggestion.structured_formatting.secondary_text}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Start Time</Text>
              <TouchableOpacity
                style={styles.inputWrapper}
                onPress={() => setShowTimePicker(true)}
              >
                <Ionicons name="time" size={20} color="#667eea" />
                <Text style={styles.timeText}>{formatTime(startTime)}</Text>
                <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={startTime}
                  mode="time"
                  is24Hour={false}
                  display="default"
                  onChange={handleTimeChange}
                />
              )}
            </View>
          </View>
        )}

        {currentStep === 2 && (
          <View style={styles.stepCard}>
            <View style={styles.stepIconContainer}>
              <Ionicons name="flag" size={32} color="#667eea" />
            </View>
            <Text style={styles.stepTitle}>Add Destinations</Text>
            <Text style={styles.stepDescription}>
              Where would you like to visit?
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Search Places</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="search" size={20} color="#667eea" />
                <TextInput
                  style={styles.input}
                  placeholder="Search destinations..."
                  placeholderTextColor="#9CA3AF"
                  value={newDestination}
                  onChangeText={(text) => {
                    setNewDestination(text);
                    searchPlacesAutocomplete(text, false);
                  }}
                  onFocus={() => {
                    if (destSuggestions.length > 0) {
                      setShowDestSuggestions(true);
                    }
                  }}
                />
                {loadingSuggestions && (
                  <ActivityIndicator size="small" color="#667eea" />
                )}
              </View>
              {showDestSuggestions && destSuggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  <ScrollView style={styles.suggestionsList} nestedScrollEnabled>
                    {destSuggestions.map((suggestion) => (
                      <TouchableOpacity
                        key={suggestion.place_id}
                        style={styles.suggestionItem}
                        onPress={() => selectDestination(suggestion)}
                      >
                        <View style={styles.suggestionIcon}>
                          <Ionicons name="location" size={18} color="#667eea" />
                        </View>
                        <View style={styles.suggestionText}>
                          <Text style={styles.suggestionName}>
                            {suggestion.structured_formatting.main_text}
                          </Text>
                          <Text style={styles.suggestionAddress}>
                            {suggestion.structured_formatting.secondary_text}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {destinations.length > 0 && (
              <View style={styles.destinationsList}>
                <Text style={styles.destinationsHeader}>Your Destinations</Text>
                {destinations.map((dest, index) => (
                  <View key={dest.id} style={styles.destinationItem}>
                    <View style={styles.destinationNumber}>
                      <Text style={styles.destinationNumberText}>
                        {index + 1}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.destinationName}>{dest.name}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => removeDestination(dest.id)}
                      style={styles.removeButton}
                    >
                      <Ionicons name="close-circle" size={24} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {destinations.length === 0 && (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="map" size={48} color="#667eea" />
                </View>
                <Text style={styles.emptyText}>
                  No destinations added yet
                </Text>
                <Text style={styles.emptySubtext}>
                  Start by searching for places you'd like to visit
                </Text>
              </View>
            )}
          </View>
        )}

        {currentStep === 3 && (
          <View style={styles.stepCard}>
            <View style={styles.stepIconContainer}>
              <Ionicons name="car-sport" size={32} color="#667eea" />
            </View>
            <Text style={styles.stepTitle}>Travel Mode</Text>
            <Text style={styles.stepDescription}>
              How will you get around?
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
                  <View style={[
                    styles.travelModeIcon,
                    selectedMode === mode.id && styles.travelModeIconActive
                  ]}>
                    <Ionicons
                      name={mode.icon as any}
                      size={28}
                      color={selectedMode === mode.id ? '#FFFFFF' : '#667eea'}
                    />
                  </View>
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
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {currentStep === 4 && (
          <View style={styles.stepCard}>
            <View style={styles.stepIconContainer}>
              <Ionicons name="checkmark-circle" size={32} color="#667eea" />
            </View>
            <Text style={styles.stepTitle}>Review & Save</Text>
            <Text style={styles.stepDescription}>
              Everything looks good?
            </Text>

            <View style={styles.previewCard}>
              <View style={styles.previewRow}>
                <View style={styles.previewIcon}>
                  <Ionicons name="document-text" size={20} color="#667eea" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.previewLabel}>Trip Title</Text>
                  <Text style={styles.previewValue}>
                    {tripTitle || 'Not set'}
                  </Text>
                </View>
              </View>

              <View style={styles.previewDivider} />

              <View style={styles.previewRow}>
                <View style={styles.previewIcon}>
                  <Ionicons name="location" size={20} color="#667eea" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.previewLabel}>Starting Point</Text>
                  <Text style={styles.previewValue}>
                    {startLocation || 'Not set'}
                  </Text>
                </View>
              </View>

              <View style={styles.previewDivider} />

              <View style={styles.previewRow}>
                <View style={styles.previewIcon}>
                  <Ionicons name="time" size={20} color="#667eea" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.previewLabel}>Start Time</Text>
                  <Text style={styles.previewValue}>
                    {formatTime(startTime)}
                  </Text>
                </View>
              </View>

              <View style={styles.previewDivider} />

              <View style={styles.previewRow}>
                <View style={styles.previewIcon}>
                  <Ionicons name="flag" size={20} color="#667eea" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.previewLabel}>Destinations</Text>
                  <Text style={styles.previewValue}>
                    {destinations.length} {destinations.length === 1 ? 'place' : 'places'}
                  </Text>
                </View>
              </View>

              <View style={styles.previewDivider} />

              <View style={styles.previewRow}>
                <View style={styles.previewIcon}>
                  <Ionicons name="car-sport" size={20} color="#667eea" />
                </View>
                <View style={{ flex: 1 }}>
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
                      strokeColor="#667eea"
                      strokeWidth={4}
                    />
                  )}
                  <Marker
                    coordinate={startCoords}
                    pinColor="#10B981"
                    title="Start"
                  />
                  {destinations.map((dest, index) => (
                    <Marker
                      key={dest.id}
                      coordinate={dest.location}
                      pinColor={index === destinations.length - 1 ? '#EF4444' : '#667eea'}
                      title={dest.name}
                    />
                  ))}
                </MapView>
                <View style={styles.mapOverlay}>
                  <View style={styles.mapOverlayIcon}>
                    <Ionicons name="map" size={20} color="#667eea" />
                  </View>
                  <Text style={styles.mapOverlayText}>Route Preview</Text>
                  {recalculating && <ActivityIndicator size="small" color="#667eea" />}
                </View>
                <TouchableOpacity
                  style={styles.recalculateButton}
                  onPress={handleRecalculate}
                  disabled={recalculating}
                >
                  <Ionicons name="refresh" size={18} color="#FFFFFF" />
                  <Text style={styles.recalculateButtonText}>
                    {recalculating ? 'Updating...' : 'Recalculate'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveTrip}
              disabled={saving}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveGradient}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                    <Text style={styles.saveText}>
                      {editMode ? 'Save Changes' : 'Save Trip'}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.navigationContainer}>
          {currentStep > 1 && (
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => setCurrentStep(currentStep - 1)}
            >
              <Ionicons name="chevron-back" size={20} color="#667eea" />
              <Text style={styles.navButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          {currentStep < totalSteps && (
            <>
              {currentStep > 1 && <View style={{ flex: 1 }} />}
              <TouchableOpacity
                style={[styles.navButtonPrimary, currentStep === 1 && { flex: 1 }]}
                onPress={() => setCurrentStep(currentStep + 1)}
              >
                <Text style={styles.navButtonPrimaryText}>Next</Text>
                <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    paddingTop: 56,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  progressContainer: {
    paddingHorizontal: 24,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  stepCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    marginHorizontal: 24,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  stepIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    alignSelf: 'center',
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
  },
  timeText: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '500',
  },
  suggestionsContainer: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    maxHeight: 240,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  suggestionsList: {
    maxHeight: 240,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  suggestionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
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
  destinationsList: {
    marginTop: 24,
  },
  destinationsHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  destinationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  destinationNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  destinationNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  destinationName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  removeButton: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  travelModesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  travelModeCard: {
    width: (width - 96) / 2,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  travelModeCardActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#667eea',
  },
  travelModeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  travelModeIconActive: {
    backgroundColor: '#667eea',
  },
  travelModeLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  travelModeLabelActive: {
    color: '#667eea',
  },
  selectedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  previewIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  previewValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  previewDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  mapPreview: {
    height: 280,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mapOverlayIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapOverlayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  recalculateButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#667eea',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  recalculateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  saveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingTop: 32,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    gap: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  navButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#667eea',
  },
  navButtonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#667eea',
    gap: 6,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  navButtonPrimaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});