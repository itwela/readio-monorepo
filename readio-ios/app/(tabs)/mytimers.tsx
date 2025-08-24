import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { colors, readioBoldFont, readioRegularFont } from '@/constants/tokens';
import { useLotusAuth } from '@/helpers/providers/LotusAuthContext';
import { useLotusHaptic } from '@/helpers/providers/lotusHapticProvider';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { LotusPageDisplayName } from '@/components/LotusPageDisplayName';
import { LotusTimerPresetCard } from '@/components/LotusTimerPresetCard';
import { LotusActiveTimer } from '@/components/LotusActiveTimer';
import { useLotusTimer } from '@/helpers/providers/lotusTimerProvider';
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.readioBrown,
        height: '100%',
        width: '100%',
        paddingTop: 100,
    },
    scrollContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyStateText: {
        color: colors.readioWhite + 'CC',
        fontSize: 18,
        fontFamily: readioRegularFont,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 20,
    },
    emptyStateIcon: {
        fontSize: 48,
        marginBottom: 20,
        opacity: 0.6,
    },
    presetsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 15,
        paddingBottom: 100,
    },
    presetCard: {
        width: '100%',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    errorText: {
        color: colors.readioOrange,
        fontSize: 16,
        fontFamily: readioRegularFont,
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: colors.readioOrange,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
    },
    retryButtonText: {
        color: colors.readioWhite,
        fontSize: 16,
        fontFamily: readioBoldFont,
        fontWeight: 'bold',
    },
    dotsSeparator: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 5,
        width: '100%',
        flexDirection: 'row',
        gap: 25,
    },
    dot: {
        width: 25,
        height: 3,
        borderRadius: 3,
        backgroundColor: colors.readioOrange,
        marginHorizontal: 3,
        opacity: 0.25,
    },
});

export default function MyTimersScreen() {
    const { userId } = useLotusAuth();
    const { lightFeedback } = useLotusHaptic();
    const [refreshing, setRefreshing] = useState(false);

    // Get timer state to check if timer is active
    const { timerState, handleStartPreset } = useLotusTimer();

    // Fetch user's timer presets
    const customPresetsQuery = useQuery(api.timerPresets.getUserTimerPresets,
        userId ? { userId } : 'skip'
    );  

    // Delete preset mutation
    const deleteTimerPreset = useMutation(api.timerPresets.deleteTimerPreset);

    const customPresets = customPresetsQuery?.success ? customPresetsQuery.presets : [];
    const isLoading = customPresetsQuery === undefined;
    const hasError = customPresetsQuery && !customPresetsQuery.success;

    const handleStartPresetLocal = (preset: any) => {
        lightFeedback();
        // Use the provider's handleStartPreset function
        handleStartPreset(preset);
    };

    const handleDeletePreset = async (preset: any) => {
        lightFeedback();
        
        Alert.alert(
            'Delete Preset',
            `Are you sure you want to delete "${preset.name}"? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteTimerPreset({ presetId: preset._id });
                            lightFeedback();
                        } catch (error) {
                            console.error('Error deleting preset:', error);
                            Alert.alert('Error', 'Failed to delete preset. Please try again.');
                        }
                    }
                }
            ]
        );
    };

    const handleRetry = () => {
        setRefreshing(true);
        // Force a refetch
        setTimeout(() => setRefreshing(false), 1000);
    };

    // If timer is active, show the active timer display
    if (timerState.isRunning || timerState.currentPhase !== 'idle') {
        return (
            <View style={styles.container}>
                <LotusActiveTimer />
            </View>
        );
    }

    if (isLoading) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.readioOrange} />
                    <Text style={{ color: colors.readioWhite, marginTop: 20, fontFamily: readioRegularFont }}>
                        Loading your timers...
                    </Text>
                </View>
            </View>
        );
    }

    if (hasError) {
        return (
            <View style={styles.container}>
                <View style={styles.errorContainer}>
                    <FontAwesome name="exclamation-triangle" size={48} color={colors.readioOrange} />
                    <Text style={styles.errorText}>
                        Failed to load your timer presets. Please check your connection and try again.
                    </Text>
                    <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView 
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: 20 }}
            >
                <View style={styles.header}>
                    <LotusPageDisplayName title={`MY TIMERS (${customPresets?.length || 0})`} />
                    <Text style={{ 
                        color: colors.readioWhite + 'CC', 
                        fontSize: 16, 
                        fontFamily: readioRegularFont,
                        marginTop: 10,
                        textAlign: 'center'
                    }}>
                        Press start to start your favorite timer!
                    </Text>
                </View>

                {customPresets?.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateIcon}>⏱️</Text>
                        <Text style={styles.emptyStateText}>
                            You haven't saved any timer presets yet.{'\n\n'}
                            Create and save timers by going back the gym screen and pressing the lets go button!
                        </Text>
                    </View>
                ) : (
                    <View style={styles.presetsGrid}>
                        {customPresets?.map((preset, index) => (
                            <React.Fragment key={preset._id || index}>
                                <Animated.View 
                                    entering={FadeIn.duration(300).delay(index * 100)}
                                    style={styles.presetCard}
                                >
                                    <LotusTimerPresetCard
                                        timer={preset}
                                        onStart={() => handleStartPresetLocal(preset)}
                                        isSavedPreset={true}
                                    />
                                    <TouchableOpacity
                                        style={{
                                            backgroundColor: colors.readioBlack + '80',
                                            paddingVertical: 8,
                                            paddingHorizontal: 12,
                                            borderRadius: 8,
                                            marginTop: 8,
                                            alignItems: 'center',
                                            borderWidth: 1,
                                            borderColor: colors.readioOrange + '40',
                                            width: '100%',
                                        }}
                                        onPress={() => handleDeletePreset(preset)}
                                        activeOpacity={0.7}
                                    >
                                        <FontAwesome name="trash" size={12} color={colors.readioOrange} />
                                        <Text style={{
                                            color: colors.readioOrange,
                                            fontSize: 12,
                                            fontFamily: readioRegularFont,
                                            marginLeft: 6,
                                        }}>
                                            Delete
                                        </Text>
                                    </TouchableOpacity>
                                </Animated.View>
                                
                                {/* Orange dots separator (don't show after the last item) */}
                                {index < customPresets.length - 1 && (
                                    <View style={styles.dotsSeparator}>
                                        <View style={styles.dot} />
                                        <View style={styles.dot} />
                                        <View style={styles.dot} />
                                        <View style={styles.dot} />
                                        <View style={styles.dot} />
                                        <View style={styles.dot} />
                                        <View style={styles.dot} />
                                        <View style={styles.dot} />
                                        <View style={styles.dot} />
                                    </View>
                                )}
                            </React.Fragment>
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
