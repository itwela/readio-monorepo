import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { colors, readioBoldFont, readioRegularFont } from '@/constants/tokens';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { IconSymbol } from './ui/IconSymbol';
import LotusGap from './LotusGap';
import LotusToggleIcon from './LotusToggleIcon';
import { useLotusGoals } from '@/helpers/providers/lotusGoalsContext';
import Slider from '@react-native-community/slider';

type WaterReminderProps = {
  dailyGoal?: number;
  reminderFrequency?: number; // in hours
  wantsReminder?: boolean;
  onUpdateGoal?: (goal: number) => void;
  onUpdateFrequency?: (hours: number) => void;
  containerStyle?: object;
};

const RECOMMENDED_DAILY_INTAKE = 64; // oz (about 8 cups)
const MIN_DAILY_INTAKE = 32; // oz (4 cups)
const MAX_DAILY_INTAKE = 256; // oz (32 cups)
const frequencyOptions = [1, 2, 3, 4, 6, 8];

export const LotusWaterReminderCard = ({ 
  dailyGoal = 128,
  reminderFrequency = 2,
  wantsReminder = false,
  onUpdateGoal,
  onUpdateFrequency,
  containerStyle 
}: WaterReminderProps) => {
  const [isEditingFrequency, setIsEditingFrequency] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [sliderValue, setSliderValue] = useState(dailyGoal);
  const { goals, updateGoal } = useLotusGoals();

  const handleSliderComplete = (value: number) => {
    onUpdateGoal?.(Math.round(value));
  };

  const screenWidth = Dimensions.get('window').width;
  const cardWIdth = (screenWidth - 40) ; // 40 accounts for padding and gap
  

const styles = StyleSheet.create({
    goalContainer: {
      marginBottom: isCustomizing ? 20 : 0,
    },
    goalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    slider: {
      width: '100%',
      height: 40,
      marginBottom: 10,
    },
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
      fontFamily: readioBoldFont,
      fontSize: 16,
    },
    optionSubtext: {
      color: colors.readioWhite,
      fontFamily: readioRegularFont,
      fontSize: 12,
      opacity: 0.8,
    },
    modeToggleContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 10,
      marginBottom: 15,
      width: '100%',
    },
    modeToggle: {
      paddingHorizontal: 15,
      paddingVertical: 8,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 20,
      flex: 1,
      alignItems: 'center',
    },
    selectedMode: {
      backgroundColor: colors.readioOrange,
    },
    modeToggleText: {
      color: colors.readioWhite,
      fontFamily: readioRegularFont,
      fontSize: 14,
    },
    presetContainer: {
      width: '100%',
      gap: 10,
    },
    customInputContainer: {
      width: '100%',
      gap: 10,
      alignItems: 'center',
    },
    customInput: {
      width: '100%',
      height: 40,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 20,
      paddingHorizontal: 15,
      color: colors.readioWhite,
      fontFamily: readioRegularFont,
      fontSize: 16,
    },
    customSaveButton: {
      backgroundColor: colors.readioOrange,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
      alignItems: 'center',
      width: '50%',
    },
    customizeButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 20,
      marginTop: 10,
      alignSelf: 'center',
    },
    customizeButtonActive: {
      backgroundColor: colors.readioOrange,
    },
    customizeButtonText: {
      color: colors.readioWhite,
      fontFamily: readioBoldFont,
      fontSize: 14,
    },
    disabledButton: {
      opacity: 0.5,
    },
    customSaveButtonText: {
      color: colors.readioWhite,
      fontFamily: readioBoldFont,
      fontSize: 14,
    },
    recommendedContainer: {
      padding: 15,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 10,
      marginBottom: 15,
    },
    recommendedText: {
      color: colors.readioWhite,
      fontFamily: readioRegularFont,
      fontSize: 14,
      textAlign: 'center',
    },
    optionalText: {
      color: colors.readioWhite,
      fontFamily: readioRegularFont,
      fontSize: 12,
      opacity: 0.7,
      textAlign: 'right',
      marginTop: 5,
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
          <Text style={styles.title}>Drink Water</Text>
        </View>
        <Pressable
          onPress={() => {
            if (goals?.[0]) {
              updateGoal(goals[0].id, { isEnabled: !goals[0].isEnabled });
            }
          }}
        >
          <LotusToggleIcon
            isEnabled={goals?.[0]?.isEnabled}
            enabledIcon={'bell'}
            disabledIcon={'bell-off'}
          />
        </Pressable>
      </View>

      <View style={styles.goalContainer}>
        <View style={styles.recommendedContainer}>
          <Text style={styles.recommendedText}>
            Recommended daily water intake:
          </Text>
          <Text style={styles.recommendedText}>
          8 cups ({RECOMMENDED_DAILY_INTAKE}oz) 
          </Text>
          <Pressable 
            style={[styles.customizeButton, isCustomizing && styles.customizeButtonActive]}
            onPress={() => setIsCustomizing(!isCustomizing)}
          >
            <Text style={styles.customizeButtonText}>
              {isCustomizing ? 'Looks Good' : 'Set Custom Goal'}
            </Text>
          </Pressable>
        </View>

        {isCustomizing && (
          <>
            <View style={styles.goalHeader}>
              <Text style={styles.settingLabel}>Today's Water Goal?</Text>
              <Text style={styles.valueText}>{Math.round(sliderValue/8)} cups ({Math.round(sliderValue)}oz)</Text>
            </View>
            
            <Slider
              style={styles.slider}
              minimumValue={MIN_DAILY_INTAKE}
              maximumValue={MAX_DAILY_INTAKE}
              value={sliderValue}
              onValueChange={setSliderValue}
              onSlidingComplete={handleSliderComplete}
              minimumTrackTintColor={colors.readioOrange}
              maximumTrackTintColor="rgba(255, 255, 255, 0.2)"
              thumbTintColor={colors.readioOrange}
            />
            <Text style={[styles.optionalText, {textAlign: 'center'}]}>Adjust the slider to set your custom daily goal</Text>
          </>
        )}
      </View>

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
