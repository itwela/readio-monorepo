import LotusImageWithLoader from "@/components/LotusImageWithLoader";
import { LotusPageDisplayName } from "@/components/LotusPageDisplayName";
import { getLocalImageUri } from "@/constants/imageAssets";
import { colors } from "@/constants/tokens";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { useState } from "react";
import LotusTimerModal from "@/components/LotusModals/LotusTimerModal";
import { useLotusTimer } from "@/helpers/providers/lotusTimerProvider";

export default function TimerScreen() {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedTimerType, setSelectedTimerType] = useState<'preset' | 'custom'>('preset');
    const [selectedPresetName, setSelectedPresetName] = useState<string>('');
    
    // Get timer state
    const { timerState, currentTimer, nextTimer, pauseTimer, stopTimer, formatTime, formatDuration } = useLotusTimer();

    const handleTimerPress = (type: 'preset' | 'custom', presetName?: string) => {
        setSelectedTimerType(type);
        if (presetName) {
            setSelectedPresetName(presetName);
        }
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
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
                <LotusPageDisplayName title="TIMER ACTIVE" />
                
                {/* Current Timer Info */}
                <View style={styles.currentTimerSection}>
                    
                    <Text style={styles.phaseText}>
                        {timerState.currentPhase === 'preparation' && '🏃 PREPARATION'}
                        {timerState.currentPhase === 'work' && '💪 WORK TIME'}
                        {timerState.currentPhase === 'rest' && '😮‍💨 REST TIME'}
                        {timerState.currentPhase === 'complete' && '✅ COMPLETE'}
                    </Text>
                    
                    <Text style={styles.timeDisplay}>
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

    const presetTimers = [
        {
            name: 'WORKOUT',
        },
        {
            name: 'YOGA',
        },
        {
            name: 'WORKFLOW',
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
                <View style={{ height: '100%', width: '90%', paddingVertical: 120, gap: 30, justifyContent: 'flex-start', alignSelf: 'center', alignItems: 'center', }}>
                   
                    <LotusPageDisplayName title="TIMER" />

                    <View style={{ height: '100%', width: '100%', gap: 20, }}>       

                        <View style={{ width: '100%', gap: 3, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', }}>
                            <Text style={{ color: colors.readioWhite, fontSize: 18, fontWeight: 'bold' }}>{prestHeadingText[0]}</Text>
                            <Text style={{ color: colors.readioWhite, fontSize: 16, fontWeight: 'bold' }}>{prestHeadingText[1]}</Text>
                        </View>

                        {presetTimers.map((timer, index) => (
                            <Pressable 
                                key={index} 
                                style={{ width: '100%', paddingHorizontal: 10, paddingVertical: 15, backgroundColor: colors.readioBlack, borderRadius: 10, }}
                                onPress={() => handleTimerPress('preset', timer.name)}
                            >
                                <Text style={{ color: colors.readioWhite, fontSize: 18, fontWeight: 'bold' }}>{timer.name}</Text>
                            </Pressable>
                        ))}

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

            {/* Timer Modal */}
            <LotusTimerModal
                visible={modalVisible}
                onClose={handleCloseModal}
                timerType={selectedTimerType}
                presetName={selectedPresetName}
            />
        </View>
    )
}