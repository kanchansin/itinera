import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';

const { width } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.100:5000/api';

interface LiveTripWidgetProps {
    onEndTrip?: () => void;
}

export default function LiveTripWidget({ onEndTrip }: LiveTripWidgetProps) {
    const router = useRouter();
    const { accessToken } = useAuth();
    const [activeTrip, setActiveTrip] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentStopIndex, setCurrentStopIndex] = useState(0);

    useEffect(() => {
        loadActiveTrip();
    }, []);

    const loadActiveTrip = async () => {
        if (!accessToken) {
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${API_URL}/trips/active`, {
                headers: { Authorization: `Bearer ${accessToken}` },
                timeout: 5000, // Short timeout - fail fast
            });
            setActiveTrip(response.data);
        } catch (error: any) {
            // Silently handle - no active trip is normal
            if (error.response?.status !== 404 && error.code !== 'ECONNABORTED') {
                console.log('Active trip check failed:', error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEndTrip = async () => {
        if (!activeTrip) return;

        try {
            await axios.post(
                `${API_URL}/trips/${activeTrip.id}/end`,
                {},
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                    timeout: 10000,
                }
            );

            router.push({
                pathname: '/(tabs)/create-guide',
                params: { tripId: activeTrip.id },
            });

            if (onEndTrip) onEndTrip();
        } catch (error) {
            console.error('End trip error:', error);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#667eea" />
            </View>
        );
    }

    if (!activeTrip) {
        return null;
    }

    const currentStop = activeTrip.stops?.[currentStopIndex];
    const progress = ((currentStopIndex + 1) / (activeTrip.stops?.length || 1)) * 100;

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#667eea', '#764ba2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
            >
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <View style={styles.liveIndicator}>
                            <View style={styles.liveDot} />
                            <Text style={styles.liveText}>LIVE</Text>
                        </View>
                        <Text style={styles.tripTitle}>{activeTrip.title || activeTrip.tripName}</Text>
                    </View>
                    <TouchableOpacity onPress={handleEndTrip} style={styles.endButton}>
                        <Ionicons name="stop-circle" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                {currentStop && (
                    <View style={styles.currentStop}>
                        <View style={styles.stopIconContainer}>
                            <Ionicons name="location" size={32} color="#FFFFFF" />
                        </View>
                        <View style={styles.stopInfo}>
                            <Text style={styles.stopLabel}>Current Stop</Text>
                            <Text style={styles.stopName}>{currentStop.name}</Text>
                            <Text style={styles.stopDuration}>
                                {currentStop.duration} min
                            </Text>
                        </View>
                    </View>
                )}

                <View style={styles.progressSection}>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${progress}%` }]} />
                    </View>
                    <Text style={styles.progressText}>
                        Stop {currentStopIndex + 1} of {activeTrip.stops?.length || 0}
                    </Text>
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                            if (currentStopIndex > 0) {
                                setCurrentStopIndex(currentStopIndex - 1);
                            }
                        }}
                        disabled={currentStopIndex === 0}
                    >
                        <Ionicons
                            name="chevron-back"
                            size={20}
                            color={currentStopIndex === 0 ? 'rgba(255,255,255,0.3)' : '#FFFFFF'}
                        />
                        <Text
                            style={[
                                styles.actionText,
                                currentStopIndex === 0 && styles.actionTextDisabled,
                            ]}
                        >
                            Previous
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                            if (currentStopIndex < (activeTrip.stops?.length || 0) - 1) {
                                setCurrentStopIndex(currentStopIndex + 1);
                            }
                        }}
                        disabled={currentStopIndex === (activeTrip.stops?.length || 0) - 1}
                    >
                        <Text
                            style={[
                                styles.actionText,
                                currentStopIndex === (activeTrip.stops?.length || 0) - 1 &&
                                styles.actionTextDisabled,
                            ]}
                        >
                            Next
                        </Text>
                        <Ionicons
                            name="chevron-forward"
                            size={20}
                            color={
                                currentStopIndex === (activeTrip.stops?.length || 0) - 1
                                    ? 'rgba(255,255,255,0.3)'
                                    : '#FFFFFF'
                            }
                        />
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 24,
        marginVertical: 16,
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
    },
    card: {
        borderRadius: 24,
        padding: 20,
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    headerLeft: {
        flex: 1,
    },
    liveIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    liveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#10B981',
        marginRight: 6,
    },
    liveText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 1,
    },
    tripTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    endButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    currentStop: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
    },
    stopIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    stopInfo: {
        flex: 1,
    },
    stopLabel: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 4,
        fontWeight: '500',
    },
    stopName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    stopDuration: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '500',
    },
    progressSection: {
        marginBottom: 20,
    },
    progressBar: {
        height: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        gap: 4,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    actionTextDisabled: {
        color: 'rgba(255, 255, 255, 0.3)',
    },
});
