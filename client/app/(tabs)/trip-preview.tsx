import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/services/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function TripPreviewScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  const tripData = params.tripData ? JSON.parse(params.tripData as string) : null;
  const preferences = params.preferences ? JSON.parse(params.preferences as string) : null;

  if (!tripData) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#EF4444" />
        <Text style={styles.errorText}>No trip data available</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleSaveTrip = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'Please log in to save trips');
      return;
    }

    setSaving(true);
    try {
      const tripId = `trip_${user.id}_${Date.now()}`;

      const stopsList = tripData.stops.map((stop: any, index: number) => ({
        id: index,
        name: stop.name,
        location: {
          latitude: 0,
          longitude: 0,
        },
        status: 'upcoming',
        duration: stop.duration || 60,
        arrival: stop.arrival,
        departure: stop.departure,
        description: stop.description,
        tips: stop.tips,
      }));

      const savedTrip = {
        id: tripId,
        tripName: tripData.title,
        date: new Date().toISOString(),
        startLocation: 'Current Location',
        startTime: tripData.stops[0]?.arrival || '9:00 AM',
        transport: preferences?.travelerType || 'driving',
        stops: stopsList,
        userId: user.id,
        destination: tripData.stops[tripData.stops.length - 1]?.name || 'Multiple',
        isPublic: false,
        likesCount: 0,
        estimatedCost: tripData.estimatedCost,
        mealBreaks: tripData.mealBreaks,
        warnings: tripData.warnings,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const tripRef = doc(db, 'trips', tripId);
      await setDoc(tripRef, savedTrip);

      Alert.alert('Success', 'Trip saved successfully!', [
        {
          text: 'View Trips',
          onPress: () => router.replace('/(tabs)'),
        },
      ]);
    } catch (error) {
      console.error('Save trip error:', error);
      Alert.alert('Error', 'Failed to save trip');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />

      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your AI Trip</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleCard}>
          <View style={styles.aiIconSmall}>
            <Ionicons name="sparkles" size={20} color="#667eea" />
          </View>
          <Text style={styles.tripTitle}>{tripData.title}</Text>
          <Text style={styles.tripSummary}>{tripData.summary}</Text>

          {tripData.estimatedCost && (
            <View style={styles.costBadge}>
              <Ionicons name="cash" size={16} color="#10B981" />
              <Text style={styles.costText}>
                ₹{tripData.estimatedCost.min} - ₹{tripData.estimatedCost.max}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Itinerary</Text>
          {tripData.stops.map((stop: any, index: number) => (
            <View key={index} style={styles.stopCard}>
              <View style={styles.stopNumber}>
                <Text style={styles.stopNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.stopContent}>
                <Text style={styles.stopName}>{stop.name}</Text>
                <Text style={styles.stopType}>{stop.type}</Text>
                <Text style={styles.stopTime}>
                  {stop.arrival} - {stop.departure} ({stop.duration} min)
                </Text>
                <Text style={styles.stopDescription}>{stop.description}</Text>

                {stop.tips && stop.tips.length > 0 && (
                  <View style={styles.tipsContainer}>
                    <Text style={styles.tipsTitle}>Tips:</Text>
                    {stop.tips.map((tip: string, tipIndex: number) => (
                      <View key={tipIndex} style={styles.tipItem}>
                        <Ionicons name="bulb" size={14} color="#F59E0B" />
                        <Text style={styles.tipText}>{tip}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {stop.photoSpots && stop.photoSpots.length > 0 && (
                  <View style={styles.photoSpotsContainer}>
                    <Ionicons name="camera" size={16} color="#667eea" />
                    <Text style={styles.photoSpotsText}>
                      Photo spots: {stop.photoSpots.join(', ')}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        {tripData.mealBreaks && tripData.mealBreaks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Meal Breaks</Text>
            {tripData.mealBreaks.map((meal: any, index: number) => (
              <View key={index} style={styles.mealCard}>
                <Ionicons name="restaurant" size={20} color="#EF4444" />
                <View style={styles.mealContent}>
                  <Text style={styles.mealType}>{meal.type} at {meal.time}</Text>
                  <Text style={styles.mealSuggestions}>
                    Suggestions: {meal.suggestions.join(', ')}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {tripData.warnings && tripData.warnings.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Important Notes</Text>
            <View style={styles.warningsCard}>
              {tripData.warnings.map((warning: string, index: number) => (
                <View key={index} style={styles.warningItem}>
                  <Ionicons name="warning" size={16} color="#F59E0B" />
                  <Text style={styles.warningText}>{warning}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveTrip}
          disabled={saving}
        >
          <LinearGradient colors={['#667eea', '#764ba2']} style={styles.saveGradient}>
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                <Text style={styles.saveText}>Save Trip</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
  },
  backButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#667eea',
    borderRadius: 20,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
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
  },
  headerButton: {
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
  content: {
    flex: 1,
  },
  titleCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    marginTop: 24,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  aiIconSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  tripTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  tripSummary: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 16,
  },
  costBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#D1FAE5',
    borderRadius: 20,
  },
  costText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  section: {
    marginHorizontal: 24,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  stopCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  stopNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stopNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stopContent: {
    flex: 1,
  },
  stopName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  stopType: {
    fontSize: 13,
    color: '#667eea',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  stopTime: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  stopDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  tipsContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  tipsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
  photoSpotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  photoSpotsText: {
    flex: 1,
    fontSize: 13,
    color: '#4B5563',
  },
  mealCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  mealContent: {
    flex: 1,
  },
  mealType: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  mealSuggestions: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  warningsCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 16,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});