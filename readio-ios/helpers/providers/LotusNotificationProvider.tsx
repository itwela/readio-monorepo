import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

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

  useEffect(() => {
    configureNotifications();
    checkNotificationPermissions();
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

    // REVIEW DEBUG MODE: Schedule reminders every minute for an hour
    const DEBUG_MODE = true; // Easy to comment out later

    
    const now = new Date();
    const amountPerReminder = goal / (24 / frequency);

    // REVIEW --- DEBUG MODE
    if (DEBUG_MODE) {
      // Schedule reminders every minute for the next hour
      for (let minute = 1; minute <= 60; minute++) {
        const reminderTime = new Date(now.getTime() + minute * 60000); // Add minutes
        
        const title = 'Time to Hydrate! (Debug)';
        const body = `Drink ${amountPerReminder.toFixed(1)}oz of water to stay on track with your ${goal}oz daily goal.`;
        const trigger = { date: reminderTime };
        const data = { 
          type: 'water_reminder',
          goalAmount: goal,
          reminderAmount: amountPerReminder,
          debug: true
        };

        await scheduleNotification(title, body, trigger, data, 'Lotus-Water-Goals.mp3');
      }
    } else {
      // Original production scheduling logic
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Schedule reminders for each day until end of month
      for (let date = now; date <= endOfMonth; date.setDate(date.getDate() + 1)) {
        const dayStart = new Date(date);
        dayStart.setHours(8, 0, 0, 0); // Start at 8 AM

        // Schedule reminders throughout the day
        for (let hour = 8; hour < 22; hour += frequency) {
          const reminderTime = new Date(dayStart);
          reminderTime.setHours(hour);

          if (reminderTime > now) {
            const title = 'Time to Hydrate!';
            const body = `Drink ${amountPerReminder.toFixed(1)}oz of water to stay on track with your ${goal}oz daily goal.`;
            const trigger = { date: reminderTime };
            const data = { 
              type: 'water_reminder',
              goalAmount: goal,
              reminderAmount: amountPerReminder
            };

            await scheduleNotification(title, body, trigger, data, 'Lotus-Water-Goals.mp3');
          }
        }
      }
    }
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

