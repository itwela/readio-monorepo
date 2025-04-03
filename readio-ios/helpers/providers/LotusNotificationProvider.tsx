import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

interface LotusNotificationContextType {
  sendNotification: (title: string, body: string, data?: object, sound?: any) => Promise<void>;
  scheduleNotification: (title: string, body: string, trigger: any, data?: object, sound?: any) => Promise<string>;
  cancelNotification: (notificationId: string) => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
  getNotificationPermissions: () => Promise<boolean>;
  scheduleWaterReminder: (frequency: number, goal: number,) => Promise<string>;
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

  const scheduleWaterReminder = async (frequency: number, goal: number) => {
    if (!hasPermission) {
      const granted = await checkNotificationPermissions();
      if (!granted) {
        throw new Error('Notification permissions not granted');
      }
    }

    const title = 'Water Reminder';
    const body = `Time to drink water! You still need to reach your daily goal of ${goal}oz.`;

    // Create a trigger for the specified frequency (in hours)
    const trigger = {
      seconds: frequency * 3600, // Convert hours to seconds
      repeats: true
    };

    const data = {
      type: 'water_reminder',
      goal,
      frequency
    };

    return await scheduleNotification(title, body, trigger, data, 'Lotus-Water-Goals.mp3');
  };

  const value = {
    sendNotification,
    scheduleNotification,
    cancelNotification,
    cancelAllNotifications,
    getNotificationPermissions,
    scheduleWaterReminder,
  };

  return (
    <LotusNotificationContext.Provider value={value}>
      {children}
    </LotusNotificationContext.Provider>
  );
};

