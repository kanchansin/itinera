import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    Dimensions,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';

const { width } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.100:5000/api';

interface GuideCardProps {
    guide: any;
    onUpdate?: () => void;
}

export default function GuideCard({ guide, onUpdate }: GuideCardProps) {
    const router = useRouter();
    const { accessToken } = useAuth();
    const [liked, setLiked] = useState(false);
    const [saved, setSaved] = useState(false);
    const [likesCount, setLikesCount] = useState(guide.likesCount || 0);
    const [savesCount, setSavesCount] = useState(guide.savesCount || 0);

    const handleLike = async () => {
        try {
            const response = await axios.post(
                `${API_URL}/guides/${guide.id}/like`,
                {},
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            );

            setLiked(response.data.liked);
            setLikesCount(response.data.liked ? likesCount + 1 : likesCount - 1);
        } catch (error) {
            console.error('Like guide error:', error);
        }
    };

    const handleSave = async () => {
        try {
            const response = await axios.post(
                `${API_URL}/guides/${guide.id}/save`,
                {},
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            );

            setSaved(response.data.saved);
            setSavesCount(response.data.saved ? savesCount + 1 : savesCount - 1);

            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Save guide error:', error);
        }
    };

    const handleStartTrip = async () => {
        Alert.alert(
            'Start Trip',
            'Do you want to start this trip now?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Start',
                    onPress: async () => {
                        try {
                            await axios.post(
                                `${API_URL}/guides/${guide.id}/start`,
                                {},
                                {
                                    headers: { Authorization: `Bearer ${accessToken}` },
                                }
                            );

                            Alert.alert('Success', 'Trip started! Check your home screen.');
                            router.replace('/');
                        } catch (error) {
                            console.error('Start trip error:', error);
                            Alert.alert('Error', 'Failed to start trip');
                        }
                    },
                },
            ]
        );
    };

    return (
        <TouchableOpacity style={styles.card} activeOpacity={0.9}>
            <Image
                source={{
                    uri:
                        guide.photos?.[0] ||
                        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600',
                }}
                style={styles.image}
            />

            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.gradient}
            >
                <View style={styles.content}>
                    <View style={styles.header}>
                        <View style={styles.userInfo}>
                            {guide.user?.profilePicture ? (
                                <Image
                                    source={{ uri: guide.user.profilePicture }}
                                    style={styles.avatar}
                                />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Ionicons name="person" size={16} color="#667eea" />
                                </View>
                            )}
                            <Text style={styles.userName}>{guide.user?.name || 'User'}</Text>
                        </View>
                    </View>

                    <Text style={styles.title} numberOfLines={2}>
                        {guide.title}
                    </Text>

                    <Text style={styles.description} numberOfLines={2}>
                        {guide.description}
                    </Text>

                    <View style={styles.footer}>
                        <View style={styles.stats}>
                            <TouchableOpacity
                                style={styles.statButton}
                                onPress={handleLike}
                            >
                                <Ionicons
                                    name={liked ? 'heart' : 'heart-outline'}
                                    size={20}
                                    color={liked ? '#EF4444' : '#FFFFFF'}
                                />
                                <Text style={styles.statText}>{likesCount}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.statButton}
                                onPress={handleSave}
                            >
                                <Ionicons
                                    name={saved ? 'bookmark' : 'bookmark-outline'}
                                    size={20}
                                    color={saved ? '#F59E0B' : '#FFFFFF'}
                                />
                                <Text style={styles.statText}>{savesCount}</Text>
                            </TouchableOpacity>

                            <View style={styles.statButton}>
                                <Ionicons name="navigate" size={20} color="#FFFFFF" />
                                <Text style={styles.statText}>{guide.startsCount || 0}</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.startButton}
                            onPress={handleStartTrip}
                        >
                            <LinearGradient
                                colors={['#10B981', '#059669']}
                                style={styles.startGradient}
                            >
                                <Ionicons name="play" size={16} color="#FFFFFF" />
                                <Text style={styles.startText}>Start</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        width: width - 48,
        height: 400,
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: '#F9FAFB',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    gradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '70%',
        justifyContent: 'flex-end',
    },
    content: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    avatarPlaceholder: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    userName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 8,
        lineHeight: 28,
    },
    description: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: 16,
        lineHeight: 20,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    stats: {
        flexDirection: 'row',
        gap: 16,
    },
    statButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    startButton: {
        borderRadius: 20,
        overflow: 'hidden',
    },
    startGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    startText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
