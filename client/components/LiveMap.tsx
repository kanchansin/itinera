import React, { useEffect, useRef, useState, useCallback } from 'react';
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

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

interface Stop {
  latitude: number;
  longitude: number;
  name?: string;
}

interface LiveMapProps {
  stops?: Stop[];
  showCurrentLocation?: boolean;
  onLocationUpdate?: (location: Location.LocationObject) => void;
}

const decodePolyline = (encoded: string): { latitude: number; longitude: number }[] => {
  const points: { latitude: number; longitude: number }[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += deltaLat;

    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += deltaLng;

    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return points;
};

const fetchRoadRoute = async (
  stops: Stop[]
): Promise<{ latitude: number; longitude: number }[]> => {
  if (stops.length < 2) return [];

  const origin = `${stops[0].latitude},${stops[0].longitude}`;
  const destination = `${stops[stops.length - 1].latitude},${stops[stops.length - 1].longitude}`;
  const waypoints = stops
    .slice(1, -1)
    .map((s) => `${s.latitude},${s.longitude}`)
    .join('|');

  const params: Record<string, string> = {
    origin,
    destination,
    mode: 'driving',
    key: GOOGLE_MAPS_API_KEY || '',
  };
  if (waypoints) params.waypoints = `optimize:true|${waypoints}`;

  const res = await axios.get(
    'https://maps.googleapis.com/maps/api/directions/json',
    { params }
  );

  if (res.data.status !== 'OK' || !res.data.routes?.length) {
    console.warn('Directions API error:', res.data.status);
    return [];
  }

  const route: { latitude: number; longitude: number }[] = [];
  for (const leg of res.data.routes[0].legs) {
    for (const step of leg.steps) {
      route.push(...decodePolyline(step.polyline.points));
    }
  }
  return route;
};

const fitMapToCoords = (
  mapRef: React.RefObject<MapView | null>,
  coords: { latitude: number; longitude: number }[]
) => {
  if (!mapRef.current || coords.length === 0) return;
  mapRef.current.fitToCoordinates(coords, {
    edgePadding: { top: 60, right: 40, bottom: 80, left: 40 },
    animated: true,
  });
};

export default function LiveMap({
  stops = [],
  showCurrentLocation = true,
  onLocationUpdate,
}: LiveMapProps) {
  const mapRef = useRef<MapView>(null);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [locationPermission, setLocationPermission] = useState<Location.PermissionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [routeCoords, setRouteCoords] = useState<{ latitude: number; longitude: number }[]>([]);
  const [routeLoading, setRouteLoading] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    requestLocationPermission();
    return () => {
      locationSubscriptionRef.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (stops.length >= 2) {
      loadRoute();
    }
  }, [stops]);

  const loadRoute = useCallback(async () => {
    setRouteLoading(true);
    try {
      const coords = await fetchRoadRoute(stops);
      setRouteCoords(coords);
      setTimeout(() => fitMapToCoords(mapRef, [...coords, ...stops]), 500);
    } catch (err) {
      console.error('Route fetch error:', err);
      setRouteCoords(stops.map((s) => ({ latitude: s.latitude, longitude: s.longitude })));
    } finally {
      setRouteLoading(false);
    }
  }, [stops]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status);

      if (status === Location.PermissionStatus.GRANTED) {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setCurrentLocation(location);
        if (showCurrentLocation) startLocationTracking();
      } else {
        setShowPermissionModal(true);
      }
    } catch (error) {
      console.error('Location permission error:', error);
      setShowPermissionModal(true);
    } finally {
      setLoading(false);
    }
  };

  const startLocationTracking = async () => {
    try {
      const subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 3000, distanceInterval: 10 },
        (location) => {
          setCurrentLocation(location);
          onLocationUpdate?.(location);
        }
      );
      locationSubscriptionRef.current = subscription;
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

  const handleFitRoute = () => {
    const allCoords = [
      ...routeCoords,
      ...stops,
      ...(currentLocation
        ? [{ latitude: currentLocation.coords.latitude, longitude: currentLocation.coords.longitude }]
        : []),
    ];
    fitMapToCoords(mapRef, allCoords);
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
        <TouchableOpacity style={styles.enableButton} onPress={requestLocationPermission}>
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
      : { latitude: 12.9716, longitude: 77.5946, latitudeDelta: 0.1, longitudeDelta: 0.1 };

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
        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor="#5DA7DB"
            strokeWidth={5}
            lineDashPattern={undefined}
          />
        )}

        {stops.map((stop, index) => (
          <Marker
            key={`stop-${index}`}
            coordinate={stop}
            title={stop.name || `Stop ${index + 1}`}
          >
            <View style={[
              styles.stopMarker,
              index === 0 && styles.startMarker,
              index === stops.length - 1 && styles.endMarker,
            ]}>
              <Text style={styles.stopMarkerText}>
                {index === 0 ? '▶' : index === stops.length - 1 ? '⚑' : `${index + 1}`}
              </Text>
            </View>
          </Marker>
        ))}

        {currentLocation && showCurrentLocation && (
          <Marker
            coordinate={{
              latitude: currentLocation.coords.latitude,
              longitude: currentLocation.coords.longitude,
            }}
          >
            <View style={styles.currentLocationMarker}>
              <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }] }]} />
              <View style={styles.innerCircle} />
            </View>
          </Marker>
        )}
      </MapView>

      {routeLoading && (
        <View style={styles.routeLoadingBadge}>
          <ActivityIndicator size="small" color="#5DA7DB" />
          <Text style={styles.routeLoadingText}>Loading route...</Text>
        </View>
      )}

      <View style={styles.buttonStack}>
        {currentLocation && (
          <TouchableOpacity style={styles.controlButton} onPress={handleCenterToUser}>
            <Ionicons name="navigate" size={22} color="#5DA7DB" />
          </TouchableOpacity>
        )}
        {(routeCoords.length > 0 || stops.length > 0) && (
          <TouchableOpacity style={styles.controlButton} onPress={handleFitRoute}>
            <Ionicons name="scan" size={22} color="#5DA7DB" />
          </TouchableOpacity>
        )}
      </View>

      {currentLocation && (
        <View style={styles.locationInfo}>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
          <Text style={styles.stopsText}>{stops.length} stops · {routeCoords.length > 0 ? 'Route loaded' : 'Fetching route...'}</Text>
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
                onPress={() => { setShowPermissionModal(false); requestLocationPermission(); }}
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
  container: { flex: 1, position: 'relative' },
  map: { width: '100%', height: '100%' },
  loadingContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F9FC',
  },
  loadingText: { fontSize: 16, color: '#5DA7DB', marginTop: 16, fontWeight: '600' },
  permissionDeniedContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#F5F9FC', paddingHorizontal: 40,
  },
  permissionDeniedTitle: {
    fontSize: 22, fontWeight: '700', color: '#0E2954', marginTop: 24, marginBottom: 12,
  },
  permissionDeniedText: {
    fontSize: 15, color: '#A0B4C8', textAlign: 'center', lineHeight: 22, marginBottom: 32,
  },
  enableButton: {
    backgroundColor: '#5DA7DB', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 24,
  },
  enableButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  stopMarker: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#5DA7DB',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#FFFFFF',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 4, elevation: 5,
  },
  startMarker: { backgroundColor: '#22c55e' },
  endMarker: { backgroundColor: '#EF4444' },
  stopMarkerText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  currentLocationMarker: {
    width: 40, height: 40, justifyContent: 'center', alignItems: 'center',
  },
  pulseCircle: {
    position: 'absolute', width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(93, 167, 219, 0.3)',
  },
  innerCircle: {
    width: 16, height: 16, borderRadius: 8, backgroundColor: '#5DA7DB',
    borderWidth: 3, borderColor: '#FFFFFF',
    shadowColor: '#0E2954', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 4, elevation: 5,
  },
  routeLoadingBadge: {
    position: 'absolute', top: 24, right: 24,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  routeLoadingText: { fontSize: 13, color: '#5DA7DB', fontWeight: '600' },
  buttonStack: {
    position: 'absolute', bottom: 24, right: 24, gap: 12,
  },
  controlButton: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: '#FFFFFF',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#0E2954', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 6,
  },
  locationInfo: {
    position: 'absolute', top: 24, left: 24,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20,
    shadowColor: '#0E2954', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  liveText: { fontSize: 12, fontWeight: '700', color: '#10B981', letterSpacing: 1 },
  stopsText: { fontSize: 11, color: '#A0B4C8', fontWeight: '500' },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 32,
    width: '100%', maxWidth: 400, alignItems: 'center',
  },
  modalIcon: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#EBF5FA',
    justifyContent: 'center', alignItems: 'center', marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22, fontWeight: '700', color: '#0E2954', marginBottom: 12, textAlign: 'center',
  },
  modalText: {
    fontSize: 15, color: '#A0B4C8', textAlign: 'center', lineHeight: 22, marginBottom: 32,
  },
  modalButtons: { flexDirection: 'row', gap: 12, width: '100%' },
  modalButtonSecondary: {
    flex: 1, paddingVertical: 14, borderRadius: 16,
    backgroundColor: '#F5F9FC', alignItems: 'center',
  },
  modalButtonSecondaryText: { fontSize: 16, fontWeight: '600', color: '#5DA7DB' },
  modalButtonPrimary: {
    flex: 1, paddingVertical: 14, borderRadius: 16,
    backgroundColor: '#5DA7DB', alignItems: 'center',
  },
  modalButtonPrimaryText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});