import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    Image,
    StyleSheet,
    StatusBar,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.100:5000/api';

export default function CreateGuideScreen() {
    const router = useRouter();
    const { tripId } = useLocalSearchParams();
    const { accessToken } = useAuth();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [photos, setPhotos] = useState<string[]>([]);
    const [visibility, setVisibility] = useState<'public' | 'private'>('public');
    const [loading, setLoading] = useState(false);
    const [tripData, setTripData] = useState<any>(null);

    useEffect(() => {
        if (tripId) {
            loadTripData();
        }
    }, [tripId]);

    const loadTripData = async () => {
        try {
            const response = await axios.get(`${API_URL}/trips/${tripId}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            setTripData(response.data);
            setTitle(response.data.title || '');
        } catch (error) {
            console.error('Load trip data error:', error);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 0.8,
        });

        if (!result.canceled && result.assets) {
            const newPhotos = result.assets.map((asset) => asset.uri);
            setPhotos([...photos, ...newPhotos]);
        }
    };

    const removePhoto = (index: number) => {
        setPhotos(photos.filter((_, i) => i !== index));
    };

    const handleCreateGuide = async () => {
        if (!title.trim()) {
            Alert.alert('Error', 'Please enter a title for your guide');
            return;
        }

        if (!description.trim()) {
            Alert.alert('Error', 'Please enter a description');
            return;
        }

        setLoading(true);
        try {
            await axios.post(
                `${API_URL}/guides`,
                {
                    tripId,
                    title: title.trim(),
                    description: description.trim(),
                    photos,
                    visibility,
                    tags: [],
                },
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            );

            Alert.alert('Success', 'Guide created successfully!', [
                {
                    text: 'OK',
                    onPress: () => router.replace('/(tabs)/profile'),
                },
            ]);
        } catch (error) {
            console.error('Create guide error:', error);
            Alert.alert('Error', 'Failed to create guide');
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#667eea" />

            <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Create Guide</Text>
                    <View style={{ width: 40 }} />
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Trip Details</Text>
                    {tripData && (
                        <View style={styles.tripInfo}>
                            <Ionicons name="map" size={20} color="#667eea" />
                            <Text style={styles.tripInfoText}>
                                {tripData.stops?.length || 0} stops • {tripData.destination}
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Title *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Give your guide a catchy title"
                        placeholderTextColor="#9CA3AF"
                        value={title}
                        onChangeText={setTitle}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Description *</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Share your experience and tips..."
                        placeholderTextColor="#9CA3AF"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={6}
                        textAlignVertical="top"
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Photos</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.photosContainer}
                    >
                        <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
                            <Ionicons name="camera" size={32} color="#667eea" />
                            <Text style={styles.addPhotoText}>Add Photos</Text>
                        </TouchableOpacity>

                        {photos.map((photo, index) => (
                            <View key={index} style={styles.photoItem}>
                                <Image source={{ uri: photo }} style={styles.photo} />
                                <TouchableOpacity
                                    style={styles.removePhotoButton}
                                    onPress={() => removePhoto(index)}
                                >
                                    <Ionicons name="close-circle" size={24} color="#EF4444" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Visibility</Text>
                    <View style={styles.visibilityOptions}>
                        <TouchableOpacity
                            style={[
                                styles.visibilityOption,
                                visibility === 'public' && styles.visibilityOptionActive,
                            ]}
                            onPress={() => setVisibility('public')}
                        >
                            <Ionicons
                                name="globe"
                                size={24}
                                color={visibility === 'public' ? '#667eea' : '#9CA3AF'}
                            />
                            <Text
                                style={[
                                    styles.visibilityText,
                                    visibility === 'public' && styles.visibilityTextActive,
                                ]}
                            >
                                Public
                            </Text>
                            <Text style={styles.visibilitySubtext}>
                                Anyone can see this guide
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.visibilityOption,
                                visibility === 'private' && styles.visibilityOptionActive,
                            ]}
                            onPress={() => setVisibility('private')}
                        >
                            <Ionicons
                                name="lock-closed"
                                size={24}
                                color={visibility === 'private' ? '#667eea' : '#9CA3AF'}
                            />
                            <Text
                                style={[
                                    styles.visibilityText,
                                    visibility === 'private' && styles.visibilityTextActive,
                                ]}
                            >
                                Private
                            </Text>
                            <Text style={styles.visibilitySubtext}>Only you can see this</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.createButton}
                    onPress={handleCreateGuide}
                    disabled={loading}
                >
                    <LinearGradient
                        colors={['#667eea', '#764ba2']}
                        style={styles.createGradient}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                                <Text style={styles.createButtonText}>Create Guide</Text>
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
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
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 24,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 12,
    },
    tripInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EEF2FF',
        padding: 16,
        borderRadius: 16,
        gap: 12,
    },
    tripInfoText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#667eea',
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingHorizontal: 20,
        paddingVertical: 16,
        fontSize: 15,
        color: '#1F2937',
        borderWidth: 2,
        borderColor: '#E5E7EB',
    },
    textArea: {
        height: 140,
        paddingTop: 16,
    },
    photosContainer: {
        gap: 12,
    },
    addPhotoButton: {
        width: 120,
        height: 120,
        borderRadius: 16,
        backgroundColor: '#EEF2FF',
        borderWidth: 2,
        borderColor: '#667eea',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    addPhotoText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#667eea',
    },
    photoItem: {
        position: 'relative',
    },
    photo: {
        width: 120,
        height: 120,
        borderRadius: 16,
        backgroundColor: '#F9FAFB',
    },
    removePhotoButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
    },
    visibilityOptions: {
        flexDirection: 'row',
        gap: 12,
    },
    visibilityOption: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        alignItems: 'center',
    },
    visibilityOptionActive: {
        backgroundColor: '#EEF2FF',
        borderColor: '#667eea',
    },
    visibilityText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#9CA3AF',
        marginTop: 8,
        marginBottom: 4,
    },
    visibilityTextActive: {
        color: '#667eea',
    },
    visibilitySubtext: {
        fontSize: 12,
        color: '#9CA3AF',
        textAlign: 'center',
    },
    createButton: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
        marginTop: 8,
    },
    createGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingVertical: 18,
    },
    createButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
