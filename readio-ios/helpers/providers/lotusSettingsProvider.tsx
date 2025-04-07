import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLotusNotifications } from './LotusNotificationProvider';

interface LotusSettingsContextType {
  settingsOpen: boolean;
  setSettingsOpen: (value: boolean) => void;
  waterReminderEnabled: boolean;
  setWaterReminderEnabled: (enabled: boolean) => void;
  waterDailyGoal: number;
  setWaterDailyGoal: (goal: number) => void;
  waterReminderFrequency: number;
  setWaterReminderFrequency: (hours: number) => void;
  saveWaterSettings: () => Promise<void>;
}

const LotusSettingsContext = createContext<LotusSettingsContextType | null>(null);

export const LotusSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { scheduleWaterReminders } = useLotusNotifications();
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [waterReminderEnabled, setWaterReminderEnabled] = useState<boolean>(false);
  const [waterDailyGoal, setWaterDailyGoal] = useState<number>(64); // Default to 8 cups (64 oz)
  const [waterReminderFrequency, setWaterReminderFrequency] = useState<number>(2); // Default to 2 hours

  const saveWaterSettings = async () => {
    try {
      const settings = {
        waterReminderEnabled,
        waterDailyGoal,
        waterReminderFrequency
      };
      
      await AsyncStorage.setItem('waterSettings', JSON.stringify(settings));
      
      // Schedule water reminders with the new settings
      await scheduleWaterReminders(
        waterReminderFrequency,
        waterDailyGoal,
        waterReminderEnabled
      );
    } catch (error) {
      console.error('Error saving water settings:', error);
      throw error;
    }
  };

  useEffect(() => {
    const loadSavedSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem('waterSettings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          setWaterReminderEnabled(settings.waterReminderEnabled);
          setWaterDailyGoal(settings.waterDailyGoal);
          setWaterReminderFrequency(settings.waterReminderFrequency);
          
          // Schedule notifications based on loaded settings
          await scheduleWaterReminders(
            settings.waterReminderFrequency,
            settings.waterDailyGoal,
            settings.waterReminderEnabled
          );
        }
      } catch (error) {
        console.error('Error loading water settings:', error);
      }
    };

    loadSavedSettings();
  }, []);

  return (
    <LotusSettingsContext.Provider value={{
      settingsOpen,
      setSettingsOpen,
      waterReminderEnabled,
      setWaterReminderEnabled,
      waterDailyGoal,
      setWaterDailyGoal,
      waterReminderFrequency,
      setWaterReminderFrequency,
      saveWaterSettings,
    }}>

      {children}
    </LotusSettingsContext.Provider>
  );
};

export const useLotusSettings = () => {
  const context = useContext(LotusSettingsContext);
  if (!context) throw new Error('useLotusSettings must be used within a LotusSettingsProvider');
  return context;
};