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
  onStart: () => void;
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
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: colors.readioOrange,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      zIndex: 10,
      minWidth: 50,
      minHeight: 20,
      justifyContent: 'center',
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
      {/* Edit Button */}
      <Pressable
        style={styles.editButton}
        onPress={() => {
          console.log('Edit button pressed for timer:', timer.name);
          lightFeedback();
          onEdit();
        }}
      >
        <Text style={styles.editButtonText}>EDIT</Text>
      </Pressable>

      {/* Center Content */}
      <View style={styles.centerContent}>
        {/* Title */}
        <Text style={styles.title}>{timer.name}</Text>

        {/* Duration Tag */}
        <View style={styles.durationTag}>
          <Text style={styles.durationText}>{formatDuration(timer.totalDuration)}</Text>
        </View>
      </View>

      {/* Start Button */}
      <Pressable
        style={styles.startButton}
        onPress={onStart}
      >
        <Text style={styles.startButtonText}>START</Text>
      </Pressable>
    </View>
  );
} 