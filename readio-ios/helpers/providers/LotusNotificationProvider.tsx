import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

interface LotusNotificationContextType {
  sendNotification: (title: string, body: string, data?: object, sound?: any) => Promise<void>;
  scheduleNotification: (title: string, body: string, trigger: any, data?: object, sound?: any) => Promise<string>;
  cancelNotification: (notificationId: string) => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
  getNotificationPermissions: () => Promise<boolean>;
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

  const sendNotification = async (title: string, body: string, data: object = {}, sound?: any) => {
    if (!hasPermission) {
      const granted = await checkNotificationPermissions();
      if (!granted) {
        throw new Error('Notification permissions not granted');
      }
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: Platform.OS === 'ios' ? sound : true,
      },
      trigger: null,
    });
  };

  const scheduleNotification = async (
    title: string,
    body: string,
    trigger: any,
    data: object = {},
    sound?: any
  ) => {
    if (!hasPermission) {
      const granted = await checkNotificationPermissions();
      if (!granted) {
        throw new Error('Notification permissions not granted');
      }
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: sound || true,
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

  const value = {
    sendNotification,
    scheduleNotification,
    cancelNotification,
    cancelAllNotifications,
    getNotificationPermissions,
  };

  return (
    <LotusNotificationContext.Provider value={value}>
      {children}
    </LotusNotificationContext.Provider>
  );
};