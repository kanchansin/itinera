import { db } from '@/services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const getMostVisitedDestination = (trips: any[]) => {
  const destinations = new Map();
  trips.forEach(trip => {
    const count = destinations.get(trip.destination) || 0;
    destinations.set(trip.destination, count + 1);
  });
  
  let maxCount = 0;
  let favorite = 'None';
  destinations.forEach((count, destination) => {
    if (count > maxCount) {
      maxCount = count;
      favorite = destination;
    }
  });
  
  return favorite;
};

const getMostUsedTransport = (trips: any[]) => {
  const transports = new Map();
  trips.forEach(trip => {
    const count = transports.get(trip.transport) || 0;
    transports.set(trip.transport, count + 1);
  });
  
  let maxCount = 0;
  let preferred = 'driving';
  transports.forEach((count, transport) => {
    if (count > maxCount) {
      maxCount = count;
      preferred = transport;
    }
  });
  
  return preferred;
};

export const getUserTripStats = async (userId: string) => {
  const tripsRef = collection(db, 'trips');
  const q = query(tripsRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  
  const trips = snapshot.docs.map(doc => doc.data());
  
  return {
    totalTrips: trips.length,
    totalDistance: trips.reduce((sum, trip) => sum + (trip.distance || 0), 0),
    totalDuration: trips.reduce((sum, trip) => sum + (trip.duration || 0), 0),
    favoriteDestination: getMostVisitedDestination(trips),
    preferredTransport: getMostUsedTransport(trips),
  };
};