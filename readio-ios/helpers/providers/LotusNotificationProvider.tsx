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

      const startHour = 8;  // 8 AM
      const endHour = 22;   // 10 PM
      const now = new Date();
      const currentHour = now.getHours();
      const amountPerReminder = goal / frequency;

      // Schedule a single repeating notification
      const nextHour = currentHour >= endHour || currentHour < startHour ? startHour : currentHour + 1;
      const title = 'Time to Hydrate!';
      const body = `Drink ${amountPerReminder.toFixed(1)}oz of water to stay on track with your ${goal}oz daily goal.`;
      
      await scheduleNotification(
        title,
        body,
        {
          type: 'daily' as Notifications.SchedulableTriggerInputTypes,
          hour: nextHour,
          minute: 0,
          repeats: true
        } as Notifications.DailyTriggerInput,
        { 
          type: 'water_reminder',
          goalAmount: goal,
          reminderAmount: amountPerReminder,
          scheduledHour: nextHour
        },
        'Lotus-Water-Goals.mp3'
      );

      // If we need to start tomorrow and it's not too late, schedule one immediate reminder
      // if (currentHour >= endHour) {
      //   const title = 'Time to Hydrate!';
      //   const body = `Drink ${amountPerReminder.toFixed(1)}oz of water to stay on track with your ${goal}oz daily goal.`;
        
      //   await scheduleNotification(
      //     title,
      //     body,
      //     { date: new Date(now.getTime() + 5 * 60000) }, // 5 minutes from now
      //     { 
      //       type: 'water_reminder',
      //       goalAmount: goal,
      //       reminderAmount: amountPerReminder,
      //       immediate: true
      //     },
      //     'Lotus-Water-Goals.mp3'
      //   );
      // }

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

