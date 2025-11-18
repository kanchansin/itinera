import * as Location from 'expo-location';
import { db } from '@/services/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export const startTripTracking = async (tripId: string, userId: string) => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') return;

  return await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: 10000,
      distanceInterval: 50,
    },
    async (location) => {
      const { latitude, longitude } = location.coords;
      
      const tripRef = doc(db, 'trips', tripId);
      await updateDoc(tripRef, {
        currentLocation: { latitude, longitude },
        lastUpdated: new Date().toISOString(),
      });
    }
  );
};