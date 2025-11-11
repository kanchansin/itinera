import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface TravelPlannerFormProps {
  onSubmit: (data: TravelPlanFormData) => void;
  loading?: boolean;
}

export interface TravelPlanFormData {
  destination: string;
  budget: string;
  duration: string;
  interests: string[];
  travelStyle: string;
  accommodation: string;
}

export const TravelPlannerForm: React.FC<TravelPlannerFormProps> = ({
  onSubmit,
  loading = false,
}) => {
  const [formData, setFormData] = useState<TravelPlanFormData>({
    destination: '',
    budget: '',
    duration: '',
    interests: [],
    travelStyle: '',
    accommodation: '',
  });

  const [showInterests, setShowInterests] = useState(false);

  const interestOptions = [
    'Culture',
    'Nature',
    'Adventure',
    'Food',
    'History',
    'Shopping',
    'Relaxation',
    'Nightlife',
  ];

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleSubmit = () => {
    if (!formData.destination || !formData.budget || !formData.duration) {
      return;
    }
    onSubmit(formData);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Ionicons name="location" size={24} color="#22c55e" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Where do you want to go?"
          placeholderTextColor="#6b7280"
          value={formData.destination}
          onChangeText={(text) => setFormData({ ...formData, destination: text })}
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="wallet" size={24} color="#22c55e" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Your budget (in ₹)"
          placeholderTextColor="#6b7280"
          keyboardType="numeric"
          value={formData.budget}
          onChangeText={(text) => setFormData({ ...formData, budget: text })}
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="time" size={24} color="#22c55e" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Duration (in days)"
          placeholderTextColor="#6b7280"
          keyboardType="numeric"
          value={formData.duration}
          onChangeText={(text) => setFormData({ ...formData, duration: text })}
        />
      </View>

      <TouchableOpacity
        style={styles.interestsButton}
        onPress={() => setShowInterests(true)}
      >
        <Ionicons name="heart" size={24} color="#22c55e" style={styles.icon} />
        <Text style={styles.interestsButtonText}>
          {formData.interests.length
            ? `${formData.interests.length} interests selected`
            : 'Select your interests'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.submitButton, !formData.destination && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={!formData.destination || loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.submitButtonText}>Plan My Trip</Text>
        )}
      </TouchableOpacity>

      <Modal visible={showInterests} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Your Interests</Text>
            <View style={styles.interestsGrid}>
              {interestOptions.map((interest) => (
                <TouchableOpacity
                  key={interest}
                  style={[
                    styles.interestChip,
                    formData.interests.includes(interest) && styles.interestChipSelected,
                  ]}
                  onPress={() => handleInterestToggle(interest)}
                >
                  <Text
                    style={[
                      styles.interestChipText,
                      formData.interests.includes(interest) && styles.interestChipTextSelected,
                    ]}
                  >
                    {interest}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowInterests(false)}
            >
              <Text style={styles.modalButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: 'white',
    fontSize: 16,
  },
  interestsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  interestsButtonText: {
    color: '#6b7280',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#22c55e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  interestChip: {
    backgroundColor: '#374151',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    margin: 4,
  },
  interestChipSelected: {
    backgroundColor: '#22c55e',
  },
  interestChipText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  interestChipTextSelected: {
    color: 'white',
  },
  modalButton: {
    backgroundColor: '#22c55e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});