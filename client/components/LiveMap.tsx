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

interface LiveMapProps {
  stops?: Array<{ latitude: number; longitude: number; name?: string }>;
  route?: Array<{ latitude: number; longitude: number }>;
  showCurrentLocation?: boolean;
  onLocationUpdate?: (location: Location.LocationObject) => void;
}

export default function LiveMap({ 
  stops = [], 
  route = [], 
  showCurrentLocation = true,
  onLocationUpdate 
}: LiveMapProps) {
  const mapRef = useRef<MapView>(null);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [locationPermission, setLocationPermission] = useState<Location.PermissionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [locationSubscription, setLocationSubscription] = useState<Location.LocationSubscription | null>(null);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    requestLocationPermission();
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (showCurrentLocation && locationPermission === Location.PermissionStatus.GRANTED) {
      startLocationTracking();
    }
  }, [showCurrentLocation, locationPermission]);

  useEffect(() => {
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
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(foregroundStatus);

      if (foregroundStatus === Location.PermissionStatus.GRANTED) {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setCurrentLocation(location);
        setLoading(false);
      } else {
        setShowPermissionModal(true);
        setLoading(false);
      }
    } catch (error) {
      console.error('Location permission error:', error);
      setLoading(false);
      setShowPermissionModal(true);
    }
  };

  const startLocationTracking = async () => {
    try {
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 2000,
          distanceInterval: 10,
        },
        (location) => {
          setCurrentLocation(location);
          onLocationUpdate?.(location);
          
          if (mapRef.current) {
            mapRef.current.animateToRegion({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }, 1000);
          }
        }
      );
      setLocationSubscription(subscription);
    } catch (error) {
      console.error('Location tracking error:', error);
    }
  };

  const handleCenterToUser = () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
    }
  };

  const handleRetryPermission = () => {
    setShowPermissionModal(false);
    requestLocationPermission();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5DA7DB" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  if (locationPermission !== Location.PermissionStatus.GRANTED && !currentLocation) {
    return (
      <View style={styles.permissionDeniedContainer}>
        <Ionicons name="location-outline" size={64} color="#A0B4C8" />
        <Text style={styles.permissionDeniedTitle}>Location Access Needed</Text>
        <Text style={styles.permissionDeniedText}>
          Enable location access to see your current position and get real-time navigation
        </Text>
        <TouchableOpacity style={styles.enableButton} onPress={handleRetryPermission}>
          <Text style={styles.enableButtonText}>Enable Location</Text>
        </TouchableOpacity>
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
        showsTraffic={false}
      >
        {route.length > 0 && (
          <Polyline
            coordinates={route}
            strokeColor="#5DA7DB"
            strokeWidth={4}
          />
        )}

        {stops.map((stop, index) => (
          <Marker
            key={index}
            coordinate={stop}
            pinColor={index === 0 ? '#22c55e' : index === stops.length - 1 ? '#FF6B6B' : '#5DA7DB'}
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
        <TouchableOpacity style={styles.centerButton} onPress={handleCenterToUser}>
          <Ionicons name="navigate" size={24} color="#5DA7DB" />
        </TouchableOpacity>
      )}

      {currentLocation && (
        <View style={styles.locationInfo}>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
          <Text style={styles.coordsText}>
            {currentLocation.coords.latitude.toFixed(6)}, {currentLocation.coords.longitude.toFixed(6)}
          </Text>
        </View>
      )}

      <Modal
        visible={showPermissionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPermissionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIcon}>
              <Ionicons name="location" size={48} color="#5DA7DB" />
            </View>
            <Text style={styles.modalTitle}>Location Permission Required</Text>
            <Text style={styles.modalText}>
              Itinera needs access to your location to provide real-time navigation, find nearby places, and create personalized trip recommendations.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonSecondary}
                onPress={() => setShowPermissionModal(false)}
              >
                <Text style={styles.modalButtonSecondaryText}>Not Now</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonPrimary}
                onPress={handleRetryPermission}
              >
                <Text style={styles.modalButtonPrimaryText}>Enable</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F9FC',
  },
  loadingText: {
    fontSize: 16,
    color: '#5DA7DB',
    marginTop: 16,
    fontWeight: '600',
  },
  permissionDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F9FC',
    paddingHorizontal: 40,
  },
  permissionDeniedTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0E2954',
    marginTop: 24,
    marginBottom: 12,
  },
  permissionDeniedText: {
    fontSize: 15,
    color: '#A0B4C8',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  enableButton: {
    backgroundColor: '#5DA7DB',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
  },
  enableButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
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
    backgroundColor: 'rgba(93, 167, 219, 0.3)',
  },
  innerCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#5DA7DB',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#0E2954',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
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
    shadowColor: '#0E2954',
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
    shadowColor: '#0E2954',
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
  coordsText: {
    fontSize: 11,
    color: '#A0B4C8',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EBF5FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0E2954',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 15,
    color: '#A0B4C8',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButtonSecondary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#F5F9FC',
    alignItems: 'center',
  },
  modalButtonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5DA7DB',
  },
  modalButtonPrimary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#5DA7DB',
    alignItems: 'center',
  },
  modalButtonPrimaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});