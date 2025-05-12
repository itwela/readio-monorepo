import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, AppState } from 'react-native';
import { colors, readioBoldFont, readioRegularFont } from '@/constants/tokens';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { IconSymbol } from './ui/IconSymbol';
import LotusGap from './LotusGap';
import LotusToggleIcon from './LotusToggleIcon';
import { LotusPicker } from './LotusPicker';
import { useLotusGoals } from '@/helpers/providers/lotusGoalsContext';
import { Ionicons } from '@expo/vector-icons';
import { Goal } from '@/helpers/types';
import { setStateAsync } from '@/constants/utilityFunctions';
import { useLotusHaptic } from '@/helpers/providers/lotusHapticProvider';



type WaterReminderProps = {
  containerStyle?: object;
  localDailyGoalNumber: number;
  localReminderFrequency: number;
  onUpdateGoal: (newGoal: number) => void;
  onUpdateFrequency: (newFrequency: number) => void;
};

const RECOMMENDED_DAILY_INTAKE = 64; // oz (about 8 cups)
const frequencyOptions = [1, 2, 3, 4];

const waterGoalOptions = [
  { label: '4 cups (32oz)', value: 32 },
  { label: '6 cups (48oz)', value: 48 },
  { label: '8 cups (64oz)', value: 64 },
  { label: '10 cups (80oz)', value: 80 },
  { label: '12 cups (96oz)', value: 96 },
  { label: '16 cups (128oz)', value: 128 },
  { label: '20 cups (160oz)', value: 160 },
  { label: '24 cups (192oz)', value: 192 },
  { label: '28 cups (224oz)', value: 224 },
  { label: '32 cups (256oz)', value: 256 },
];

export const LotusWaterReminderCard = ({
  containerStyle,
  localDailyGoalNumber,
  localReminderFrequency,
  onUpdateGoal,
  onUpdateFrequency
}: WaterReminderProps) => {

  const {goals, updateGoal, loadUserGoals} = useLotusGoals();
  const [isWaterGoalEnabled, setIsWaterGoalEnabled] = useState(goals?.[0]?.isEnabled);
  const { successFeedback, mediumFeedback, stepMilestone, lightFeedback} = useLotusHaptic();

  // Calculate next notification time
  const getNextNotificationTime = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const startHour = 8; // 8 AM
    const endHour = 22; // 10 PM
    
    let nextHour = currentHour >= endHour || currentHour < startHour ? startHour : currentHour + localReminderFrequency;
    if (nextHour > endHour) nextHour = startHour;
    
    const nextTime = new Date();
    nextTime.setHours(nextHour, 0, 0, 0);
    if (nextTime < now) nextTime.setDate(nextTime.getDate() + 1);
    
    return nextTime;
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
    
  const handleUpdateGoal = (value: number) => {
    if (onUpdateGoal) {
      console.log(`[Water Reminder] Updating daily goal to ${value}oz`);
      onUpdateGoal(value);
    }
  };

  // REVIEW
  const handleToggleReminder = async () => {

    // NOTE IN CASE YOU FORGET WHERE TO CHANGE THE SOUNDS FOR DRINK WATER NOTIFICATIONS:
    // LINK readio-ios/helpers/services/goalsNotificationService.ts:227

    if (goals?.[0]?.isEnabled === false) {

      console.log(`\n\n💦[Water Reminder] Enabling water reminders. Currently isEnabled is ${goals[0].isEnabled}. By the end of this, isEnabled should be equal to: \n\n FALSE. \n`);      
      const updatedGoal = {
        ...goals[0],
        reminderFrequency: localReminderFrequency,
        targetValue:localDailyGoalNumber === -1 ? 32 : localDailyGoalNumber,
        isEnabled: true,
        lastUpdated: new Date(),
      } as Goal;
      
      await updateGoal(goals[0].id, updatedGoal);
      console.log(`\n\n💦[Water Reminder] ${'Enabling'} water reminders`);
      
      await loadUserGoals();
      console.log(`\n\n💦[Water Reminder] Reloading now updates...`);

      await setStateAsync(setIsWaterGoalEnabled, true, 'backendData');
      
    }
    
    if (goals?.[0]?.isEnabled === true) {
      
      console.log(`\n\n💦[Water Reminder] Disabling water reminders. Currently isEnabled is ${goals[0].isEnabled}. By the end of this, isEnabled should be equal to: \n\n FALSE. \n`);      
      
      const updatedGoal = {
        ...goals[0],
        reminderFrequency: 1,
        targetValue: -1,
        isEnabled: false,
        lastUpdated: new Date(),
      } as Goal;
      
      await updateGoal(goals[0].id, updatedGoal);
      console.log(`\n\n💦[Water Reminder] ${'Disabling'} water reminders`);
      
      await loadUserGoals();
      console.log(`\n\n💦[Water Reminder] Reloading now updates...`);

      await setStateAsync(setIsWaterGoalEnabled, false, 'backendData');
    }

    if (isWaterGoalEnabled) {
      successFeedback();
    } else {
      lightFeedback();
    }

  };

  // TODO  Save editor values when toggling edit mode
  // useEffect(() => {
  //   if (!isEditing) {
  //     // Apply saved values when closing editor
  //     if (editorValues.tempGoal !== dailyGoal) {
  //       onUpdateGoal(editorValues.tempGoal);
  //     }
  //     if (editorValues.tempFrequency !== reminderFrequency) {
  //       onUpdateFrequency(editorValues.tempFrequency);
  //     }
  //   } else {
  //     // Initialize editor with current values
  //     setEditorValues({
  //       tempGoal: dailyGoal,
  //       tempFrequency: reminderFrequency
  //     });
  //   }
  // }, [isEditing]);

  // Remove the updateReminders callback and useEffect since we don't want to automatically schedule reminders
  // Notifications are now handled directly through the toggle handler


  const screenWidth = Dimensions.get('window').width;
  const cardWIdth = (screenWidth - 40); // 40 accounts for padding and gap

  const styles = StyleSheet.create({
    goalContainer: {
      marginBottom: 0,
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
      backgroundColor:  'rgba(255, 255, 255, 0.1)',
      borderRadius: 15,
      padding: 20,
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.3)',
      alignSelf: 'center',
      gap: 10,
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    titleContainer: {
      flexDirection: 'column',
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
      paddingVertical: 15,
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
      color: colors.readioDustyWhite,
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
      paddingBottom: 10,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 10,
      marginBottom: 15,
    },
    recommendedText: {
      color: colors.readioWhite,
      fontFamily: readioRegularFont,
      fontSize: 14,
      textAlign: 'center',
      opacity: 0.5,
    },
    optionalText: {
      color: colors.readioWhite,
      fontFamily: readioRegularFont,
      fontSize: 12,
      opacity: 0.7,
      textAlign: 'right',
      marginTop: 5,
    },
    nextReminderContainer: {
      alignItems: 'center',
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    nextReminderText: {
      color: colors.readioWhite,
      fontFamily: readioBoldFont,
      fontSize: 18,
      marginBottom: 5,
    },
    reminderDetailsText: {
      color: colors.readioWhite,
      fontFamily: readioRegularFont,
      fontSize: 14,
      opacity: 0.7,
    },
    editButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      padding: 8,
      borderRadius: 20,
    },
    editButtonActive: {
      backgroundColor: colors.readioOrange,
    },
    editButtonBelow: {
      alignSelf: 'center',
      marginTop: 10,
      marginBottom: 5,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
    },
  });


  return (
    <>
      <LotusGap backgroundColor='transparent' gapNumber={10} />
      <Animated.View
        entering={FadeInUp.duration(300)}
        style={[styles.container, containerStyle]}
      >
        <View style={styles.headerContainer}>
          <View style={styles.titleContainer}>
            <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
              <View style={{ flexDirection: 'row', gap: 5 }}>
                <IconSymbol
                  name="drop.fill"
                  size={20}
                  color={colors.readioWhite}
                />
                <Text   allowFontScaling={false} style={styles.title}>Drink Water</Text>
              </View>

              <Pressable onPress={handleToggleReminder}>
                <LotusToggleIcon
                  isEnabled={isWaterGoalEnabled}
                  enabledIcon={'bell'}
                  disabledIcon={'bell-off'}
                />
              </Pressable>
            </View>
          </View>
        </View>

        {isWaterGoalEnabled === true ? (
          <>
            <View style={styles.nextReminderContainer}>
              <View style={{flexDirection: 'column', alignItems: 'center', gap: 2}}>
                <Text   allowFontScaling={false}style={[styles.reminderDetailsText]}>
                  Daily goal: {goals?.[0]?.targetValue}oz
                </Text>
              </View>
              <LotusGap backgroundColor='transparent' gapNumber={5} />
              <Text  allowFontScaling={false}  style={styles.nextReminderText}>
                Next reminder at {formatTime(getNextNotificationTime())}
              </Text>
            </View>
            <Pressable
              style={[styles.editButton, styles.editButtonBelow]}
              onPress={handleToggleReminder}
            >
             <Ionicons name="settings" size={20} color={colors.readioWhite} />
            </Pressable>
          </>
        ) : (
          <>
            <View
              style={styles.settingContainer}
            >
              <Text   allowFontScaling={false} style={styles.settingLabel}>Remind Every</Text>
              <View style={styles.settingValue}>
                <Text  allowFontScaling={false} style={styles.valueText}>{localReminderFrequency}h</Text>
              </View>
            </View>

            <View style={styles.optionsContainer}>
              {frequencyOptions.map((hours) => (
                <Pressable
                  key={hours}
                  style={[
                    styles.option,
                    localReminderFrequency === hours  && styles.selectedOption
                  ]}
                  onPress={() => {onUpdateFrequency(hours); lightFeedback();}}
                >
                  <Text   allowFontScaling={false} style={styles.optionText}>{hours}h</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.goalContainer}>
              <View style={styles.goalHeader}>
                <Text   allowFontScaling={false} style={styles.settingLabel}>Daily Water Goal</Text>
              </View>
              <LotusPicker
                items={waterGoalOptions}
                selectedValue={localDailyGoalNumber}
                onValueChange={(value) => {handleUpdateGoal(value); lightFeedback();}}
                itemHeight={50}
                visibleItems={3}
                textStyle={{
                  fontSize: 20,
                  fontFamily: readioBoldFont,
                  color: colors.readioDustyWhite,
                  textAlign: 'center',
                }}
                style={{
                  width: '100%',
                  marginBottom: 20,
                }}
              />

              <View style={{ flexDirection: 'column', gap: 5 }}>
                <Text  allowFontScaling={false} style={[styles.recommendedText]}>
                  Studies suggest a healthy water intake of:
                </Text>
                <Text  allowFontScaling={false} style={styles.recommendedText}>
                  8 cups ({RECOMMENDED_DAILY_INTAKE}oz) daily.
                </Text>
              </View>
            </View>
          </>
        )}

      </Animated.View>
    </>
  );

};
