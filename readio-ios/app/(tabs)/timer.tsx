import LotusImageWithLoader from "@/components/LotusImageWithLoader";
import { LotusPageDisplayName } from "@/components/LotusPageDisplayName";
import { getLocalImageUri } from "@/constants/imageAssets";
import { colors } from "@/constants/tokens";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View, Pressable, Alert, TextInput } from "react-native";
import { useState, useEffect } from "react";
import LotusPresetTimerModal from "@/components/LotusModals/LotusPresetTimerModal";
import LotusCustomTimerModal from "@/components/LotusModals/LotusCustomTimerModal";
import { useLotusTimer } from "@/helpers/providers/lotusTimerProvider";
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useLotusAuth } from '@/helpers/providers/LotusAuthContext';
import { FontAwesome } from '@expo/vector-icons';
import { useLotusHaptic } from '@/helpers/providers/lotusHapticProvider';

export default function TimerScreen() {
    const [presetModalVisible, setPresetModalVisible] = useState(false);
    const [customModalVisible, setCustomModalVisible] = useState(false);
    const [selectedPresetName, setSelectedPresetName] = useState<string>('');
    const [isSavingPreset, setIsSavingPreset] = useState(false);
    const [showSavedConfirmation, setShowSavedConfirmation] = useState(false);

    // Get timer state
    const { 
        timerState, 
        currentTimer, 
        nextTimer, 
        pauseTimer, 
        stopTimer, 
        formatTime, 
        formatDuration, 
        presets,
        loadPreset,
        startChain,
        clearChain,
        addToChain,
        setTimerState,
        setTimerType,
        setPresetName,
        timerChain,
        getTotalChainTime
    } = useLotusTimer();

    // Get user auth and custom presets
    const { userId } = useLotusAuth();
    const customPresetsQuery = useQuery(api.timerPresets.getUserTimerPresets,
        userId ? { userId } : 'skip'
    );
    
    // Convex mutation for saving presets
    const createTimerPreset = useMutation(api.timerPresets.createTimerPreset);

    // Haptic feedback
    const { lightFeedback } = useLotusHaptic();

    const customPresets = customPresetsQuery?.success ? customPresetsQuery.presets : [];

    // Safely check if customPresets is available
    const safeCustomPresets = customPresets || [];

    // Haptic feedback for orange countdown
    useEffect(() => {
        const isOrangeCountdown = timerState.currentPhase === 'preparation' && 
                                  timerState.timeRemaining <= 3 && 
                                  timerState.timeRemaining >= 1;
        
        if (isOrangeCountdown) {
            lightFeedback();
        }
    }, [timerState.timeRemaining, timerState.currentPhase]);

    const handleTimerPress = (type: 'preset' | 'custom', presetName?: string) => {
        if (type === 'preset') {
            setSelectedPresetName(presetName || '');
            setPresetModalVisible(true);
        } else {
            setSelectedPresetName(presetName || ''); // presetName will be provided for saved custom presets
            setCustomModalVisible(true);
        }
    };

    const handleClosePresetModal = () => {
        setPresetModalVisible(false);
        setSelectedPresetName('');
    };

    const handleCloseCustomModal = () => {
        setCustomModalVisible(false);
        setSelectedPresetName('');
    };

    const handleStartPreset = (presetName: string) => {
        // Load and start built-in preset directly
        loadPreset(presetName);
        // Give a small delay to ensure preset is loaded, then start
        setTimeout(() => {
            startChain();
        }, 100);
        // Clear selected preset name to ensure fresh state next time
        setSelectedPresetName('');
    };

    const handleStartCustomPreset = async (preset: any) => {
        try {
            // Clear existing chain first
            clearChain();
            
            // Set timer type and preset name
            setTimerType('custom');
            setPresetName(preset.name);
            
            // Load the first timer settings into the current timer state
            const firstTimer = preset.chain[0];
            setTimerState({
                ...timerState,
                rounds: firstTimer.rounds,
                duration: firstTimer.duration,
                interval: firstTimer.interval,
                preparation: firstTimer.preparation,
                timeRemaining: firstTimer.duration * 60,
                timerType: 'custom',
                presetName: preset.name,
            });
            
            // Add each timer to the chain
            setTimeout(() => {
                preset.chain.forEach((timer: any) => {
                    // Temporarily set the timer state to match this chain item
                    setTimerState({
                        ...timerState,
                        rounds: timer.rounds,
                        duration: timer.duration,
                        interval: timer.interval,
                        preparation: timer.preparation,
                        timeRemaining: timer.duration * 60,
                    });
                    // Add to chain with the original name
                    addToChain(timer.name);
                });
                
                // Reset back to the first timer's settings and start
                setTimerState({
                    ...timerState,
                    rounds: firstTimer.rounds,
                    duration: firstTimer.duration,
                    interval: firstTimer.interval,
                    preparation: firstTimer.preparation,
                    timeRemaining: firstTimer.duration * 60,
                    timerType: 'custom',
                    presetName: preset.name,
                });
                
                // Start the chain
                setTimeout(() => {
                    startChain();
                }, 100);
            }, 100);
            
            // Clear selected preset name to ensure fresh state next time
            setSelectedPresetName('');
            
        } catch (error) {
            console.error('Error starting custom preset:', error);
        }
    };

    const handleQuickSavePreset = async () => {
        if (timerChain.length === 0) {
            Alert.alert('Nothing to Save', 'No timer chain found to save as preset.');
            return;
        }

        // Use existing timer name or generate one
        const presetName = timerState.presetName || `Timer ${Date.now().toString().slice(-4)}`;
        await saveCurrentAsPreset(presetName);
    };

    const saveCurrentAsPreset = async (presetName: string) => {
        if (!userId) {
            Alert.alert('Error', 'You must be logged in to save presets.');
            return;
        }

        setIsSavingPreset(true);
        
        try {
            // Structure optimized for Convex backend
            const presetData = {
                name: presetName,
                description: `Quick-saved ${timerChain.length}-timer preset`,
                type: 'custom' as const,
                userId: userId,
                isPublic: false,
                
                // Timer chain data
                chain: timerChain.map((timer, index) => ({
                    order: index,
                    name: timer.name,
                    rounds: timer.rounds,
                    duration: timer.duration,
                    interval: timer.interval,
                    preparation: timer.preparation,
                })),
                
                // Computed metadata
                totalTimers: timerChain.length,
                totalDuration: getTotalChainTime(),
                totalRounds: timerChain.reduce((sum, timer) => sum + timer.rounds, 0),
                
                // Tags for categorization
                tags: ['custom', 'quick-save'],
            };
            
            
            const result = await createTimerPreset(presetData);
            
            if (result.success) {
                // Show saved confirmation for 10 seconds
                setShowSavedConfirmation(true);
                setTimeout(() => {
                    setShowSavedConfirmation(false);
                }, 10000);
            } else {
                Alert.alert('Error', result.error || 'Failed to save preset');
            }
            
        } catch (error) {
            console.error('Error quick-saving preset:', error);
            Alert.alert('Error', 'Failed to save preset. Please try again.');
        } finally {
            setIsSavingPreset(false);
        }
    };

    // Check if timer is active
    const isTimerActive = timerState.isRunning || timerState.currentPhase !== 'idle';

    // Render active timer display
    const renderActiveTimer = () => {
        // Debug logging
        // console.log('=== TIMER UI DEBUG ===');
        // console.log('currentTimer:', currentTimer);
        // console.log('nextTimer:', nextTimer);

        return (
            <View style={styles.activeTimerContainer}>
                <View style={{ position: 'relative', width: '100%', alignItems: 'center' }}>
                    <LotusPageDisplayName title={timerState.presetName || currentTimer?.name || 'TIMER ACTIVE'} />
                    
                    {/* Quick Save Button - positioned in top right */}
                    {timerChain.length > 0 && timerState.timerType === 'custom' && !timerState.presetName && (
                        <Pressable
                            style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                padding: 8,
                                backgroundColor: showSavedConfirmation ? colors.readioOrange : colors.readioOrange + '80',
                                borderRadius: 20,
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 5,
                            }}
                            onPress={handleQuickSavePreset}
                            disabled={isSavingPreset || showSavedConfirmation}
                        >
                            <FontAwesome 
                                name={showSavedConfirmation ? "check" : "bookmark"} 
                                size={12} 
                                color={colors.readioWhite} 
                            />
                            <Text style={{ 
                                color: colors.readioWhite, 
                                fontSize: 10, 
                                fontWeight: 'bold' 
                            }}>
                                {showSavedConfirmation ? 'Preset Saved' : (isSavingPreset ? 'Saving...' : 'Save')}
                            </Text>
                        </Pressable>
                    )}
                </View>

                {/* Current Timer Info */}
                <View style={styles.currentTimerSection}>

                    <Text style={styles.phaseText}>
                        {timerState.currentPhase === 'preparation' && '🏃 PREPARATION'}
                        {timerState.currentPhase === 'work' && '💪 WORK TIME'}
                        {timerState.currentPhase === 'rest' && '😮‍💨 REST TIME'}
                        {timerState.currentPhase === 'complete' && '✅ COMPLETE'}
                    </Text>

                    <Text style={[
                        styles.timeDisplay,
                        timerState.currentPhase === 'preparation' && 
                        timerState.timeRemaining <= 3 && timerState.timeRemaining >= 1 
                            ? { color: colors.readioOrange } 
                            : {}
                    ]}>
                        {formatTime(timerState.timeRemaining)}
                    </Text>

                    {currentTimer && (
                        <Text style={styles.timerName}>
                            {currentTimer.name}
                        </Text>
                    )}

                    <Text style={styles.roundInfo}>
                        Round {timerState.currentRound} of {timerState.rounds}
                    </Text>
                </View>

                {/* Next Timer Preview */}
                {nextTimer && (
                    <View style={styles.nextTimerSection}>
                        <Text style={styles.nextTimerLabel}>Next Up:</Text>
                        <Text style={styles.nextTimerName}>{nextTimer.name}</Text>
                        <Text style={styles.nextTimerDetails}>
                            {nextTimer.rounds} rounds × {formatDuration(nextTimer.duration)}
                        </Text>
                    </View>
                )}

                {/* Control Buttons */}
                <View style={styles.controlButtons}>
                    <Pressable
                        style={[styles.controlButton, styles.pauseButton]}
                        onPress={pauseTimer}
                    >
                        <Text style={styles.controlButtonText}>
                            {timerState.isRunning ? 'PAUSE' : 'RESUME'}
                        </Text>
                    </Pressable>

                    <Pressable
                        style={[styles.controlButton, styles.stopButton]}
                        onPress={stopTimer}
                    >
                        <Text style={styles.controlButtonText}>STOP</Text>
                    </Pressable>
                </View>
            </View>
        );
    };

    const styles = StyleSheet.create({
        container: {
            backgroundColor: colors.readioBrown,
            height: '100%',
            width: '100%',
        },
        activeTimerContainer: {
            height: '100%',
            width: '90%',
            paddingVertical: 120,
            gap: 30,
            justifyContent: 'center',
            alignSelf: 'center',
            alignItems: 'center',
            position: 'relative',
        },
        currentTimerSection: {
            alignItems: 'center',
            gap: 15,
            paddingVertical: 30,
            backgroundColor: colors.readioBlack + '30',
            borderRadius: 20,
            width: '100%',
            paddingHorizontal: 20,
        },
        phaseText: {
            color: colors.readioOrange,
            fontSize: 16,
            fontWeight: 'bold',
        },
        timeDisplay: {
            color: colors.readioWhite,
            fontSize: 72,
            fontWeight: 'bold',
            fontFamily: 'monospace',
        },
        timerName: {
            color: colors.readioWhite,
            fontSize: 24,
            fontWeight: 'bold',
        },
        roundInfo: {
            color: colors.readioWhite + 'CC',
            fontSize: 18,
            fontWeight: 'bold',
        },
        nextTimerSection: {
            alignItems: 'center',
            gap: 8,
            paddingVertical: 20,
            backgroundColor: colors.readioOrange + '20',
            borderRadius: 15,
            width: '100%',
            paddingHorizontal: 20,
        },
        nextTimerLabel: {
            color: colors.readioOrange,
            fontSize: 14,
            fontWeight: 'bold',
        },
        nextTimerName: {
            color: colors.readioWhite,
            fontSize: 20,
            fontWeight: 'bold',
        },
        nextTimerDetails: {
            color: colors.readioWhite + 'CC',
            fontSize: 16,
        },
        controlButtons: {
            flexDirection: 'row',
            gap: 20,
            width: '100%',
        },
        controlButton: {
            flex: 1,
            paddingVertical: 15,
            paddingHorizontal: 20,
            borderRadius: 10,
            alignItems: 'center',
        },
        pauseButton: {
            backgroundColor: colors.readioOrange,
        },
        stopButton: {
            backgroundColor: colors.readioBlack,
        },
        controlButtonText: {
            color: colors.readioWhite,
            fontSize: 18,
            fontWeight: 'bold',
        },
    });

    const prestHeadingText = [
        'Get Started Fast!',
        'Try a preset to get the feel of things!',
    ]

    // Calculate actual preset metadata from timer provider
    const getPresetMetadata = (presetName: string) => {
        const preset = presets[presetName];
        if (!preset) return { totalTimers: 0, totalDuration: '0m' };

        const totalTimers = preset.chain.length;

        // Calculate total time using same logic as getTotalChainTime
        const totalSeconds = preset.chain.reduce((total: number, timer: any) => {
            const timerDuration = timer.rounds * timer.duration * 60; // Total work time
            const restTime = (timer.rounds - 1) * timer.interval; // Rest between rounds
            const prepTime = timer.preparation; // Preparation time
            return total + timerDuration + restTime + prepTime;
        }, 0);

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);

        const totalDuration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

        return { totalTimers, totalDuration };
    };

    const presetTimers = [
        {
            name: 'WORKOUT',
            ...getPresetMetadata('WORKOUT'),
        },
        {
            name: 'YOGA',
            ...getPresetMetadata('YOGA'),
        },
        {
            name: 'WORKFLOW',
            ...getPresetMetadata('WORKFLOW'),
        },
    ]

    return (
        <View style={styles.container}>
            {/* Background elements */}
            <LotusImageWithLoader
                source={{
                    uri: getLocalImageUri("aliGif"),
                }}
                style={{ zIndex: -2, position: 'absolute', width: '100%', height: '60%', backgroundColor: colors.readioBrown }}
                resizeMode="cover"
            />

            <LinearGradient
                colors={[colors.readioBrown, 'transparent']}
                style={{
                    zIndex: -1,
                    bottom: '60%',
                    position: 'absolute',
                    width: '150%',
                    height: 450,
                    transform: [{ rotate: '-180deg' }],
                }}
                start={{ x: 0.5, y: 0.2 }}
                end={{ x: 0.5, y: 1 }}
            />

            {/* Conditional content based on timer state */}
            {isTimerActive ? renderActiveTimer() : (
                <View style={{ height: '100%', width: '90%', paddingBottom: 120, paddingTop: 100, gap: 30, justifyContent: 'flex-start', alignSelf: 'center', alignItems: 'center', }}>

                    <LotusPageDisplayName title="TIMER" />

                    <View style={{ height: '100%', width: '100%', gap: 20, }}>

                        <View style={{ width: '100%', gap: 5, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', }}>
                            <Text style={{ color: colors.readioWhite, fontSize: 18, fontWeight: 'bold' }}>{prestHeadingText[0]}</Text>
                            <Text style={{ color: colors.readioWhite, fontSize: 16, fontWeight: 'bold' }}>{prestHeadingText[1]}</Text>
                        </View>

                        <View style={{ width: '100%', gap: 10, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', flexWrap: 'wrap', }}>
                            {presetTimers.map((timer, index) => (
                                <Pressable
                                    key={index}
                                    style={{ minWidth: '48%', paddingHorizontal: 10, paddingVertical: 15, backgroundColor: colors.readioBlack, borderRadius: 10, gap: 5, position: 'relative' }}
                                    onPress={() => handleTimerPress('preset', timer.name)}
                                >
                                    <Text style={{ color: colors.readioWhite, fontSize: 18, fontWeight: 'bold' }}>{timer.name}</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
                                        <Pressable
                                            style={{ 
                                                padding: 8, 
                                                backgroundColor: colors.readioOrange + '80', 
                                                borderRadius: 20, 
                                                marginRight: 10 
                                            }}
                                            onPress={(e) => {
                                                e.stopPropagation();
                                                handleStartPreset(timer.name);
                                            }}
                                        >
                                            <FontAwesome name="play" size={12} color={colors.readioWhite} />
                                        </Pressable>
                                        <Text style={{ color: colors.readioWhite + 'CC', fontSize: 12, fontWeight: 'bold' }}>{timer.totalDuration}</Text>
                                    </View>
                                </Pressable>
                            ))}
                        </View>

                        {/* Custom Presets Section */}
                        {safeCustomPresets.length > 0 && (
                            <>
                                <View style={{ width: '100%', gap: 3, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', }}>
                                    <Text style={{ color: colors.readioWhite, fontSize: 18, fontWeight: 'bold' }}>Your Custom Presets</Text>
                                    <Text style={{ color: colors.readioWhite, fontSize: 16, fontWeight: 'bold' }}>Your saved timer configurations</Text>
                                </View>

                                <View style={{ width: '100%', gap: 8, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', flexWrap: 'wrap', }}>
                                    {safeCustomPresets.map((preset, index) => (
                                        <Pressable
                                            key={preset._id}
                                            style={{ minWidth: '48%', paddingHorizontal: 15, paddingVertical: 15, gap: 5, backgroundColor: colors.readioOrange + '30', borderRadius: 10, borderWidth: 1, borderColor: colors.readioOrange + '60', position: 'relative' }}
                                            onPress={() => handleTimerPress('custom', preset.name)}
                                        >
                                            <Text style={{ color: colors.readioWhite, fontSize: 18, fontWeight: 'bold' }}>{preset.name}</Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
                                                <Pressable
                                                    style={{ 
                                                        padding: 8, 
                                                        backgroundColor: colors.readioOrange, 
                                                        borderRadius: 20, 
                                                        marginRight: 10 
                                                    }}
                                                    onPress={(e) => {
                                                        e.stopPropagation();
                                                        handleStartCustomPreset(preset);
                                                    }}
                                                >
                                                    <FontAwesome name="play" size={12} color={colors.readioWhite} />
                                                </Pressable>
                                                <Text style={{ color: colors.readioWhite + 'CC', fontSize: 12, fontWeight: 'bold' }}>{preset.totalDuration}</Text>
                                            </View>
                                        </Pressable>
                                    ))}
                                </View>
                            </>
                        )}
                        <View style={{ width: '100%', gap: 3, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', }}>
                            <Text style={{ color: colors.readioWhite, fontSize: 18, fontWeight: 'bold' }}>or...</Text>
                        </View>

                        <Pressable
                            style={{ width: '100%', paddingHorizontal: 10, paddingVertical: 15, backgroundColor: colors.readioBlack, borderRadius: 10, }}
                            onPress={() => handleTimerPress('custom')}
                        >
                            <Text style={{ color: colors.readioWhite, fontSize: 18, fontWeight: 'bold' }}>CUSTOMIZE YOUR OWN</Text>
                        </Pressable>

                    </View>

                </View>
            )}

            {/* Timer Modals */}
            <LotusPresetTimerModal
                visible={presetModalVisible}
                onClose={handleClosePresetModal}
                presetName={selectedPresetName}
            />
            
            <LotusCustomTimerModal
                visible={customModalVisible}
                onClose={handleCloseCustomModal}
                presetName={selectedPresetName}
            />
        </View>
    )
}