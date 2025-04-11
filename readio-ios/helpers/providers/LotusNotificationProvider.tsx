import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { AppState, Platform } from 'react-native';
import { ExpoGoalsNotificationService, GoalsNotificationService } from '../services/goalsNotificationService';
import { Goal } from '../types';
import { GoalsStorageService, LocalGoalsStorageService } from '../services/goalsStorageService';
import { tokenCache } from '@/lib/auth';
interface LotusNotificationContextType {
  // sendNotification: (title: string, body: string, data?: object, sound?: any) => Promise<void>;
  scheduleNotification: (title: string, body: string, trigger: any, data?: object, sound?: string) => Promise<string>;
  cancelNotification: (notificationId: string) => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
  getNotificationPermissions: () => Promise<boolean>;
  scheduleWaterReminders: (frequency: number, goal: number, enabled: boolean) => Promise<void>;
}

const LotusNotificationContext = createContext<LotusNotificationContextType | null>(null);

export const useLotusNotifications = () => {
  const context = useContext(LotusNotificationContext);
  if (!context) {
    throw new Error('useLotusNotifications must be used within a LotusNotificationProvider');
  }
  return context;
};

export const LotusNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const notificationService = React.useMemo<GoalsNotificationService>(() => new ExpoGoalsNotificationService(), []);
  const storageService = React.useMemo<GoalsStorageService>(() => new LocalGoalsStorageService(), []);

  useEffect(() => {
    const initializeApp = async () => {
      configureNotifications();
      await notificationService.requestPermissions();

      try {
        await storageService.loadGoals();
      } catch (error) {
        console.error('Error loading initial goals:', error);
      }

      const subscription = AppState.addEventListener('change', async (nextAppState) => {
        if (nextAppState === 'active') {
          console.log('App came to foreground. Checking permissions and loading goals.');
          await notificationService.requestPermissions();
          try {
            await storageService.loadGoals();
          } catch (error) {
            console.error('Error loading goals on app active:', error);
          }
        }
      });

      return () => {
        subscription.remove();
      };
    };

    initializeApp();
  }, [notificationService, storageService]);

  const configureNotifications = () => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  };

  const getNotificationPermissions = async (): Promise<boolean> => {
    return await notificationService.requestPermissions();
  };

  const validateAndFormatSound = (sound?: any) => {
    if (!sound) return undefined;

    // Extract just the filename from the sound object
    const soundName = sound?.name || sound;

    if (!soundName) return undefined;

    // For iOS, keep the extension
    if (Platform.OS === 'ios') {
      return soundName;
    }

    // For Android, remove the extension
    return soundName.replace('.mp3', '');
  };


  // const sendNotification = async (title: string, body: string, data: object = {}, sound?: string) => {
  //   const hasPermission = await notificationService.requestPermissions();
  //   if (!hasPermission) {
  //     throw new Error('Notification permissions not granted');
  //   }

  //   await Notifications.scheduleNotificationAsync({
  //     content: {
  //       title,
  //       body,
  //       data,
  //       sound
  //     },
  //     trigger: null,
  //   });
  // };

  const scheduleNotification = async (
    title: string,
    body: string,
    trigger: any,
    data: object = {},
    sound?: string
  ) => {
    const hasPermission = await notificationService.requestPermissions();
    if (!hasPermission) {
      throw new Error('Notification permissions not granted');
    }

    const formattedSound = validateAndFormatSound(sound);
    

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: formattedSound,
      },
      trigger,
    });

    return notificationId;
  };

  const cancelNotification = async (notificationId: string) => {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  };

  const cancelAllNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  };

  // --------------- REMINDERS 

  const scheduleWaterReminders = async (frequency: number, targetGoal: number, enabled: boolean) => {
    try {
      const waterGoalId = 'system_water_goal';
      let waterGoal = await storageService.loadGoals();
      const now = new Date();

      if (waterGoal) {
        waterGoal[0].targetValue = targetGoal;
        waterGoal[0].reminderFrequency = frequency;
        waterGoal[0].isEnabled = enabled;
        waterGoal[0].lastUpdated = now;
      } else {
        waterGoal = [{
          id: waterGoalId,
          type: 'water',
          currentValue: 0,
          targetValue: targetGoal,
          reminderFrequency: frequency,
          isEnabled: enabled,
          lastUpdated: now,
          every: 'day'
        }];
      }

      await storageService.saveGoals(waterGoal);
      await notificationService.updateSchedule(waterGoal[0]);

    } catch (error) {
      console.error('Error scheduling water reminders:', error);
      throw error;
    }
  };

  const value = {
    // sendNotification,
    scheduleNotification,
    cancelNotification,
    cancelAllNotifications,
    getNotificationPermissions,
    scheduleWaterReminders
  };

  return (
    <LotusNotificationContext.Provider value={value}>
      {children}
    </LotusNotificationContext.Provider>
  );
};

