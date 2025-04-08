import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { AppState, Platform } from 'react-native';
import { ExpoGoalsNotificationService, GoalsNotificationService } from '../services/goalsNotificationService';
import { Goal } from '../types';
import { GoalsStorageService, LocalGoalsStorageService } from '../services/goalsStorageService';
import { tokenCache } from '@/lib/auth';
interface LotusNotificationContextType {
  sendNotification: (title: string, body: string, data?: object, sound?: any) => Promise<void>;
  scheduleNotification: (title: string, body: string, trigger: any, data?: object, sound?: any) => Promise<string>;
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
  const [hasPermission, setHasPermission] = useState(false);

  const notificationService: GoalsNotificationService = new ExpoGoalsNotificationService();
  const storageService: GoalsStorageService = new LocalGoalsStorageService();

  useEffect(() => {
    const configureAndLoadGoals = async () => {
      configureNotifications();
      await checkNotificationPermissions();

      const subscription = AppState.addEventListener('change', async (nextAppState) => {
        if (nextAppState === 'active') {
          try {
            await storageService.loadGoals(); // Call loadGoals when app becomes active
          } catch (error) {
            console.error('Error loading goals:', error);
          }
        }
      });

      return () => {
        subscription.remove();
      };
    };

    configureAndLoadGoals();
  }, []);

  // TODO --- NOTIFICATION CONFIGURATION 
  const configureNotifications = () => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  };

  const checkNotificationPermissions = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    setHasPermission(finalStatus === 'granted');
    return finalStatus === 'granted';
  };

  const getNotificationPermissions = async () => {
    return await checkNotificationPermissions();
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

  const sendNotification = async (title: string, body: string, data: object = {}, sound?: string) => {
    if (!hasPermission) {
      const granted = await checkNotificationPermissions();
      if (!granted) {
        throw new Error('Notification permissions not granted');
      }
    }

    const formattedSound = validateAndFormatSound(sound);

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: formattedSound
      },
      trigger: null,
    });
  };

  const scheduleNotification = async (
    title: string,
    body: string,
    trigger: any,
    data: object = {},
    sound?: string
  ) => {
    if (!hasPermission) {
      const granted = await checkNotificationPermissions();
      if (!granted) {
        throw new Error('Notification permissions not granted');
      }
    }

    const formattedSound = validateAndFormatSound(sound);

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: formattedSound
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

  const scheduleWaterReminders = async (frequency: number, goal: number, enabled: boolean) => {
    try {
      if (!enabled) {
        await cancelWaterReminders();
        return;
      }

      const granted = await checkNotificationPermissions();
      if (!granted) {
        throw new Error('Notification permissions not granted');
      }

      // Cancel existing water reminders
      await cancelWaterReminders();

      const now = new Date();

      const goalObject: Goal = {
        id: 'lotus-water-reminder', // Replace with actual ID
        // used to get data.type = 'water_reminder';
        type: 'water',
        currentValue: 0, // Replace with actual current value
        targetValue: goal,
        reminderFrequency: frequency,
        isEnabled: enabled,
        lastUpdated: now,
        every: 'day'
      };

      await notificationService.schedule(goalObject);


    } catch (error) {
      console.error('Error scheduling water reminders:', error);
      throw error;
    }
  };

  const cancelWaterReminders = async () => {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const waterReminders = scheduledNotifications.filter(
        notification => notification.content.data?.type === 'water_reminder'
      );

      await Promise.all(
        waterReminders.map(reminder =>
          Notifications.cancelScheduledNotificationAsync(reminder.identifier)
        )
      );
    } catch (error) {
      console.error('Error canceling water reminders:', error);
      throw error;
    }
  };

  const value = {
    sendNotification,
    scheduleNotification,
    cancelNotification,
    cancelAllNotifications,
    getNotificationPermissions,
    scheduleWaterReminders,
    cancelWaterReminders,
  };

  return (
    <LotusNotificationContext.Provider value={value}>
      {children}
    </LotusNotificationContext.Provider>
  );
};

