import LotusImageWithLoader from "@/components/LotusImageWithLoader";
import { LotusPageDisplayName } from "@/components/LotusPageDisplayName";
import { getLocalImageUri } from "@/constants/imageAssets";
import { colors, readioBoldFont, readioRegularFont } from "@/constants/tokens";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View, Pressable, Alert, Animated as RNAnimated, TextInput, ScrollView, Dimensions, TouchableOpacity, Switch, ActivityIndicator } from "react-native";
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
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import LotusGap from "@/components/LotusGap";

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.readioBrown,
        height: '100%',
        width: '100%',
        paddingTop: 100,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: colors.readioBrown,
        padding: 20,
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 24,
        color: colors.readioWhite,
        fontFamily: readioBoldFont,
        fontWeight: 'bold',
    },
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    closeButton: {
        width: 35,
        height: 35,
        borderRadius: 17.5,
        backgroundColor: colors.readioOrange,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContainer: {
        flex: 1,
    },
    section: {
        marginBottom: 25,
        width: '100%',
    },
      sectionTitle: {
        fontSize: 18,
        color: colors.readioWhite,
        fontFamily: readioBoldFont,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    nameInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.readioBlack + '20',
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderWidth: 1,
        width: '100%',
        borderColor: colors.readioOrange + '30',
    },
    nameInput: {
        flex: 1,
        fontSize: 16,
        color: colors.readioWhite,
        fontFamily: readioRegularFont,
        width: '100%',
    },
    settingsList: {
        gap: 0,
        width: '100%',
    },
    addToChainButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.readioBlack,
        borderRadius: 12,
        paddingVertical: 15,
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    updateButton: {
        backgroundColor: colors.readioOrange,
    },
    addToChainText: {
        color: colors.readioWhite,
        fontSize: 16,
        fontFamily: readioBoldFont,
        fontWeight: 'bold',
    },
    chainHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
      },
      clearButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        backgroundColor: colors.readioBrown + '60',
        borderRadius: 8,
      },
      clearButtonText: {
        color: colors.readioWhite,
        fontFamily: readioRegularFont,
        fontSize: 14,
      },
      chainList: {
        gap: 0,
    },
    savePresetButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.readioBlack,
        borderRadius: 12,
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: colors.readioOrange + '40',
        width: '45%',
        alignSelf: 'center',
      },
      savePresetText: {
        color: colors.readioWhite,
        fontSize: 16,
        fontFamily: readioBoldFont,
        fontWeight: 'bold',
    },
    modeToggleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.readioBlack,
        borderRadius: 12,
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: colors.readioOrange + '40',
        width: '45%',
        alignSelf: 'center',
      },
      modeToggleText: {
        color: colors.readioWhite,
        fontSize: 16,
        fontFamily: readioBoldFont,
        fontWeight: 'bold',
      },
    activeTimerContainer: {
        height: '100%',
        width: '95%',
        gap: 25,
        alignSelf: 'center',
        alignItems: 'center',
        position: 'relative',
        justifyContent: 'space-between'
    },
    currentTimerSection: {
        alignItems: 'center',
        gap: 20,
        paddingVertical: 35,
        paddingHorizontal: 25,
        backgroundColor: colors.readioBlack + '25',
        borderRadius: 24,
        width: '100%',
        borderWidth: 1,
        borderColor: colors.readioOrange + '30',
        shadowColor: colors.readioOrange,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
    },
    phaseText: {
        color: colors.readioOrange,
        fontSize: 18,
        fontFamily: readioBoldFont,
        fontWeight: 'bold',
        textAlign: 'center',
        paddingHorizontal: 20,
        paddingVertical: 8,
        backgroundColor: colors.readioOrange + '20',
        borderRadius: 20,
        overflow: 'hidden',
    },
    timeDisplay: {
        color: colors.readioWhite,
        fontSize: 110,
        fontWeight: 'bold',
        fontFamily: 'monospace',
        textAlign: 'center',
        textShadowColor: colors.readioOrange + '40',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 8,
    },
    timerName: {
        color: colors.readioWhite,
        fontSize: 28,
        fontFamily: readioBoldFont,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    roundInfo: {
        color: colors.readioWhite + 'DD',
        fontSize: 20,
        fontFamily: readioRegularFont,
        textAlign: 'center',
        paddingHorizontal: 16,
        paddingVertical: 6,
        backgroundColor: colors.readioBlack + '40',
        borderRadius: 12,
    },
    nextTimerSection: {
        alignItems: 'center',
        gap: 12,
        paddingVertical: 25,
        paddingHorizontal: 25,
        backgroundColor: colors.readioOrange + '15',
        borderRadius: 20,
        width: '100%',
        borderWidth: 1,
        borderColor: colors.readioOrange + '40',
        shadowColor: colors.readioOrange,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    nextTimerLabel: {
        color: colors.readioOrange,
        fontSize: 16,
        fontFamily: readioBoldFont,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    nextTimerName: {
        color: colors.readioWhite,
        fontSize: 22,
        fontFamily: readioBoldFont,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    nextTimerDetails: {
        color: colors.readioWhite + 'CC',
        fontSize: 18,
        fontFamily: readioRegularFont,
        textAlign: 'center',
    },
    controlButtons: {
        flexDirection: 'row',
        gap: 16,
        width: '100%',
        paddingHorizontal: 10,
        marginBottom: '30%',
    },
    controlButton: {
        flex: 1,
        paddingVertical: 18,
        paddingHorizontal: 24,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: colors.readioBlack,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    pauseButton: {
        backgroundColor: colors.readioOrange,
    },
    stopButton: {
        backgroundColor: colors.readioBlack + '80',
        borderWidth: 1,
        borderColor: colors.readioOrange + '40',
    },
    controlButtonText: {
        color: colors.readioWhite,
        fontSize: 20,
        fontFamily: readioBoldFont,
        fontWeight: 'bold',
    },
    scrollViewContent: {
        paddingBottom: 120,
        paddingTop: 20,
        paddingHorizontal: 20,
        gap: 30,
        justifyContent: 'flex-start',
        alignSelf: 'center',
        zIndex: 1000,
        backgroundColor: colors.readioBrown,
        position: 'relative',
    },
    iconMargin: {
        marginRight: 10,
    },
    settingLabel: {
        color: colors.readioWhite,
        fontSize: 16,
        fontFamily: readioBoldFont,
        fontWeight: 'bold',
    },
});

const itemStyles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 10,
      paddingHorizontal: 20,
      backgroundColor: colors.readioBlack + '15',
      borderRadius: 16,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.readioOrange + '20',
      width: '100%',
      shadowColor: colors.readioOrange,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    labelContainer: {
      flex: 1,
      marginRight: 20,
    },
    label: {
      fontSize: 18,
      color: colors.readioWhite,
      fontFamily: readioBoldFont,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 12,
      color: colors.readioWhite + '80',
      fontFamily: readioRegularFont,
    },
    valueContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.readioOrange + '20',
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.readioOrange + '40',
    },
    button: {
      width: 48,
      height: 48,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.readioOrange,
    },
    buttonPressed: {
      backgroundColor: colors.readioOrange + 'CC',
    },
    valueDisplay: {
      minWidth: 90,
      height: 48,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.readioBlack + '80',
      paddingHorizontal: 12,
    },
    valueText: {
      fontSize: 18,
      color: colors.readioWhite,
      fontFamily: readioBoldFont,
      fontWeight: 'bold',
    },
    iconContainer: {
      width: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
});
  
const chainStyles = StyleSheet.create({
container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: colors.readioBlack + '20',
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.readioBlack + '40',
},
selectedContainer: {
    backgroundColor: colors.readioOrange + '40',
    borderColor: colors.readioOrange + '80',
    borderWidth: 2,
},
indexContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.readioBlack,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
},
selectedIndexContainer: {
    backgroundColor: colors.readioOrange,
},
indexText: {
    fontSize: 14,
    color: colors.readioWhite,
    fontFamily: readioBoldFont,
    fontWeight: 'bold',
},
infoContainer: {
    flex: 1,
    justifyContent: 'center',
},
detailsText: {
    fontSize: 16,
    color: colors.readioWhite,
    fontFamily: readioBoldFont,
    fontWeight: 'bold',
},
selectedText: {
    color: colors.readioWhite,
},
removeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.readioBrown + '60',
    justifyContent: 'center',
    alignItems: 'center',
},
});

export default function TimerScreen() {

    const [isSavingPreset, setIsSavingPreset] = useState(false);
    const [showSavedConfirmation, setShowSavedConfirmation] = useState(false);
    const [showSavedPresetsScreen, setShowSavedPresetsScreen] = useState(false);
    const scaleValue = useRef(new RNAnimated.Value(0)).current;
    const translateYValue = useRef(new RNAnimated.Value(100)).current;
    const [editingTimerId, setEditingTimerId] = useState<string | null>(null);
    const [currentTimerName, setCurrentTimerName] = useState<string>('');
    const [sessionType, setSessionType] = useState<string>('');

    // NOTE - Get timer state
    const {
        timerMode, setTimerMode, timerState, currentTimer, isSwitchingTimerMode, nextTimer,
        pauseTimer, stopTimer, formatTime, formatCountdownTime, formatDuration, presets,
        loadPreset, startChain, clearChain, addToChain, setTimerState, setTimerType,
        setPresetName, timerChain, getTotalChainTime, getPresetMetadata, getPresetTimers,
        handleStartCustomPreset, handleQuickSavePreset, saveCurrentAsPreset, presetModalVisible,
        customModalVisible, selectedPresetName, setPresetModalVisible, setCustomModalVisible,
        setSelectedPresetName, handleTimerPress, updateTimerInChain, handleClosePresetModal,
        handleCloseCustomModal, handleStartPreset, incrementRounds, decrementRounds,
        incrementDuration, decrementDuration, incrementPreparation, decrementPreparation,
        incrementRest, decrementRest, formatRestTime, removeFromChain, playTimerSound,
        cycleTimerMode, wantsTimerSounds, setWantsTimerSounds,
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

    // Calculate initial scroll offset so second card is centered
    const CARD_WIDTH = 150;
    const GAP = 15;
    const PADDING = 5;
    const screenWidth = Dimensions.get('window').width;
    const secondCardCenter = PADDING + CARD_WIDTH + GAP + CARD_WIDTH / 2;
    const initialOffsetX = Math.max(0, secondCardCenter - screenWidth / 2);

    // NOTE - Safely check if customPresets is available
    const safeCustomPresets = customPresets || [];
    // Separate favorites (tagged 'favorite') from history
    const favoritePresets = safeCustomPresets.filter(p => p.tags && p.tags.includes('favorite'));
    const historyPresets = safeCustomPresets;

    // NOTE - Haptic feedback for orange countdown
    useEffect(() => {

        const preparationThreshold = timerState.preparation > 0 ? Math.ceil(timerState.preparation * 0.2) : 0;

        const isOrangeCountdown = timerState.currentPhase === 'preparation' &&
            timerState.timeRemaining <= preparationThreshold &&
            timerState.timeRemaining >= 1;

        const countdownHasStarted = timerState.currentPhase === 'preparation' &&
            timerState.preparation > 0 &&
            timerState.timeRemaining === preparationThreshold;


        if (isOrangeCountdown) {
            lightFeedback();
        }

        if (countdownHasStarted && wantsTimerSounds) {

            timerMode === 'Workout' ? playTimerSound('workoutAboutToStart') : 
            timerMode === 'Workflow' ? playTimerSound('workflowAboutToStart') : 
            timerMode === 'Work-In' ? playTimerSound('workInAboutToStart') : 
            playTimerSound('workoutAboutToStart');

        }

    }, [timerState.timeRemaining, timerState.currentPhase]);

    // Check if timer is active
    const isTimerActive = timerState.isRunning || timerState.currentPhase !== 'idle';

    // Render active timer display
    const renderActiveTimer = () => {

        return (
            <Animated.View 
                entering={FadeIn.duration(300)} 
                style={styles.activeTimerContainer}
            >
                <View style={{ position: 'relative', width: '100%', alignItems: 'center' }}>
                    <LotusPageDisplayName title={timerState.presetName || currentTimer?.name || 'TIMER ACTIVE'} />

                    {/* Quick Save Button - positioned in top right */}
                    <Text allowFontScaling={false} style={{color: colors.readioWhite, fontSize:16, fontFamily: readioBoldFont, fontWeight: 'bold', transform: [{ translateY:  20 }]}}>{timerMode}</Text>
                    {timerChain.length > 0 && timerState.timerType === 'saved' && !timerState.presetName && (
                        <Pressable
                            style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                padding: 12,
                                backgroundColor: showSavedConfirmation ? colors.readioOrange : colors.readioOrange + '80',
                                borderRadius: 24,
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 6,
                                shadowColor: colors.readioOrange,
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.3,
                                shadowRadius: 4,
                                elevation: 3,
                            }}
                            onPress={handleQuickSavePreset}
                            disabled={isSavingPreset || showSavedConfirmation}
                        >
                            <FontAwesome
                                name={showSavedConfirmation ? "check" : "bookmark"}
                                size={14}
                                color={colors.readioWhite}
                            />
                            <Text allowFontScaling={false} style={{
                                color: colors.readioWhite,
                                fontSize: 12,
                                fontFamily: readioBoldFont,
                                fontWeight: 'bold'
                            }}>
                                {showSavedConfirmation ? 'Saved!' : (isSavingPreset ? 'Saving...' : 'Save')}
                            </Text>
                        </Pressable>
                    )}
                </View>

                {/* Current Timer Info */}
                <Animated.View 
                    entering={FadeIn.duration(400).delay(100)}
                    style={[styles.currentTimerSection, {
                        transform: [{ translateY: '-30%' }]
                    }]}
                >
                    <Animated.View entering={FadeIn.duration(200).delay(200)}>
                        <Text allowFontScaling={false} style={styles.phaseText}>
                            {timerState.currentPhase === 'preparation' && '🏃 PREPARATION'}
                            {timerState.currentPhase === 'work' && '💪 WORK TIME'}
                            {timerState.currentPhase === 'rest' && '😮‍💨 REST TIME'}
                            {timerState.currentPhase === 'complete' && '✅ COMPLETE'}
                        </Text>
                    </Animated.View>

                    <Animated.View entering={FadeIn.duration(300).delay(300)}>
                        <Text allowFontScaling={false} style={[
                            styles.timeDisplay,
                            timerState.isFlashingRed ? { 
                                color: '#FF4444',
                                textShadowColor: '#FF4444',
                                textShadowOffset: { width: 0, height: 4 },
                                textShadowRadius: 12,
                            } :
                                timerState.isFlashingGreen ? { 
                                    color: '#44FF44',
                                    textShadowColor: '#44FF44',
                                    textShadowOffset: { width: 0, height: 4 },
                                    textShadowRadius: 12,
                                } :
                                    timerState.currentPhase === 'preparation' &&
                                        timerState.timeRemaining <= 3 && timerState.timeRemaining >= 1
                                        ? { 
                                            color: colors.readioOrange,
                                            textShadowColor: colors.readioOrange,
                                            textShadowOffset: { width: 0, height: 4 },
                                            textShadowRadius: 12,
                                        }
                                        : {}
                        ]}>
                            {formatCountdownTime(timerState.timeRemaining)}
                        </Text>
                    </Animated.View>

                    {currentTimer && (
                        <Animated.View entering={FadeIn.duration(200).delay(400)}>
                            <Text allowFontScaling={false} style={styles.timerName}>
                                {currentTimer.name}
                            </Text>
                        </Animated.View>
                    )}

                    <Animated.View entering={FadeIn.duration(200).delay(500)}>
                        <Text allowFontScaling={false} style={styles.roundInfo}>
                            Round {timerState.currentRound} of {timerState.rounds}
                        </Text>
                    </Animated.View>
                </Animated.View>

                {/* Control Buttons */}
                <Animated.View 
                    entering={FadeIn.duration(300).delay(700)}
                    style={styles.controlButtons}
                >
                    <TouchableOpacity
                        style={[styles.controlButton, styles.pauseButton]}
                        onPress={pauseTimer}
                        activeOpacity={0.8}
                    >
                        <Text allowFontScaling={false} style={styles.controlButtonText}>
                            {timerState.isRunning ? 'PAUSE' : 'RESUME'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.controlButton, styles.stopButton]}
                        onPress={stopTimer}
                        activeOpacity={0.8}
                    >
                        <Text allowFontScaling={false} style={styles.controlButtonText}>STOP</Text>
                    </TouchableOpacity>
                </Animated.View>

            </Animated.View>
        );
    };

    const presetTimers = getPresetTimers();

    const handleEditTimer = (timerId: string) => {
        // If already editing this timer, deselect it
        if (editingTimerId === timerId) {
          setEditingTimerId(null);
          lightFeedback();
          return;
        }
        
        // Find the timer and load its settings for editing
        const timerToEdit = timerChain.find(t => t.id === timerId);
        if (timerToEdit) {
          setTimerState({
            ...timerState,
            rounds: timerToEdit.rounds,
            duration: timerToEdit.duration,
            rest: timerToEdit.rest,
            preparation: timerToEdit.preparation,
            timeRemaining: timerToEdit.duration * 60,
          });
          setEditingTimerId(timerId);
          lightFeedback();
        }
      };
    
    const handleUpdateTimer = () => {
    if (editingTimerId) {
        const updates = {
        rounds: timerState.rounds,
        duration: timerState.duration,
        rest: timerState.rest,
        preparation: timerState.preparation,
        };
        
        updateTimerInChain(editingTimerId, updates);
            
        setEditingTimerId(null);
        lightFeedback();
    }
      };

      const handleAddToChain = () => {
        if (!currentTimerName.trim()) return;
        
        addToChain(currentTimerName.trim());
        setCurrentTimerName(''); // Clear the name field after adding
        lightFeedback();
      };

      const handleClose = () => {
        lightFeedback();
        setEditingTimerId(null);
        setCurrentTimerName('');
        setSessionType('');
      };

    return (
        <View style={styles.container}>

            {/* NOTE - Conditional content based on timer state */}
            {isTimerActive && renderActiveTimer()}

            {/* NOTE - Timer Selection when completely stopped (idle) */}
            {!timerState.isRunning && timerState.currentPhase === 'idle' && (
                <>
                <View style={{}}>

                    <ScrollView 
                        contentContainerStyle={styles.scrollViewContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Timer Settings Section */}
                        <View style={styles.section}>

                            <View style={{alignItems: 'center', justifyContent: 'center', transform: [{ translateY: '-25%' }]}}>
                                <Text allowFontScaling={false} style={{color: colors.readioWhite, fontSize:16, fontFamily: readioBoldFont, fontWeight: 'bold', transform: [{ translateY:  20 }]}}>{timerMode}</Text>
                                <LotusPageDisplayName title="INTERVAL TIMER" />
                            </View>

                            {!isSwitchingTimerMode && (   
                                <View style={styles.settingsList}>
                                    <TimerSettingItem
                                        label="Rounds"
                                        value={timerState.rounds.toString()}
                                        onIncrement={incrementRounds}
                                        onDecrement={decrementRounds}
                                        subtitle="Number of rounds..."
                                        delay={100}
                                    />
                                    <TimerSettingItem
                                        label="Time To Prepare"
                                        value={formatTime(timerState.preparation)}
                                        onIncrement={incrementPreparation}
                                        onDecrement={decrementPreparation}
                                        subtitle="Getting ready..."
                                        delay={200}
                                    />
                                    <TimerSettingItem
                                        label="Round Duration"
                                        value={formatDuration(timerState.duration)}
                                        onIncrement={incrementDuration}
                                        onDecrement={decrementDuration}
                                        subtitle="How long each round lasts..."
                                        delay={300}
                                    />
                                    <TimerSettingItem
                                        label="Rest Duration"
                                        value={formatRestTime(timerState.rest)}
                                        onIncrement={incrementRest}
                                        onDecrement={decrementRest}
                                        subtitle="Rest between rounds..."
                                        delay={400}
                                    />
                                </View>
                            )}

                            {isSwitchingTimerMode && (
                                <View style={{alignItems: 'center', justifyContent: 'center', height: '80%'}}>
                                    <ActivityIndicator size="large" color={colors.readioOrange} />
                                </View>
                            )}

                            {/* Timer Sound Toggle */}
                            <View style={styles.settingsList}>

                                <Text allowFontScaling={false} style={{color: colors.readioWhite, fontSize: 28, fontFamily: readioBoldFont, fontWeight: 'bold', paddingHorizontal: 20, paddingVertical: 10, textAlign: 'center'}}>
                                    Additional Settings
                                </Text>

                                <LotusGap gapNumber={10} backgroundColor={colors.readioBrown} />

                               <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingHorizontal: 20, paddingVertical: 10, width: '100%'}}>
                                <Text allowFontScaling={false} style={styles.settingLabel}>Timer Sounds</Text>
                                <Switch
                                    value={wantsTimerSounds}
                                    onValueChange={() => setWantsTimerSounds(!wantsTimerSounds)}
                                />
                               </View>

                                <LotusGap gapNumber={100} backgroundColor={colors.readioBrown} />

                            </View>
                        </View>


                    </ScrollView>

                </View>

                <View style={{position: 'absolute', bottom: 80, left: 0, right: 0, backgroundColor: colors.readioBrown, paddingVertical: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,}}>
                    {/* Mode Toggle Button */}
                    <TouchableOpacity
                        style={[styles.modeToggleButton, {gap: 4}]}
                        onPress={() => {
                            lightFeedback();
                            cycleTimerMode();
                        }}
                        activeOpacity={0.99}
                    >
                        <Text allowFontScaling={false} style={[styles.modeToggleText, { color: colors.readioOrange }]}>
                            {timerMode}
                        </Text>
                        <Text allowFontScaling={false} style={[styles.modeToggleText, { }]}>
                            {'Mode'}
                        </Text>
                    </TouchableOpacity>

                    {/* Start Chain Button */}
                    <TouchableOpacity
                        style={[styles.savePresetButton, { backgroundColor: colors.readioOrange }]}
                        onPress={() => {
                            lightFeedback();
                            console.log('Starting chain with length:', timerChain.length);
                            startChain();
                            setTimeout(() => {
                                handleClose();
                            }, 100);
                        }}
                        activeOpacity={0.7}
                    >
                        <FontAwesome name="play" size={18} color={colors.readioWhite} style={styles.iconMargin} />
                        <Text allowFontScaling={false} style={styles.savePresetText}>
                            {'Start Timer'}
                        </Text>
                    </TouchableOpacity>
                </View>

                </>
            )}

            {/* NOTE - Custom Timer Modal */}
            <LotusCustomTimerModal
                visible={customModalVisible}
                onClose={handleCloseCustomModal}
                presetName={selectedPresetName}
            />

        </View>
    )
}

// Award-winning timer setting item component
const TimerSettingItem = ({ 
    label, 
    value, 
    onIncrement, 
    onDecrement,
    subtitle = '',
    delay = 0
  }: { 
    label: string; 
    value: string; 
    onIncrement: () => void; 
    onDecrement: () => void;
    subtitle?: string;
    delay?: number;
  }) => {
    const { lightFeedback } = useLotusHaptic();
    const [isDecrementPressed, setIsDecrementPressed] = useState(false);
    const [isIncrementPressed, setIsIncrementPressed] = useState(false);
  
    return (
      <Animated.View entering={FadeIn.duration(delay)} exiting={FadeOut.duration(delay)} style={itemStyles.container}>
        <View style={itemStyles.labelContainer}>
          <Text allowFontScaling={false} style={itemStyles.label}>{label}</Text>
          {subtitle && (
            <Text allowFontScaling={false} style={itemStyles.subtitle}>{subtitle}</Text>
          )}
        </View>
        
        <View style={itemStyles.valueContainer}>
          <TouchableOpacity 
            style={[
              itemStyles.button,
              isDecrementPressed && itemStyles.buttonPressed
            ]}
            onPress={() => {
              lightFeedback();
              onDecrement();
            }}
            onPressIn={() => setIsDecrementPressed(true)}
            onPressOut={() => setIsDecrementPressed(false)}
            activeOpacity={0.8}
          >
            <View style={itemStyles.iconContainer}>
              <FontAwesome name="minus" size={14} color={colors.readioWhite} />
            </View>
          </TouchableOpacity>
          
          <View style={itemStyles.valueDisplay}>
            <Text allowFontScaling={false} style={itemStyles.valueText}>{value}</Text>
          </View>
          
          <TouchableOpacity 
            style={[
              itemStyles.button,
              isIncrementPressed && itemStyles.buttonPressed
            ]}
            onPress={() => {
              lightFeedback();
              onIncrement();
            }}
            onPressIn={() => setIsIncrementPressed(true)}
            onPressOut={() => setIsIncrementPressed(false)}
            activeOpacity={0.8}
          >
            <View style={itemStyles.iconContainer}>
              <FontAwesome name="plus" size={14} color={colors.readioWhite} />
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
};

// Timer chain item display component
const ChainItem = ({ 
    item, 
    index, 
    onRemove,
    onEdit,
    isSelected = false,
    formatDuration,
    formatRestTime
  }: { 
    item: any; 
    index: number; 
    onRemove: () => void;
    onEdit: () => void;
    isSelected?: boolean;
    formatDuration: (minutes: number) => string;
    formatRestTime: (restMinutes: number) => string;
  }) => {
    const { lightFeedback } = useLotusHaptic();
  
    return (
      <TouchableOpacity 
        style={[
          chainStyles.container,
          isSelected && chainStyles.selectedContainer
        ]}
        onPress={() => {
          lightFeedback();
          onEdit();
        }}
        activeOpacity={0.7}
      >
        <View style={[
          chainStyles.indexContainer,
          isSelected && chainStyles.selectedIndexContainer
        ]}>
          <Text allowFontScaling={false} style={chainStyles.indexText}>{index + 1}</Text>
        </View>
        
        <View style={chainStyles.infoContainer}>
          <Text allowFontScaling={false} style={[
            chainStyles.detailsText,
            isSelected && chainStyles.selectedText
          ]}>
            {item.name}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={chainStyles.removeButton}
          onPress={(e) => {
            e.stopPropagation(); // Prevent triggering the edit
            lightFeedback();
            onRemove();
          }}
          activeOpacity={0.7}
        >
          <FontAwesome name="trash" size={14} color={colors.readioWhite} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
};