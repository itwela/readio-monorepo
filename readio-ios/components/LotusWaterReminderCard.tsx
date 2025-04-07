import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { colors, readioBoldFont, readioRegularFont } from '@/constants/tokens';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { IconSymbol } from './ui/IconSymbol';
import LotusGap from './LotusGap';
import LotusToggleIcon from './LotusToggleIcon';
import { LotusPicker } from './LotusPicker';
import { useLotusSettings } from '@/helpers/providers/lotusSettingsProvider';
import { useLotusNotifications } from '@/helpers/providers/LotusNotificationProvider';
import { useLotusGoals } from '@/helpers/providers/lotusGoalsContext';



type WaterReminderProps = {
  containerStyle?: object;
  dailyGoal: number;
  reminderFrequency: number;
  onUpdateGoal: (newGoal: number) => void;
  onUpdateFrequency: (newFrequency: number) => void;
};

const RECOMMENDED_DAILY_INTAKE = 64; // oz (about 8 cups)
const MIN_DAILY_INTAKE = 32; // oz (4 cups)
const MAX_DAILY_INTAKE = 256; // oz (32 cups)
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
  dailyGoal,
  reminderFrequency,
  onUpdateGoal,
  onUpdateFrequency
}: WaterReminderProps) => {

  const [isEditingFrequency, setIsEditingFrequency] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const { scheduleWaterReminders } = useLotusNotifications();
  const {goals, updateGoal} = useLotusGoals()

  useEffect(() => {
    const updateReminders = async () => {
      const isEnabled = goals?.[0]?.isEnabled ?? false;
      
      if (!isEnabled) {
        console.log('[Water Reminder] Notifications disabled, skipping reminder scheduling');
        return;
      }

      try {
        console.log(`[Water Reminder] Scheduling reminders - Frequency: ${reminderFrequency}h, Daily Goal: ${dailyGoal}oz`);
        await scheduleWaterReminders(
          reminderFrequency,
          dailyGoal,
          true
        );
        console.log('[Water Reminder] Successfully scheduled reminders');
      } catch (error) {
        console.error('[Water Reminder] Error scheduling reminders:', error);
      }
    };

    updateReminders();
  }, [reminderFrequency, dailyGoal, goals?.[0]?.isEnabled]);

  const handleUpdateGoal = (value: number) => {
    if (onUpdateGoal) {
      console.log(`[Water Reminder] Updating daily goal to ${value}oz`);
      onUpdateGoal(value);
      setIsCustomizing(false);
    }
  };

  const handleFrequencyUpdate = (hours: number) => {
    console.log(`[Water Reminder] Updating reminder frequency to ${hours}h`);
    onUpdateFrequency(hours);
    setIsEditingFrequency(false);
  };

  const handleToggleReminder = () => {
    if (goals?.[0]) {
      const newState = !goals[0].isEnabled;
      console.log(`[Water Reminder] ${newState ? 'Enabling' : 'Disabling'} water reminders`);
      updateGoal(goals[0].id, { isEnabled: newState });
    }
  };

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
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
                <Text style={styles.title}>Drink Water</Text>
              </View>

              {/* REVIEW -- THIS ACTUALLY CONTROLS IT BEING ON AND OFF */}
              <Pressable
                onPress={handleToggleReminder}  // Use the handler instead of inline function
              >
                <LotusToggleIcon
                  isEnabled={goals?.[0]?.isEnabled}
                  enabledIcon={'bell'}
                  disabledIcon={'bell-off'}
                />
              </Pressable>

            </View>


          </View>


        </View>


        <Pressable
          style={styles.settingContainer}
          onPress={() => setIsEditingFrequency(!isEditingFrequency)}
        >
          <Text style={styles.settingLabel}>Remind Every</Text>
          <View style={styles.settingValue}>
            <Text style={styles.valueText}>{reminderFrequency}h</Text>
            <IconSymbol
              name={!isEditingFrequency ? 'chevron.right' : 'chevron.down'}
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
                  onUpdateFrequency(hours);
                  setIsEditingFrequency(false);
                }}
              >
                <Text style={styles.optionText}>{hours}h</Text>
              </Pressable>
            ))}
          </View>
        )}

        <View style={styles.goalContainer}>
          <View style={styles.recommendedContainer}>

            <Pressable
              style={[styles.customizeButton, isCustomizing && styles.customizeButtonActive]}
              onPress={() => setIsCustomizing(!isCustomizing)}
            >

              <Text style={styles.customizeButtonText}>
                {isCustomizing ? 'Confirm' : 'Set Your Own Goal (optional)'}
              </Text>
            </Pressable>

          </View>

          {isCustomizing && (
            <>
              <View style={styles.goalHeader}>
                <Text style={styles.settingLabel}>Daily Water Goal?</Text>
              </View>
              <LotusPicker
                items={waterGoalOptions}
                selectedValue={dailyGoal}
                onValueChange={(value) => handleUpdateGoal(value)}
                itemHeight={50}
                visibleItems={3}
                textStyle={{
                  fontSize: 20,
                  fontFamily: readioBoldFont,
                  color: colors.readioWhite,
                  textAlign: 'center',
                }}
                style={{
                  width: '100%',
                  marginBottom: 20,
                }}
              />
            </>
          )}

          <View style={{ flexDirection: 'column', gap: 5 }}>
            <Text style={[styles.recommendedText]}>
              Studies suggest a healthy water intake of:
            </Text>
            <Text style={styles.recommendedText}>
              8 cups ({RECOMMENDED_DAILY_INTAKE}oz) daily.
            </Text>
          </View>

        </View>




      </Animated.View>
    </>
  );

};
