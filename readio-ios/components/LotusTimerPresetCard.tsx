import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { colors, readioBoldFont, readioRegularFont } from '@/constants/tokens';
import { useLotusHaptic } from '@/helpers/providers/lotusHapticProvider';
import { useLotusTimer } from '@/helpers/providers/lotusTimerProvider';

interface TimerPreset {
  name: string;
  totalDuration: string;
  _id?: string; // For saved presets
  rounds?: number;
  duration?: number;
  rest?: number;
  timerMode?: string;
}

interface LotusTimerPresetCardProps {
  timer: TimerPreset;
  onStart?: () => void;
  isSavedPreset?: boolean;
}

export function LotusTimerPresetCard({ timer, onStart, isSavedPreset = false }: LotusTimerPresetCardProps) {
  const { lightFeedback } = useLotusHaptic();
  const { 
    getDurationDisplay,
    handleStartPreset
  } = useLotusTimer();
  
  // Get duration display info using provider function
  const durationDisplay = getDurationDisplay(timer.duration);

  // Handle starting the timer with this preset's settings
  const handleStartTimer = () => {
    if (onStart) {
      onStart();
    } else {
      // Use the provider's handleStartPreset function
      handleStartPreset(timer);
      lightFeedback();
    }
  };


  
  const styles = StyleSheet.create({
    container: {
      width: '100%',
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: 'rgba(255, 255, 255, 0.15)',
      padding: 24,
      position: 'relative',
      minHeight: 140,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'stretch',
      // Enhanced Shadow Effect
      shadowColor: colors.readioOrange,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 6,
    },
    headerContainer: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 20,
    },
    titleContainer: {
      flex: 1,
      alignItems: 'flex-start',
      gap: 10,
      maxWidth: '61.8%',
    },
    title: {
      color: colors.readioWhite,
      fontSize: 20,
      fontWeight: 'bold',
      fontFamily: readioBoldFont,
      textAlign: 'left',
      marginBottom: 4,
    },
    subtitle: {
      color: colors.readioDustyWhite + 'DD',
      fontSize: 13,
      fontFamily: readioRegularFont,
      textAlign: 'left',
      lineHeight: 18,
    },
    contentContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'stretch',
      width: '100%',
      gap: 16,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.06)',
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    statItem: {
      alignItems: 'center',
      flex: 1,
    },
    statValue: {
      color: colors.readioOrange,
      fontSize: 18,
      fontWeight: 'bold',
      fontFamily: readioBoldFont,
      marginBottom: 4,
    },
    statLabel: {
      color: colors.readioDustyWhite + 'CC',
      fontSize: 11,
      fontFamily: readioRegularFont,
      textAlign: 'center',
    },
    startButton: {
      backgroundColor: colors.readioOrange,
      paddingHorizontal: 28,
      paddingVertical: 16,
      borderRadius: 28,
      alignItems: 'center',
      width: '100%',
      // Enhanced Button shadow
      shadowColor: colors.readioOrange,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 4,
    },
    startButtonText: {
      color: colors.readioWhite,
      fontSize: 16,
      fontWeight: 'bold',
      fontFamily: readioBoldFont,
      letterSpacing: 0.5,
    },
    modeContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    modeText: {
      color: colors.readioOrange,
      fontSize: 12,
      fontWeight: 'bold',
      fontFamily: readioBoldFont,
      textTransform: 'uppercase',
    },
  });

  return (
    <View style={styles.container}>


      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.titleContainer}>
          <Text allowFontScaling={false} style={styles.title}>{timer.name} Timer</Text>
        </View>
        
        {/* Timer Mode Display */}
        <View style={styles.modeContainer}>
          <Text allowFontScaling={false} style={styles.modeText}>
            {timer.timerMode || 'Workout'}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        {/* Stats Display */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text allowFontScaling={false} style={styles.statValue}>{timer.rounds}</Text>
            <Text allowFontScaling={false} style={styles.statLabel}>
              {timer.rounds === 1 ? 'ROUND' : 'ROUNDS'}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text allowFontScaling={false} style={styles.statValue}>{durationDisplay.value}</Text>
            <Text allowFontScaling={false} style={styles.statLabel}>
              {durationDisplay.unit === 'SEC' ? 'SEC/ROUND' : 'MIN/ROUND'}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text allowFontScaling={false} style={styles.statValue}>{timer.rest}</Text>
            <Text allowFontScaling={false} style={styles.statLabel}>
              {timer.rest === 1 ? 'SEC REST' : 'SECS REST'}
            </Text>
          </View>
        </View>

        {/* Start Button */}
        <Pressable 
          style={styles.startButton} 
          onPress={handleStartTimer}
          onPressIn={() => lightFeedback()}
        >
          <Text allowFontScaling={false} style={styles.startButtonText}>Start Timer</Text>
        </Pressable>
      </View>
    </View>
  );
} 