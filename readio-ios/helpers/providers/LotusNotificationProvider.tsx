import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { AppState, Platform } from 'react-native';
import { ExpoGoalsNotificationService, GoalsNotificationService } from '../services/goalsNotificationService';
import { Goal } from '../types';
import { GoalsStorageService, LocalGoalsStorageService } from '../services/goalsStorageService';
import { tokenCache } from '@/lib/auth';
import { NotificationBehavior } from 'expo-notifications';
interface LotusNotificationContextType {
  // sendNotification: (title: string, body: string, data?: object, sound?: any) => Promise<void>;
  scheduleNotification: (title: string, body: string, trigger: any, data?: object, sound?: string) => Promise<string>;
  scheduleTimeSensitiveNotification: (title: string, body: string, trigger: any, data?: object, sound?: string) => Promise<string | undefined>;
  cancelNotification: (notificationId: string) => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
  getNotificationPermissions: () => Promise<boolean>;
  scheduleWaterReminders: (frequency: number, goal: number, enabled: boolean) => Promise<void>;

  debugNotificationWasCLicked?: string;
  setDebugNotificationWasCLicked?: (value: string) => void;
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

  const [debugNotificationWasCLicked, setDebugNotificationWasCLicked] = useState<string>('');


  const setupNotificationCategories = async () => {
    if (Platform.OS === 'ios') {
      await Notifications.setNotificationCategoryAsync('timeSensitiveWaterReminders', []);
    }
  };


  useEffect(() => {

    let isMounted = true; // Flag to check if component is still mounted

    const initializeApp = async () => {

      await setupNotificationCategories();
      // configureNotifications();
      const  get = await notificationService.requestPermissions();

      console.log('[Notification Provider UseEffect] get', get);

      try {
        await storageService.loadGoals();
      } catch (error) {
        console.error('Error loading initial goals:', error);
      }

      // --- Notification Observer Logic ---

      // Function to handle notification response (when user taps it)
      function handleNotificationResponse(response: Notifications.NotificationResponse) {
        const notification = response.notification;
        const data = notification.request.content.data;
        const notificationType = data?.type;
        const notificationId = notification.request.identifier;

        console.log('[Notification Observer] Received response for notification:', notificationId);
        console.log('[Notification Observer] Notification data:', data);

        // Update the debug state
        // TODO
        if (notificationType === 'timeSensitiveWaterReminders') {
          const debugMessage = `Notification clicked! ID: ${notificationId}, Data: ${JSON.stringify(data)}`;
          setDebugNotificationWasCLicked(debugMessage);
        }

        if (notificationType === 'test') {
          const debugMessage = `Test Noti Was CLicked`;
          setDebugNotificationWasCLicked(debugMessage);
        }

      }

        // Check if the app was opened from a notification
        Notifications.getLastNotificationResponseAsync()
          .then(response => {
            if (!isMounted || !response) {
              return;
            }
            console.log('[Notification Observer] App opened via notification.');
            handleNotificationResponse(response);
        });

        // Listen for new notification responses while the app is running
        const subscription = Notifications.addNotificationResponseReceivedListener(response => {
          console.log('[Notification Observer] Listener triggered.');
          handleNotificationResponse(response);
        });

      // --- End Notification Observer Logic ---

      const appStateSubscription = AppState.addEventListener('change', async (nextAppState) => {
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
        isMounted = false; // Mark as unmounted
        appStateSubscription.remove();
        subscription.remove(); // Remove the notification listener
        console.log('[Notification Provider] Cleaned up listeners.');
      };

    };

    initializeApp();

  }, [notificationService, storageService]);


  const configureNotifications = () => {
    const configure = Notifications.setNotificationHandler({
      handleNotification: async (notification) => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true, 
      }),
    });
    console.log('\n\n 🟢 [Notification Provider] Notification handler configured');
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
      throw new Error('[Notification Provider] Notification permissions not granted');
    }

    const formattedSound = validateAndFormatSound(sound);
    

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        data: data,
        sound: formattedSound,
      },
      trigger: trigger,
    });

    return notificationId;
  };

// ... existing code ...

// ... existing code ...

  const scheduleTimeSensitiveNotification = async (
    title: string,
    body: string,
    trigger: any,
    data: object = {},
    sound?: string
  ) => {

    configureNotifications();

    const settings = await Notifications.getPermissionsAsync();
    if (!settings.ios?.allowsCriticalAlerts) {
      console.log("\n [Notification Provider] Requesting critical notification permissions...");
  
      const getPerms = await notificationService.requestPermissions();
      console.log("\n [Notification Provider] Critical notification permissions granted., getPerms: " + getPerms);
    }

  const formattedSound = validateAndFormatSound(sound);
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: title,
      body: body,
      data: data,
      sound: formattedSound,
      interruptionLevel: 'timeSensitive',
    },
    trigger: trigger,
  });
  return notificationId;
};

// ... existing code ...

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
    scheduleTimeSensitiveNotification,
    cancelNotification,
    cancelAllNotifications,
    getNotificationPermissions,
    scheduleWaterReminders,
    debugNotificationWasCLicked,
    setDebugNotificationWasCLicked
  };

  return (
    <LotusNotificationContext.Provider value={value}>
      {children}
    </LotusNotificationContext.Provider>
  );
};
