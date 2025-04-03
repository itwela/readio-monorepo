import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { colors, readioBoldFont, readioRegularFont } from '@/constants/tokens';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { IconSymbol } from './ui/IconSymbol';
import LotusGap from './LotusGap';

type WaterReminderProps = {
  dailyGoal?: number;
  reminderFrequency?: number; // in hours
  wantsReminder?: boolean;
  onUpdateGoal?: (goal: number) => void;
  onUpdateFrequency?: (hours: number) => void;
  containerStyle?: object;
};

const frequencyOptions = [1, 2, 3, 4, 6, 8];
const goalOptions = [
  { oz: 64, gallons: 0.5 },
  { oz: 128, gallons: 1 },
  { oz: 256, gallons: 2 }
];

export const LotusWaterReminderCard = ({ 
  dailyGoal = 128,
  reminderFrequency = 2,
  wantsReminder = false,
  onUpdateGoal,
  onUpdateFrequency,
  containerStyle 
}: WaterReminderProps) => {
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [isEditingFrequency, setIsEditingFrequency] = useState(false);

  const screenWidth = Dimensions.get('window').width;
  const cardWIdth = (screenWidth - 40) ; // 40 accounts for padding and gap
  
  const styles = StyleSheet.create({
    container: {
      width: cardWIdth,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 15,
      padding: 20,
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.3)',
      alignSelf: 'center',
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    title: {
      color: colors.readioWhite,
      fontFamily: readioBoldFont,
      fontSize: 18,
    },
    progressContainer: {
      marginBottom: 20,
    },
    progressText: {
      color: colors.readioWhite,
      fontFamily: readioRegularFont,
      fontSize: 16,
      marginBottom: 8,
    },
    progressBarContainer: {
      height: 8,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
      backgroundColor: colors.readioOrange,
      borderRadius: 4,
    },
    settingContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    settingLabel: {
      color: colors.readioWhite,
      fontFamily: readioRegularFont,
      fontSize: 16,
    },
    settingValue: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    valueText: {
      color: colors.readioWhite,
      fontFamily: readioBoldFont,
      fontSize: 16,
    },
    optionsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginTop: 10,
      marginBottom: 15,
    },
    option: {
      paddingHorizontal: 15,
      paddingVertical: 8,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 20,
    },
    selectedOption: {
      backgroundColor: colors.readioOrange,
    },
    optionText: {
      color: colors.readioWhite,
      fontFamily: readioRegularFont,
      fontSize: 14,
    },
  });

  return (
    <>
    <LotusGap backgroundColor='transparent' gapNumber={10}/>
    <Animated.View 
      entering={FadeInUp.duration(300)} 
      style={[styles.container, containerStyle]}
    >
      <View style={styles.headerContainer}>
        <View style={styles.titleContainer}>
          <IconSymbol
            name="drop.fill"
            size={20}
            color={colors.readioWhite}
          />
          <Text style={styles.title}>Drink Water Reminder</Text>
        </View>
        <IconSymbol
          name="bell.fill"
          size={20}
          color={colors.readioWhite}
        />
      </View>

      <Pressable 
        style={styles.settingContainer}
        onPress={() => setIsEditingGoal(!isEditingGoal)}
      >
        <Text style={styles.settingLabel}>Daily Goal</Text>
        <View style={styles.settingValue}>
          <Text style={styles.valueText}>{dailyGoal}oz</Text>
          <IconSymbol
            name="chevron.right"
            size={16}
            color={colors.readioWhite}
          />
        </View>
      </Pressable>

      {isEditingGoal && (
        <View style={styles.optionsContainer}>
          {goalOptions.map((goal) => (
            <Pressable
              key={goal.oz}
              style={[
                styles.option,
                dailyGoal === goal.oz && styles.selectedOption
              ]}
              onPress={() => {
                onUpdateGoal?.(goal.oz);
                setIsEditingGoal(false);
              }}
            >
              <Text style={styles.optionText}>{goal.oz}oz ({goal.gallons.toFixed(2)}gal)</Text>
            </Pressable>
          ))}
        </View>
      )}

      <Pressable 
        style={styles.settingContainer}
        onPress={() => setIsEditingFrequency(!isEditingFrequency)}
      >
        <Text style={styles.settingLabel}>Remind Every</Text>
        <View style={styles.settingValue}>
          <Text style={styles.valueText}>{reminderFrequency}h</Text>
          <IconSymbol
            name="chevron.right"
            size={16}
            color={colors.readioWhite}
          />
        </View>
      </Pressable>

      {isEditingFrequency && (
        <View style={styles.optionsContainer}>
          {frequencyOptions.map((hours) => (
            <Pressable
              key={hours}
              style={[
                styles.option,
                reminderFrequency === hours && styles.selectedOption
              ]}
              onPress={() => {
                onUpdateFrequency?.(hours);
                setIsEditingFrequency(false);
              }}
            >
              <Text style={styles.optionText}>{hours}h</Text>
            </Pressable>
          ))}
        </View>
      )}
    </Animated.View>
    </>
  );
};
