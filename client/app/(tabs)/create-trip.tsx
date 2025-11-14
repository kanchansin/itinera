import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';

const { width } = Dimensions.get('window');

const travelModes = [
  { id: 'car', icon: 'car', label: 'Car' },
  { id: 'walk', icon: 'walk', label: 'Walk' },
  { id: 'bicycle', icon: 'bicycle', label: 'Bike' },
  { id: 'bus', icon: 'bus', label: 'Bus' },
  { id: 'train', icon: 'train', label: 'Train' },
];

const mockDestinations = [
  { id: 1, name: 'Lalbagh Botanical Garden', estimatedTime: '2-3 hours', distance: '5 km' },
  { id: 2, name: 'Bangalore Palace', estimatedTime: '1.5 hours', distance: '8 km' },
  { id: 3, name: 'Cubbon Park', estimatedTime: '1-2 hours', distance: '3 km' },
];

export default function CreateTripScreen() {
  const [currentStep, setCurrentStep] = useState(1);
  const [startLocation, setStartLocation] = useState('');
  const [startTime, setStartTime] = useState('');
  const [selectedMode, setSelectedMode] = useState('car');
  const [destinations, setDestinations] = useState<any[]>([]);
  const [newDestination, setNewDestination] = useState('');

  const totalSteps = 4;

  const addDestination = () => {
    if (newDestination.trim()) {
      setDestinations([
        ...destinations,
        { id: Date.now(), name: newDestination, estimatedTime: '1-2 hours' },
      ]);
      setNewDestination('');
    }
  };

  const removeDestination = (id: number) => {
    setDestinations(destinations.filter((d) => d.id !== id));
  };

  return (
    <LinearGradient colors={['#FFFFFF', '#E8F1F8']} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {}}>
          <Ionicons name="arrow-back" size={24} color="#0E2954" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create My Trip</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Progress Stepper */}
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
        {/* Step 1: Start Location & Time */}
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
              <Text style={styles.inputLabel}>Starting Location</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="pin" size={20} color="#5DA7DB" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your starting point"
                  placeholderTextColor="#A0B4C8"
                  value={startLocation}
                  onChangeText={setStartLocation}
                />
              </View>
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

        {/* Step 2: Add Destinations */}
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
                    onChangeText={setNewDestination}
                  />
                </View>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={addDestination}
                >
                  <Ionicons name="add" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
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
                      <View style={styles.aiTag}>
                        <Ionicons name="sparkles" size={12} color="#5DA7DB" />
                        <Text style={styles.aiTagText}>
                          AI suggests: {dest.estimatedTime}
                        </Text>
                      </View>
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

        {/* Step 3: Choose Travel Mode */}
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

        {/* Step 4: Preview & Generate */}
        {currentStep === 4 && (
          <View style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <Ionicons name="eye" size={28} color="#5DA7DB" />
              <Text style={styles.stepTitle}>Trip Preview</Text>
            </View>
            <Text style={styles.stepDescription}>
              Review your trip before generating the smart plan
            </Text>

            <View style={styles.previewCard}>
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

            {/* Mini Map Preview */}
            <View style={styles.mapPreview}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: 12.9716,
                  longitude: 77.5946,
                  latitudeDelta: 0.1,
                  longitudeDelta: 0.1,
                }}
              >
                <Marker coordinate={{ latitude: 12.9716, longitude: 77.5946 }} />
              </MapView>
              <View style={styles.mapOverlay}>
                <Ionicons name="map" size={24} color="#5DA7DB" />
                <Text style={styles.mapOverlayText}>Route Preview</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.generateButton}>
              <LinearGradient
                colors={['#5DA7DB', '#0E2954']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.generateGradient}
              >
                <Ionicons name="sparkles" size={24} color="#FFFFFF" />
                <Text style={styles.generateText}>Generate Smart Plan</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Navigation Buttons */}
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
    height: 200,
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