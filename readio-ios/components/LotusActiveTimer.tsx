import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { colors, readioBoldFont, readioRegularFont } from '@/constants/tokens';
import { useLotusTimer } from '@/helpers/providers/lotusTimerProvider';
import { useLotusHaptic } from '@/helpers/providers/lotusHapticProvider';
import { LotusPageDisplayName } from '@/components/LotusPageDisplayName';
import Animated, { FadeIn } from "react-native-reanimated";

interface LotusActiveTimerProps {
  onClose?: () => void;
}

export function LotusActiveTimer({ onClose }: LotusActiveTimerProps) {
  const {
    timerState,
    currentTimer,
    pauseTimer,
    stopTimer,
    formatCountdownTime,
    timerMode,
    showSavedConfirmation,
    handleQuickSavePreset,
  } = useLotusTimer();

  const { lightFeedback } = useLotusHaptic();

  const styles = StyleSheet.create({
    container: {
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
    headerContainer: {
      position: 'relative',
      width: '100%',
      alignItems: 'center',
    },
    quickSaveButton: {
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
    },
    quickSaveText: {
      color: colors.readioWhite,
      fontSize: 12,
      fontFamily: readioBoldFont,
      fontWeight: 'bold'
    },
    modeText: {
      color: colors.readioWhite,
      fontSize: 16,
      fontFamily: readioBoldFont,
      fontWeight: 'bold'
    },
    infoText: {
      color: colors.readioWhite,
      textAlign: 'center',
      marginTop: 15,
      opacity: 0.8,
      fontFamily: readioRegularFont,
      fontSize: 14
    }
  });

  return (
    <Animated.View 
      entering={FadeIn.duration(300)} 
      style={styles.container}
    >
      <View style={styles.headerContainer}>
        <LotusPageDisplayName title={timerState.presetName || currentTimer?.name || 'TIMER ACTIVE'} />

        {/* Quick Save Button - positioned in top right */}
        <Text allowFontScaling={false} style={styles.modeText}>{timerMode}</Text>
        {currentTimer && timerState.timerType === 'saved' && !timerState.presetName && (
          <Pressable
            style={styles.quickSaveButton}
            onPress={handleQuickSavePreset}
            disabled={showSavedConfirmation}
          >
            <FontAwesome
              name={showSavedConfirmation ? "check" : "bookmark"}
              size={14}
              color={colors.readioWhite}
            />
            <Text allowFontScaling={false} style={styles.quickSaveText}>
              {showSavedConfirmation ? 'Saved!' : 'Save'}
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

        <Animated.View entering={FadeIn.duration(200).delay(600)}>
          <Text allowFontScaling={false} style={styles.infoText}>
            🔇 Please ensure your device is not on silent mode for timer sounds and cues.
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
} 