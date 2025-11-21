// client/components/AILiveMap.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
  ActivityIndicator,
  Animated,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.100:5000/api';

interface AILiveMapProps {
  stops?: Array<{ latitude: number; longitude: number; name?: string }>;
  route?: Array<{ latitude: number; longitude: number }>;
  showCurrentLocation?: boolean;
  tripId?: string;
  onLocationUpdate?: (location: Location.LocationObject) => void;
}

export default function AILiveMap({
  stops = [],
  route = [],
  showCurrentLocation = true,
  tripId,
  onLocationUpdate,
}: AILiveMapProps) {
  const mapRef = useRef<MapView>(null);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [aiGuidance, setAiGuidance] = useState<any>(null);
  const [showGuidance, setShowGuidance] = useState(false);
  const [loading, setLoading] = useState(true);
  const [remainingStops, setRemainingStops] = useState(stops);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const guidanceInterval = useRef<NodeJS.Timeout | number | null>(null);

  useEffect(() => {
    requestLocationPermission();
    
    // Pulse animation for live location marker
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => {
      if (guidanceInterval.current) {
        clearInterval(guidanceInterval.current);
      }
    };
  }, []);

  useEffect(() => {
    if (currentLocation && remainingStops.length > 0) {
      // Get AI guidance every 2 minutes
      guidanceInterval.current = setInterval(() => {
        getAIGuidance();
      }, 120000);

      // Initial guidance
      getAIGuidance();
    }

    return () => {
      if (guidanceInterval.current) {
        clearInterval(guidanceInterval.current);
      }
    };
  }, [currentLocation, remainingStops]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === Location.PermissionStatus.GRANTED) {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setCurrentLocation(location);
        
        // Start location tracking
        startLocationTracking();
      }
      setLoading(false);
    } catch (error) {
      console.error('Location permission error:', error);
      setLoading(false);
    }
  };

  const startLocationTracking = async () => {
    try {
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 20,
        },
        (location) => {
          setCurrentLocation(location);
          onLocationUpdate?.(location);

          // Update remaining stops based on proximity
          const updatedStops = remainingStops.filter((stop) => {
            const distance = getDistance(
              location.coords.latitude,
              location.coords.longitude,
              stop.latitude,
              stop.longitude
            );
            return distance > 0.1; // Remove if within 100m
          });

          if (updatedStops.length !== remainingStops.length) {
            setRemainingStops(updatedStops);
          }

          // Center map on user
          if (mapRef.current) {
            mapRef.current.animateToRegion(
              {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              },
              1000
            );
          }
        }
      );
    } catch (error) {
      console.error('Location tracking error:', error);
    }
  };

  const getAIGuidance = async () => {
    if (!currentLocation || remainingStops.length === 0) return;

    try {
      const response = await axios.post(`${API_URL}/ai/live-guidance`, {
        currentLatitude: currentLocation.coords.latitude,
        currentLongitude: currentLocation.coords.longitude,
        remainingStops,
        traffic: { heavy: false }, // Would integrate with traffic API
        weather: { description: 'Clear' }, // Would integrate with weather API
      });

      setAiGuidance(response.data);

      // Show guidance if there are warnings or suggestions
      if (
        response.data.warnings?.length > 0 ||
        response.data.suggestions?.length > 0
      ) {
        setShowGuidance(true);
      }

      // Reorder stops if AI suggests
      if (response.data.reorderedStops && response.data.reorderedStops.length > 0) {
        const reordered = response.data.reorderedStops.map(
          (idx: number) => remainingStops[idx]
        );
        setRemainingStops(reordered);
      }
    } catch (error) {
      console.error('AI guidance error:', error);
    }
  };

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleCenterToUser = () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  const initialRegion = currentLocation
    ? {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
    : stops.length > 0
    ? {
        latitude: stops[0].latitude,
        longitude: stops[0].longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      }
    : {
        latitude: 12.9716,
        longitude: 77.5946,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={true}
        showsTraffic={true}
      >
        {route.length > 0 && (
          <Polyline coordinates={route} strokeColor="#667eea" strokeWidth={4} />
        )}

        {remainingStops.map((stop, index) => (
          <Marker
            key={index}
            coordinate={stop}
            pinColor={index === 0 ? '#22c55e' : index === remainingStops.length - 1 ? '#FF6B6B' : '#667eea'}
            title={stop.name || `Stop ${index + 1}`}
          />
        ))}

        {currentLocation && showCurrentLocation && (
          <Marker
            coordinate={{
              latitude: currentLocation.coords.latitude,
              longitude: currentLocation.coords.longitude,
            }}
          >
            <View style={styles.currentLocationMarker}>
              <Animated.View
                style={[
                  styles.pulseCircle,
                  {
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              />
              <View style={styles.innerCircle} />
            </View>
          </Marker>
        )}
      </MapView>

      {currentLocation && (
        <>
          <TouchableOpacity style={styles.centerButton} onPress={handleCenterToUser}>
            <Ionicons name="navigate" size={24} color="#667eea" />
          </TouchableOpacity>

          <View style={styles.locationInfo}>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
            <Text style={styles.stopsRemaining}>
              {remainingStops.length} stops remaining
            </Text>
          </View>
        </>
      )}

      {aiGuidance && showGuidance && (
        <View style={styles.guidanceCard}>
          <View style={styles.guidanceHeader}>
            <View style={styles.aiIconContainer}>
              <Ionicons name="sparkles" size={16} color="#667eea" />
            </View>
            <Text style={styles.guidanceTitle}>AI Guidance</Text>
            <TouchableOpacity onPress={() => setShowGuidance(false)}>
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {aiGuidance.warnings && aiGuidance.warnings.length > 0 && (
            <View style={styles.guidanceSection}>
              <Text style={styles.guidanceSectionTitle}>Warnings</Text>
              {aiGuidance.warnings.map((warning: string, index: number) => (
                <View key={index} style={styles.guidanceItem}>
                  <Ionicons name="warning" size={16} color="#f59e0b" />
                  <Text style={styles.guidanceText}>{warning}</Text>
                </View>
              ))}
            </View>
          )}

          {aiGuidance.suggestions && aiGuidance.suggestions.length > 0 && (
            <View style={styles.guidanceSection}>
              <Text style={styles.guidanceSectionTitle}>Suggestions</Text>
              {aiGuidance.suggestions.map((suggestion: string, index: number) => (
                <View key={index} style={styles.guidanceItem}>
                  <Ionicons name="bulb" size={16} color="#667eea" />
                  <Text style={styles.guidanceText}>{suggestion}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, position: 'relative' },
  map: { width: '100%', height: '100%' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    fontSize: 16,
    color: '#667eea',
    marginTop: 16,
    fontWeight: '600',
  },
  currentLocationMarker: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseCircle: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(102, 126, 234, 0.3)',
  },
  innerCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#667eea',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  centerButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  locationInfo: {
    position: 'absolute',
    top: 24,
    left: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  liveText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
    letterSpacing: 1,
  },
  stopsRemaining: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  guidanceCard: {
    position: 'absolute',
    bottom: 100,
    left: 24,
    right: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  guidanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  aiIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guidanceTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  guidanceSection: {
    marginBottom: 12,
  },
  guidanceSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  guidanceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  guidanceText: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
  },
});