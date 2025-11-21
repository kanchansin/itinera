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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.100:5000/api';

const questions = [
  {
    id: 'mood',
    question: "What's your mood for this trip?",
    placeholder: 'e.g., adventurous, relaxing, romantic',
    options: ['Adventurous', 'Relaxing', 'Romantic', 'Spiritual', 'Foodie'],
  },
  {
    id: 'locationType',
    question: 'What type of places do you prefer?',
    placeholder: 'e.g., nature, city, beaches',
    options: ['Nature', 'City', 'Beaches', 'Mountains', 'Food Streets'],
  },
  {
    id: 'travelerType',
    question: 'Who are you traveling with?',
    placeholder: 'e.g., solo, couple, family',
    options: ['Solo', 'Couple', 'Family', 'Friends', 'Group'],
  },
  {
    id: 'timeAvailable',
    question: 'How many hours do you have?',
    placeholder: 'e.g., 4, 6, 8',
    type: 'number',
  },
  {
    id: 'budget',
    question: "What's your budget?",
    placeholder: 'e.g., budget, moderate, luxury',
    options: ['Budget', 'Moderate', 'Luxury'],
  },
];

export default function AITripCreatorScreen() {
  const router = useRouter();
  const { user, accessToken } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<any>(null);
  const [loadingLocation, setLoadingLocation] = useState(true);

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation(location.coords);
      }
    } catch (error) {
      console.error('Location error:', error);
    } finally {
      setLoadingLocation(false);
    }
  };

  const currentQuestion = questions[currentStep];

  const handleOptionSelect = (option: string) => {
    setInputValue(option.toLowerCase());
  };

  const handleNext = async () => {
    if (!inputValue.trim()) return;

    const newAnswers = {
      ...answers,
      [currentQuestion.id]: inputValue.trim(),
    };
    setAnswers(newAnswers);

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
      setInputValue('');
    } else {
      await generateTrip(newAnswers);
    }
  };

  const generateTrip = async (preferences: any) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/ai/generate-full-trip`,
        {
          mood: preferences.mood,
          locationType: preferences.locationType,
          travelerType: preferences.travelerType,
          timeAvailable: parseInt(preferences.timeAvailable) || 6,
          budget: preferences.budget,
          latitude: userLocation?.latitude || 12.9716,
          longitude: userLocation?.longitude || 77.5946,
        },
        {
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        }
      );

      router.push({
        pathname: '/(tabs)/trip-preview',
        params: {
          tripData: JSON.stringify(response.data),
          preferences: JSON.stringify(preferences),
        },
      });
    } catch (error) {
      console.error('Generate trip error:', error);
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setInputValue('');
    } else {
      router.back();
    }
  };

  if (loadingLocation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Creating your perfect trip...</Text>
        <Text style={styles.loadingSubtext}>This may take a moment</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />

      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Trip Creator</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${((currentStep + 1) / questions.length) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {currentStep + 1} of {questions.length}
          </Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.questionCard}>
            <View style={styles.aiIconContainer}>
              <Ionicons name="sparkles" size={32} color="#667eea" />
            </View>

            <Text style={styles.questionText}>{currentQuestion.question}</Text>

            {currentQuestion.options && (
              <View style={styles.optionsContainer}>
                {currentQuestion.options.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionButton,
                      inputValue.toLowerCase() === option.toLowerCase() &&
                        styles.optionButtonActive,
                    ]}
                    onPress={() => handleOptionSelect(option)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        inputValue.toLowerCase() === option.toLowerCase() &&
                          styles.optionTextActive,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder={currentQuestion.placeholder}
                placeholderTextColor="#9CA3AF"
                value={inputValue}
                onChangeText={setInputValue}
                keyboardType={currentQuestion.type === 'number' ? 'numeric' : 'default'}
                returnKeyType="done"
                onSubmitEditing={handleNext}
              />
            </View>

            <TouchableOpacity
              style={[styles.nextButton, !inputValue.trim() && styles.nextButtonDisabled]}
              onPress={handleNext}
              disabled={!inputValue.trim()}
            >
              <LinearGradient
                colors={inputValue.trim() ? ['#667eea', '#764ba2'] : ['#D1D5DB', '#9CA3AF']}
                style={styles.nextGradient}
              >
                <Text style={styles.nextText}>
                  {currentStep === questions.length - 1 ? 'Create Trip' : 'Next'}
                </Text>
                <Ionicons
                  name={currentStep === questions.length - 1 ? 'checkmark' : 'arrow-forward'}
                  size={20}
                  color="#FFFFFF"
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {currentStep > 0 && (
            <View style={styles.answersPreview}>
              <Text style={styles.previewTitle}>Your Preferences</Text>
              {Object.entries(answers).map(([key, value]) => {
                const question = questions.find((q) => q.id === key);
                return (
                  <View key={key} style={styles.previewItem}>
                    <Text style={styles.previewLabel}>{question?.question}</Text>
                    <Text style={styles.previewValue}>{value as string}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#667eea',
    marginTop: 16,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 100,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  aiIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    alignSelf: 'center',
  },
  questionText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 32,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  optionButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  optionButtonActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#667eea',
  },
  optionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  optionTextActive: {
    color: '#667eea',
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingHorizontal: 20,
    height: 56,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  nextButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  nextGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  nextText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  answersPreview: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  previewItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  previewLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  previewValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    textTransform: 'capitalize',
  },
});