import { db } from '@/services/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

export const getTrendingDestinations = async () => {
  const tripsRef = collection(db, 'trips');
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  
  const q = query(
    tripsRef,
    where('isPublic', '==', true),
    where('createdAt', '>=', lastWeek.toISOString()),
    orderBy('likesCount', 'desc'),
    limit(10)
  );
  
  const snapshot = await getDocs(q);
  
  const destinations = new Map();
  snapshot.docs.forEach(doc => {
    const trip = doc.data();
    const count = destinations.get(trip.destination) || 0;
    destinations.set(trip.destination, count + 1);
  });
  
  return Array.from(destinations.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([destination, count]) => ({ destination, tripCount: count }));
};