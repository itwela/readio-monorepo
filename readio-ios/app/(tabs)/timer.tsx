import LotusImageWithLoader from "@/components/LotusImageWithLoader";
import { LotusPageDisplayName } from "@/components/LotusPageDisplayName";
import { getLocalImageUri } from "@/constants/imageAssets";
import { colors, readioBoldFont, readioRegularFont } from "@/constants/tokens";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View, Pressable, Alert, TextInput, ScrollView } from "react-native";
import { useState, useEffect, useRef } from "react";
import LotusPresetTimerModal from "@/components/LotusModals/LotusPresetTimerModal";
import LotusCustomTimerModal from "@/components/LotusModals/LotusCustomTimerModal";
import { LotusTimerPresetCard } from "@/components/LotusTimerPresetCard";
import { useLotusTimer } from "@/helpers/providers/lotusTimerProvider";
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useLotusAuth } from '@/helpers/providers/LotusAuthContext';
import { FontAwesome } from '@expo/vector-icons';
import { useLotusHaptic } from '@/helpers/providers/lotusHapticProvider';


export default function TimerScreen() {
    
    const [isSavingPreset, setIsSavingPreset] = useState(false);
    const [showSavedConfirmation, setShowSavedConfirmation] = useState(false);
    const [showSavedPresetsScreen, setShowSavedPresetsScreen] = useState(false);
    
    // NOTE - Get timer state
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
        getTotalChainTime,
        getPresetMetadata,
        getPresetTimers,
        handleStartCustomPreset,
        handleQuickSavePreset,
        saveCurrentAsPreset,
        presetModalVisible,
        customModalVisible,
        selectedPresetName,
        setPresetModalVisible,
        setCustomModalVisible,
        setSelectedPresetName,
        handleTimerPress,
        handleClosePresetModal,
        handleCloseCustomModal,
        handleStartPreset
    } = useLotusTimer();

    // NOTE - Get user auth and custom presets
    const { userId } = useLotusAuth();
    const customPresetsQuery = useQuery(api.timerPresets.getUserTimerPresets,
        userId ? { userId } : 'skip'
    );
    
    // NOTE - Convex mutation for saving presets
    const createTimerPreset = useMutation(api.timerPresets.createTimerPreset);

    // NOTE - Haptic feedback
    const { lightFeedback } = useLotusHaptic();

    const customPresets = customPresetsQuery?.success ? customPresetsQuery.presets : [];

    // NOTE - Safely check if customPresets is available
    const safeCustomPresets = customPresets || [];

    // NOTE - Haptic feedback for orange countdown
    useEffect(() => {
        const isOrangeCountdown = timerState.currentPhase === 'preparation' && 
                                  timerState.timeRemaining <= 3 && 
                                  timerState.timeRemaining >= 1;
        
        if (isOrangeCountdown) {
            lightFeedback();
        }
    }, [timerState.timeRemaining, timerState.currentPhase]);



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
                    {timerChain.length > 0 && timerState.timerType === 'saved' && !timerState.presetName && (
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
                        timerState.isFlashingRed ? { color: '#FF4444' } :
                        timerState.isFlashingGreen ? { color: '#44FF44' } :
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
            fontSize: 100,
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

    const presetTimers = getPresetTimers();

    return (
        <View style={styles.container}>
            {/* NOTE - Background elements */}
            <LotusImageWithLoader
                source={{
                    uri: getLocalImageUri("aliGif"),
                }}
                style={{ zIndex: -2, position: 'absolute', width: '100%', height: '60%', backgroundColor: colors.readioBrown }}
                resizeMode="cover"
            />

            {/* NOTE - Background gradient */}
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

            {/* NOTE - Conditional content based on timer state */}
            {isTimerActive && renderActiveTimer()}

            {/* NOTE - Timer Selection when not running */}
            {!timerState.isRunning && !showSavedPresetsScreen && (
                <View style={{ height: '100%', width: '95%', paddingBottom: 120, paddingTop: 100, gap: 30, justifyContent: 'flex-start', alignSelf: 'center', alignItems: 'center', }}>

                    <LotusPageDisplayName title="INTERVAL TIMER" />

                    <ScrollView contentContainerStyle={{ width: '100%', gap: 20, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', }}>
                    {/* Header Section */}
                    <View style={{ width: '100%', alignItems: 'center', gap: 10 }}>
                        <Text style={{ color: colors.readioWhite + 'CC', fontSize: 16, fontFamily: readioRegularFont }}>
                            Get Started With:
                        </Text>
                        <Text style={{ color: colors.readioWhite, fontSize: 32, fontWeight: 'bold', fontFamily: readioBoldFont }}>
                            PRESETS
                        </Text>
                        <Text style={{ color: colors.readioWhite + 'CC', fontSize: 14, fontFamily: readioRegularFont, textAlign: 'center', lineHeight: 20 }}>
                            Press the play button to begin instantly, or press edit to tailor to your needs
                        </Text>
                    </View>

                    {/* Preset Timer Cards Section */}
                    <View style={{ width: '100%', gap: 20 }}>
                        <ScrollView 
                            horizontal 
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ 
                                paddingHorizontal: 5,
                                gap: 15,
                                flexDirection: 'row',
                                alignItems: 'flex-start',
                            }}
                            style={{ height: 200 }}
                        >
                            {presetTimers.map((timer, index) => (
                                <LotusTimerPresetCard
                                    key={index}
                                    timer={timer}
                                    onEdit={() => handleTimerPress('preset', timer?.name)}
                                    onStart={() => handleStartPreset(timer?.name)}
                                />
                            ))}
                        </ScrollView>
                    </View>

                    {/* View Saved Interval Timers Button */}
                    <View
                        style={{ 
                            padding: 10, 
                            backgroundColor: colors.readioOrange, 
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: colors.readioOrange,
                            alignItems: 'center',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            gap: 10,
                            alignSelf: 'stretch',
                        }}
                    >
                        <Text style={{ color: colors.readioWhite, fontSize: 16, fontWeight: 'bold', fontFamily: readioBoldFont }}>
                            View Saved Interval Timers
                        </Text>
                        <FontAwesome name="chevron-down" size={16} color={colors.readioWhite} />
                    </View>


                    {/* My Timers Section */}
                    <View style={{ width: '100%', gap: 15 }}>
                        <View style={{ 
                            width: '100%', 
                            height: 1, 
                            backgroundColor: colors.readioWhite + '30',
                            marginVertical: 10 
                        }} />
                        
                        <View style={{ 
                            width: '100%', 
                            flexDirection: 'row', 
                            justifyContent: 'space-between', 
                            alignItems: 'center' 
                        }}>
                            <Text style={{ color: colors.readioWhite, fontSize: 24, fontWeight: 'bold', fontFamily: readioBoldFont }}>
                                My Timers
                            </Text>
                            <Text style={{ color: colors.readioWhite + 'CC', fontSize: 16, fontFamily: readioRegularFont }}>
                                ({safeCustomPresets.length})
                            </Text>
                        </View>
                    </View>

                    </ScrollView>

                </View>
            )}

            {/* NOTE - Saved Presets Screen */}
            {!timerState.isRunning && showSavedPresetsScreen && (
                <View style={{ height: '100%', width: '90%', paddingBottom: 120, paddingTop: 100, gap: 30, justifyContent: 'flex-start', alignSelf: 'center', alignItems: 'center', }}>
                    
                    <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Pressable
                            style={{ 
                                padding: 8, 
                                backgroundColor: colors.readioOrange, 
                                borderRadius: 12,
                                borderWidth: 1,
                                borderColor: colors.readioOrange
                            }}
                            onPress={() => setShowSavedPresetsScreen(false)}
                        >
                            <FontAwesome name="arrow-left" size={16} color={colors.readioWhite} />
                        </Pressable>
                        <Text style={{ color: colors.readioWhite, fontSize: 24, fontWeight: 'bold' }}>Your Saved Presets</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    <View style={{ height: '100%', width: '100%', gap: 20, }}>
                        {safeCustomPresets.length > 0 ? (
                            <>
                                <View style={{ width: '100%', gap: 3, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', }}>
                                    <Text style={{ color: colors.readioWhite, fontSize: 18, fontWeight: 'bold' }}>Your customized timer configurations</Text>
                                    <Text style={{ color: colors.readioWhite + 'CC', fontSize: 16, fontWeight: 'bold' }}>{safeCustomPresets.length} saved preset{safeCustomPresets.length !== 1 ? 's' : ''}</Text>
                                </View>

                                <ScrollView 
                                    horizontal 
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={{ 
                                        paddingHorizontal: 20,
                                        gap: 15,
                                        flexDirection: 'row',
                                        alignItems: 'flex-start'
                                    }}
                                    style={{ height: 320 }}
                                >
                                    {safeCustomPresets.map((preset, index) => (
                                        <LotusTimerPresetCard
                                            key={preset._id}
                                            timer={preset}
                                            onEdit={() => handleTimerPress('saved', preset.name)}
                                            onStart={() => handleStartCustomPreset(preset)}
                                            isSavedPreset={true}
                                        />
                                    ))}
                                </ScrollView>
                            </>
                        ) : (
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20 }}>
                                <FontAwesome name="bookmark-o" size={64} color={colors.readioWhite + '40'} />
                                <View style={{ alignItems: 'center', gap: 10 }}>
                                    <Text style={{ color: colors.readioWhite, fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>No Saved Presets Yet</Text>
                                    <Text style={{ color: colors.readioWhite + 'CC', fontSize: 16, fontWeight: 'bold', textAlign: 'center' }}>Modify a workout, yoga, or workflow preset{'\n'}and save it to see it here!</Text>
                                </View>
                            </View>
                        )}
                    </View>

                </View>
            )}

            {/* NOTE - Timer Modals */}
            <LotusPresetTimerModal
                visible={presetModalVisible}
                onClose={handleClosePresetModal}
                presetName={selectedPresetName}
            />
            
            {/* NOTE - Custom Timer Modal */}
            <LotusCustomTimerModal
                visible={customModalVisible}
                onClose={handleCloseCustomModal}
                presetName={selectedPresetName}
            />

        </View>
    )
}