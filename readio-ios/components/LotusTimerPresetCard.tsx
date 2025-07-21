import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { colors, readioBoldFont, readioRegularFont } from '@/constants/tokens';
import { useLotusHaptic } from '@/helpers/providers/lotusHapticProvider';

interface TimerPreset {
  name: string;
  totalDuration: string;
  _id?: string; // For saved presets
  rounds?: number;
  duration?: number;
  rest?: number;
}

interface LotusTimerPresetCardProps {
  timer: TimerPreset;
  onEdit: () => void;
  onStart?: () => void;
  isSavedPreset?: boolean;
}

export function LotusTimerPresetCard({ timer, onEdit, onStart, isSavedPreset = false }: LotusTimerPresetCardProps) {
  const { lightFeedback } = useLotusHaptic();
  const styles = StyleSheet.create({
    container: {
      width: 150,
      backgroundColor: colors.readioOrange + '20',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.readioOrange + '40',
      padding: 15,
      position: 'relative',
      minHeight: 180,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    emoji: {
      fontSize: 24,
      marginBottom: 8,
      textAlign: 'center',
    },
    title: {
      color: colors.readioWhite,
      fontSize: 18,
      fontWeight: 'bold',
      fontFamily: readioBoldFont,
      marginBottom: 10,
      textAlign: 'center',
    },
    durationTag: {
      backgroundColor: colors.readioOrange,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      alignSelf: 'center',
    },
    durationText: {
      color: colors.readioWhite,
      fontSize: 12,
      fontWeight: 'bold',
      fontFamily: readioBoldFont,
    },
    editButton: {
      backgroundColor: colors.readioOrange,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      alignSelf: 'center',
      width: '80%',
      alignItems: 'center',
    },
    editButtonText: {
      color: colors.readioWhite,
      fontSize: 10,
      fontWeight: 'bold',
      fontFamily: readioBoldFont,
    },
    centerContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
    },
    startButton: {
      backgroundColor: colors.readioBlack,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: 'center',
      width: '100%',
    },
    startButtonText: {
      color: colors.readioWhite,
      fontSize: 14,
      fontWeight: 'bold',
      fontFamily: readioBoldFont,
    },
  });

  // Format duration for display
  const formatDuration = (duration: string) => {
    // Extract minutes from duration string like "30m" or "1h 30m"
    const match = duration.match(/(\d+)m/);
    if (match) {
      return `${match[1]} MIN`;
    }
    return duration.toUpperCase();
  };

  return (
    <View style={styles.container}>

      {/* Center Content */}
      <View style={styles.centerContent}>
        {/* Emoji */}
        <Text allowFontScaling={false} style={styles.emoji}>
          {timer.name === 'WORK OUT' ? '💪' : 
           timer.name === 'WORK IN' ? '🧘' : 
           timer.name === 'WORK FLOW' ? '💼' : '⚡'}
        </Text>

        {/* Title */}
        <Text allowFontScaling={false} style={styles.title}>{timer.name}</Text>

        {/* Edit Tag */}
        <Pressable style={styles.editButton} onPress={onEdit}>
          <Text allowFontScaling={false} style={styles.durationText}>VIEW</Text>
        </Pressable>

      </View>

    </View>
  );
} 