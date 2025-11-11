import { Ionicons } from "@expo/vector-icons";
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';

// Import theme at the end to avoid initialization order issues
import { theme } from "../../constants/theme";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    position: 'relative',
  },
  mapContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  locationButton: {
    padding: 12,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 2,
  },
  searchPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '85%',
    backgroundColor: theme.background.medium,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    zIndex: 2,
    shadowColor: theme.shadow.dark,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border.primary,
  },
  popularSection: {
    marginTop: 24,
  },
  popularTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  popularList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  popularItem: {
    backgroundColor: theme.background.dark,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border.primary,
  },
  popularItemText: {
    color: '#ffffff',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },

  searchPanelHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#2d3561',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 15,
  },
  searchInputContainer: {
    backgroundColor: theme.background.dark,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: theme.shadow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingHorizontal: 15,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border.primary,
  },
  searchInput: {
    color: '#ffffff',
    fontSize: 16,
    flex: 1,
    paddingVertical: 12,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2d3561',
    paddingHorizontal: 16,
    borderRadius: 12,
    height: 56,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 123, 84, 0.2)',
  },
  searchInputField: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#ffffff',
  },
  preferencesContainer: {
    backgroundColor: theme.background.light,
    borderRadius: 20,
    padding: 24,
    marginTop: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border.primary,
  },
  preferencesTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 24,
  },
  preferenceSection: {
    marginBottom: 24,
  },
  preferenceLabel: {
    fontSize: 16,
    color: '#8b9cb8',
    marginBottom: 12,
    fontWeight: '600',
  },
  optionsScroll: {
    marginBottom: 8,
  },
  optionButton: {
    backgroundColor: theme.background.dark,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border.primary,
  },
  optionButtonSelected: {
    backgroundColor: theme.primary,
    borderColor: theme.border.primary,
  },
  optionText: {
    color: '#8b9cb8',
    fontSize: 14,
    marginLeft: 8,
  },
  optionTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  sliderContainer: {
    marginTop: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderValue: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
  },
  searchButtonGradient: {
    borderRadius: 12,
    padding: 12,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    height: 48, 
  },
  searchButton: {
    alignSelf: 'flex-end',
  },
  searchButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 42,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    textShadowColor: 'rgba(255, 123, 84, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 18,
    color: '#a8b2d1',
    fontStyle: 'italic',
    letterSpacing: 1,
    opacity: 0.9,
    textShadowColor: 'rgba(255, 123, 84, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },

  mapGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    zIndex: 1,
  },

  popularTripsContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  tripsScrollContent: {
    paddingBottom: 8,
  },
  tripCard: {
    width: 280,
    height: 180,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: theme.background.light,
    shadowColor: theme.shadow.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    position: 'relative',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border.primary,
  },
  tripImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    borderRadius: 16,
    resizeMode: 'cover',
  },
  tripGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  tripInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  tripTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  tripDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  tripDuration: {
    color: '#a8b2d1',
    fontSize: 14,
  },
  tripPrice: {
    color: '#15ff00ff',
    fontSize: 14,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    color: '#ffffff',
    fontSize: 14,
    marginLeft: 4,
    fontWeight: '500',
  },
  formContainer: {
    marginHorizontal: 24,
    backgroundColor: '#2d3561',
    borderRadius: 30,
    paddingHorizontal: 24,
    paddingVertical: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 123, 84, 0.1)',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e2749',
    borderRadius: 16,
    paddingHorizontal: 20,
    height: 60,
    borderWidth: 1,
    borderColor: 'rgba(255, 123, 84, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
    marginTop: 8,
  },
  inputIcon: {
    marginRight: 12,
    color: '#8b9cb8',
  },
  textInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
  },
  inputLabel: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 8,
    fontWeight: '600',
    letterSpacing: 0.5,
    opacity: 0.95,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 12,
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#1f2937',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    minHeight: '70%',
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#374151',
    borderBottomWidth: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 0.5,
  },
  closeButton: {
    padding: 10,
    backgroundColor: '#374151',
    borderRadius: 12,
  },
  planScrollView: {
    marginBottom: 28,
  },
  planText: {
    fontSize: 16,
    lineHeight: 28,
    color: '#9ca3af',
    letterSpacing: 0.5,
  },
  saveButton: {
    backgroundColor: '#22c55e',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#374151',
    opacity: 0.5,
  },
  stepDotActive: {
    backgroundColor: '#22c55e',
    opacity: 1,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 32,
    textAlign: 'center',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 8,
  },
  gridOptionButton: {
    backgroundColor: '#1e2749',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '45%',
    aspectRatio: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#374151',
  },
  gridOptionButtonSelected: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  gridOptionText: {
    color: '#8b9cb8',
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  gridOptionTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  budgetContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  budgetValue: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#22c55e',
    marginBottom: 24,
  },
  budgetLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  budgetLabel: {
    color: '#8b9cb8',
    fontSize: 14,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 32,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#1e2749',
    marginRight: 8,
    marginLeft: -10
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 8,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    paddingHorizontal: 15,
    borderRadius: 12,
    backgroundColor: '#22c55e',
    marginLeft: 5,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    marginRight: 8,
  },
});

const mapTheme = [
  {
    elementType: 'geometry',
    stylers: [{ color: 'rgba(28, 96, 192, 1)' }]
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#ffffffff' }]
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#000000' }]
  }
];

export default function Home() {
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [destination, setDestination] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [maxDistance, setMaxDistance] = useState(50);
  const [maxBudget, setMaxBudget] = useState(1000);
  const [selectedCompanion, setSelectedCompanion] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [budget, setBudget] = useState(10000);
  const [generatedPlan, setGeneratedPlan] = useState('Your customized travel plan will appear here.');
  const mapRef = React.useRef<MapView>(null);
  const router = useRouter();

  const toggleTripType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleSearch = () => {
    if (!destination) {
      router.push("/(auth)/login");
      return;
    }

    // Generate a travel plan based on selections
    const plan = `Travel plan to ${destination}\n` +
      `Traveling: ${selectedCompanion || 'Solo'}\n` +
      `Interests: ${selectedTypes.join(', ') || 'All activities'}\n` +
      `Budget: ₹${budget.toLocaleString()}\n` +
      `Distance: ${maxDistance}km`;

    setGeneratedPlan(plan);
    setShowModal(true);
  };

  const handleLocationPress = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        return;
      }
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,
      });
      
      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      
      // Get the area name using reverse geocoding
      const reverseGeocode = await Location.reverseGeocodeAsync(newLocation);
      
      if (reverseGeocode && reverseGeocode[0]) {
        const address = reverseGeocode[0];
        const areaName = [
          address.district,
          address.subregion,
          address.region
        ].filter(Boolean).join(', ');
        
        setDestination(areaName);
      }
      
      setUserLocation(newLocation);
      
      mapRef.current?.animateToRegion({
        ...newLocation,
        latitudeDelta: 0.02, // Increased to show more of the area
        longitudeDelta: 0.02,
      }, 1000);
    } catch (error) {
      console.error('Error getting location:', error);
      alert('Could not get your location. Please try again.');
    }
  };  const WINDOW_HEIGHT = Dimensions.get('window').height;
  const SNAP_POINTS = {
    TOP: WINDOW_HEIGHT * 0.15,    
    MIDDLE: WINDOW_HEIGHT * 0.5,  
    BOTTOM: WINDOW_HEIGHT * 0.82 
  };

  const translateY = useSharedValue(SNAP_POINTS.MIDDLE);
  const lastSnap = useSharedValue(SNAP_POINTS.MIDDLE);

  const snapTo = (point: number) => {
    'worklet';
    lastSnap.value = point;
    translateY.value = withSpring(point, {
      damping: 20,
      stiffness: 90,
      mass: 0.4,
      velocity: 0
    });
  };

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return Math.abs(gestureState.dy) > 5;
        },
        onPanResponderMove: (_, gestureState) => {
          const newPosition = lastSnap.value + gestureState.dy;
          translateY.value = Math.max(
            SNAP_POINTS.TOP,
            Math.min(SNAP_POINTS.BOTTOM, newPosition)
          );
        },
        onPanResponderRelease: (_, gestureState) => {
          const currentPosition = translateY.value;
          const velocity = gestureState.vy;

          if (Math.abs(velocity) > 1.5) {
            if (velocity > 0) {
              // Moving down
              if (currentPosition > SNAP_POINTS.MIDDLE) {
                snapTo(SNAP_POINTS.BOTTOM);
              } else {
                snapTo(SNAP_POINTS.MIDDLE);
              }
            } else {
              // Moving up
              if (currentPosition < SNAP_POINTS.MIDDLE) {
                snapTo(SNAP_POINTS.TOP);
              } else {
                snapTo(SNAP_POINTS.MIDDLE);
              }
            }
          } else {
            const topThreshold = (SNAP_POINTS.TOP + SNAP_POINTS.MIDDLE) / 2;
            const bottomThreshold = (SNAP_POINTS.MIDDLE + SNAP_POINTS.BOTTOM) / 2;

            if (currentPosition < topThreshold) {
              snapTo(SNAP_POINTS.TOP);
            } else if (currentPosition > bottomThreshold) {
              snapTo(SNAP_POINTS.BOTTOM);
            } else {
              snapTo(SNAP_POINTS.MIDDLE);
            }
          }
        },
      }),
    [SNAP_POINTS]
  );

  const searchPanelStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }]
    };
  }, []);

  // Search panel animation style

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.gradient.primary}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.6 }}
      >
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            customMapStyle={mapTheme}
            initialRegion={{
              latitude: userLocation?.latitude || 12.9716,
              longitude: userLocation?.longitude || 77.5946,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            {userLocation && (
              <Marker
                coordinate={userLocation}
                title="You are here"
                pinColor="#15eb0aff"
              />
            )}
          </MapView>
          <LinearGradient
            colors={theme.gradient.overlay}
            style={styles.mapGradient}
            pointerEvents="none"
          />
          <TouchableOpacity
            style={styles.locationButton}
            onPress={handleLocationPress}
          >
            <Ionicons name="locate" size={24} color="#ff7b54" />
          </TouchableOpacity>
        </View>

        <Animated.View
          style={[
            styles.searchPanel,
            searchPanelStyle,
            {
              height: WINDOW_HEIGHT,
              paddingBottom: 0,
            }
          ]}
          {...panResponder.panHandlers}
        >
          <View
            style={{
              position: 'absolute',
              top: -50,
              right: 16,
              width: 48,
              height: 48,
              backgroundColor: '#1a1a2e',
              borderRadius: 24,
              borderWidth: 1,
              borderColor: '#ff7b54',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
              zIndex: 5,
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <TouchableOpacity onPress={handleLocationPress}>
              <Ionicons name="locate" size={24} color="#ff7b54" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchPanelHandle} />
          <ScrollView
            style={{ flex: 1, height: WINDOW_HEIGHT }}
            contentContainerStyle={{ paddingBottom: 120 }}
            showsVerticalScrollIndicator={true}
            bounces={true}
          >
            <View style={styles.searchInputContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Where to?"
                placeholderTextColor="#8b9cb8"
                value={destination}
                onChangeText={setDestination}
              />
              {destination && (
                <TouchableOpacity onPress={() => setDestination('')}>
                  <Ionicons name="close-circle" size={24} color="#8b9cb8" />
                </TouchableOpacity>
              )}
            </View>

            {destination ? (
              <View style={styles.preferencesContainer}>
                {/* Step Indicator */}
                <View style={styles.stepIndicator}>
                  {[1, 2, 3].map((step) => (
                    <View 
                      key={step} 
                      style={[
                        styles.stepDot,
                        currentStep >= step && styles.stepDotActive,
                      ]}
                    />
                  ))}
                </View>

                {/* Step 1: Travel With */}
                {currentStep === 1 && (
                  <View style={styles.stepContainer}>
                    <Text style={styles.stepTitle}>Who are you traveling with?</Text>
                    <View style={styles.optionsGrid}>
                      {['Solo', 'Partner', 'Family', 'Friends', 'Group'].map((option) => (
                        <TouchableOpacity
                          key={option}
                          style={[
                            styles.gridOptionButton,
                            selectedCompanion === option && styles.gridOptionButtonSelected
                          ]}
                          onPress={() => setSelectedCompanion(option)}
                        >
                          <Ionicons
                            name={
                              option === 'Solo' ? 'person' :
                              option === 'Partner' ? 'heart' :
                              option === 'Family' ? 'people' :
                              option === 'Friends' ? 'beer' : 'people'
                            }
                            size={24}
                            color={selectedCompanion === option ? '#ffffff' : '#8b9cb8'}
                          />
                          <Text style={[
                            styles.gridOptionText,
                            selectedCompanion === option && styles.gridOptionTextSelected
                          ]}>
                            {option}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {/* Step 2: Trip Type */}
                {currentStep === 2 && (
                  <View style={styles.stepContainer}>
                    <Text style={styles.stepTitle}>What interests you?</Text>
                    <View style={styles.optionsGrid}>
                      {[
                        { icon: 'game-controller-outline', label: 'Entertainment' },
                        { icon: 'camera-outline', label: 'Sightseeing' },
                        { icon: 'compass-outline', label: 'Hidden Gems' },
                        { icon: 'restaurant-outline', label: 'Food & Dining' },
                        { icon: 'leaf-outline', label: 'Nature' },
                        { icon: 'business-outline', label: 'City Life' },
                        { icon: 'bonfire-outline', label: 'Adventure' },
                        { icon: 'color-palette-outline', label: 'Culture' }
                      ].map((option) => (
                        <TouchableOpacity
                          key={option.label}
                          style={[
                            styles.gridOptionButton,
                            selectedTypes.includes(option.label) && styles.gridOptionButtonSelected
                          ]}
                          onPress={() => toggleTripType(option.label)}
                        >
                          <Ionicons
                            name={option.icon as any}
                            size={24}
                            color={selectedTypes.includes(option.label) ? '#ffffff' : '#8b9cb8'}
                          />
                          <Text style={[
                            styles.gridOptionText,
                            selectedTypes.includes(option.label) && styles.gridOptionTextSelected
                          ]}>
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {/* Step 3: Budget */}
                {currentStep === 3 && (
                  <View style={styles.stepContainer}>
                    <Text style={styles.stepTitle}>What's your budget?</Text>
                    <View style={styles.budgetContainer}>
                      <Text style={styles.budgetValue}>₹{budget.toLocaleString()}</Text>
                      <Slider
                        style={styles.slider}
                        minimumValue={1000}
                        maximumValue={100000}
                        step={1000}
                        value={budget}
                        onValueChange={setBudget}
                        minimumTrackTintColor="#22c55e"
                        maximumTrackTintColor="#1f2937"
                        thumbTintColor="#22c55e"
                      />
                      <View style={styles.budgetLabels}>
                        <Text style={styles.budgetLabel}>Budget</Text>
                        <Text style={styles.budgetLabel}>Luxury</Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Navigation Buttons */}
                <View style={styles.navigationButtons}>
                  {currentStep > 1 && (
                    <TouchableOpacity
                      style={styles.backButton}
                      onPress={() => setCurrentStep(prev => prev - 1)}
                    >
                      <Ionicons name="chevron-back" size={24} color="#ffffff" />
                      <Text style={styles.backButtonText}>Back</Text>
                    </TouchableOpacity>
                  )}

                  {currentStep < 3 ? (
                    <TouchableOpacity
                      style={styles.nextButton}
                      onPress={() => setCurrentStep(prev => prev + 1)}
                    >
                      <Text style={styles.nextButtonText}>Next</Text>
                      <Ionicons name="chevron-forward" size={24} color="#ffffff" />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.nextButton}
                      onPress={handleSearch}
                    >
                      <Text style={styles.nextButtonText}>Start Planning</Text>
                      <Ionicons name="chevron-forward" size={24} color="#ffffff" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ) : (
              <>
                <Text style={styles.sectionTitle}>Distance</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={1}
                  maximumValue={100}
                  step={1}
                  value={maxDistance}
                  onValueChange={setMaxDistance}
                  minimumTrackTintColor="#ff7b54"
                  maximumTrackTintColor="#2d3561"
                  thumbTintColor="#ff7b54"
                />
                <Text style={styles.sliderValue}>{maxDistance} km</Text>

                <Text style={styles.sectionTitle}>Budget</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={100}
                  maximumValue={10000}
                  step={100}
                  value={maxBudget}
                  onValueChange={setMaxBudget}
                  minimumTrackTintColor="#ff7b54"
                  maximumTrackTintColor="#2d3561"
                  thumbTintColor="#ff7b54"
                />
                <Text style={styles.sliderValue}>₹{maxBudget}</Text>

                <TouchableOpacity
                  style={styles.searchButton}
                  onPress={handleSearch}
                >
                  <LinearGradient
                    colors={['#ff7b54', '#ff5c2c']}
                    style={styles.searchButtonGradient}
                  >
                    <Text style={styles.searchButtonText}>Find Trips</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}

            <View style={[styles.popularTripsContainer, { marginTop: 20 }]}>
              <Text style={styles.sectionTitle}>Popular in Bangalore</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tripsScrollContent}
              >
                {[
                  { 
                    title: 'Lalbagh Botanical Garden',
                    duration: '2-3 hours',
                    price: '₹100',
                    rating: '4.5',
                    image: 'https://image.arrivalguides.com/x/10/6e453c1c2ebf9ceb0e111bf45faf6f71.jpg'
                  },
                  {
                    title: 'Cubbon Park',
                    duration: '2-4 hours',
                    price: 'Free',
                    rating: '4.3',
                    image: 'https://live.staticflickr.com/28/38627246_bad1940604_b.jpg'
                  },
                  {
                    title: 'Commercial Street',
                    duration: '3-4 hours',
                    price: 'Shopping',
                    rating: '4.2',
                    image: 'https://yometro.com/images/places/commercial-street.jpg'
                  },
                  {
                    title: 'Bangalore Palace',
                    duration: '1-2 hours',
                    price: '₹450',
                    rating: '4.1',
                    image: 'https://www.bontravelindia.com/wp-content/uploads/2022/08/Karnataka-Bangalore-Palace-1024x640.jpg'
                  },
                ].map((trip, index) => (
                  <TouchableOpacity key={index} style={styles.tripCard}>
                    <Image 
                      source={{ uri: trip.image }}
                      style={[StyleSheet.absoluteFill, { borderRadius: 16 }]}
                    />
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.9)']}
                      style={styles.tripGradient}
                      locations={[0, 0.6, 1]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                    />
                    <View style={styles.tripInfo}>
                      <Text style={styles.tripTitle}>{trip.title}</Text>
                      <View style={styles.tripDetails}>
                        <Text style={styles.tripDuration}>{trip.duration}</Text>
                        <Text style={styles.tripPrice}>{trip.price}</Text>
                      </View>
                      <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={16} color="#ff7b54" />
                        <Text style={styles.rating}>{trip.rating}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </ScrollView>
        </Animated.View>
      </LinearGradient>
    </View>
  );
}

