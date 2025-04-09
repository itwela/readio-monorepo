Okay, let's break down these two files and see how we can align them better with the Expo Notifications documentation and your likely goals for goal-based reminders.

You're right, there are a few areas where the current implementation can be improved for clarity, robustness, and to correctly achieve the desired reminder functionality (especially multiple reminders per day).

Here's a breakdown of recommendations:

1. Centralize Goal-Specific Logic in goalsNotificationService.ts

Problem: The LotusNotificationProvider currently handles the specific logic for scheduleWaterReminders, including creating a temporary Goal object and directly calling notificationService.schedule. It also has a specific cancelWaterReminders function that filters notifications by data type. This mixes general notification capabilities with specific goal implementation details.
Recommendation:
The LotusNotificationProvider should ideally deal with general notification tasks (permissions, maybe one-off sends/schedules if needed elsewhere) or act as a higher-level orchestrator for goal-related actions.
Move the responsibility of scheduling/canceling reminders based on a Goal object entirely into ExpoGoalsNotificationService.
The scheduleWaterReminders function in the provider should probably focus on creating/updating the water goal data (using storageService) and then simply call notificationService.updateSchedule(updatedWaterGoal).
Remove cancelWaterReminders from the provider's context value. Cancellation should be handled via notificationService.cancel(goalId).
2. Fix the Scheduling Logic in ExpoGoalsNotificationService.schedule

Problem: The current schedule method only schedules one daily repeating notification at the next available hour (nextHour). If you want reminders based on reminderFrequency (e.g., every 2 hours between 8 AM and 10 PM), this logic is incorrect. It will only fire once per day at that single calculated nextHour. Also, using a single identifier per goal prevents scheduling multiple distinct reminders for the same goal.
Recommendation:
Calculate Multiple Trigger Times: Determine all the times within the desired window (e.g., 8 AM to 10 PM) that a reminder should fire based on the goal.reminderFrequency.
Schedule Multiple Notifications: Loop through the calculated times and schedule a separate daily repeating notification for each time slot.
Unique Identifiers: Generate a unique identifier for each scheduled notification slot for a given goal. A good pattern could be goal_notification_${goal.id}_${hour}_${minute}.
Refactor cancel: The cancel method needs to find and cancel all notifications associated with a goalId, not just one specific identifier. You can use Notifications.getAllScheduledNotificationsAsync() and filter by a prefix (e.g., goal_notification_${goal.id}_).
Example Refactoring for schedule and cancel in ExpoGoalsNotificationService:

typescript
import * as Notifications from 'expo-notifications';
import { Goal } from '@/helpers/types';
import { Platform } from 'react-native';

// ... (interface remains the same)

export class ExpoGoalsNotificationService implements GoalsNotificationService {
  // ... (ensurePermissions, requestPermissions remain the same)
  // ... (validateAndFormatSound - keep it here, remove from provider)

  // --- NEW: Helper to generate identifiers ---
  private getNotificationIdentifierPrefix(goalId: string): string {
    return `goal_notification_${goalId}_`;
  }

  private getNotificationIdentifier(goalId: string, hour: number, minute: number): string {
    // Ensure consistent formatting (e.g., leading zeros)
    const hourStr = String(hour).padStart(2, '0');
    const minuteStr = String(minute).padStart(2, '0');
    return `${this.getNotificationIdentifierPrefix(goalId)}${hourStr}_${minuteStr}`;
  }

  // --- REFACTORED: schedule ---
  async schedule(goal: Goal): Promise<void> {
    // If goals are not enabled, cancel existing and return
    if (!goal.isEnabled) {
      await this.cancel(goal.id); // Ensure old ones are cleared
      console.log(`[Notification Schedule] Goal ${goal.id} (${goal.type}) is disabled. Canceled any existing reminders.`);
      return;
    }

    // Ensure permissions are granted
    const hasPermission = await this.ensurePermissions();
    if (!hasPermission) {
      console.warn(`[Notification Schedule] Permissions not granted. Cannot schedule reminders for goal ${goal.id}.`);
      return;
    }

    // --- Critical: Cancel ALL existing notifications for this goal first ---
    await this.cancel(goal.id);
    console.log(`[Notification Schedule] Canceled existing reminders for goal ${goal.id} before rescheduling.`);

    // --- Scheduling Logic for Multiple Reminders ---
    const startHour = 8; // 8 AM
    const endHour = 22; // 10 PM (exclusive for start time)
    const frequencyHours = goal.reminderFrequency || 1; // Default to 1 hour if not set
    const formattedSound = this.validateAndFormatSound(this.getNotificationSound(goal));
    let scheduledCount = 0;

    console.log(`[Notification Schedule] Scheduling ${goal.type} reminders for goal ${goal.id} every ${frequencyHours} hours between ${startHour}:00 and ${endHour}:00.`);

    for (let hour = startHour; hour < endHour; hour += frequencyHours) {
      const minute = 0; // Assuming reminders are on the hour
      const identifier = this.getNotificationIdentifier(goal.id, hour, minute);

      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: this.getNotificationTitle(goal),
            body: this.getNotificationBody(goal), // Body could potentially be dynamic based on time?
            data: {
              type: this.getNotificationDataType(goal),
              goalId: goal.id, // Good practice to include goalId in data
              goalAmount: goal.targetValue,
              reminderAmount: goal.reminderFrequency,
              scheduledHour: hour, // Store the specific hour this reminder is for
              scheduledMinute: minute,
            },
            sound: formattedSound,
          },
          trigger: {
            // type: 'daily', // 'DailyTriggerInput' is deprecated, use channelId and repeats
            hour: hour,
            minute: minute,
            repeats: true, // This makes it repeat daily at this specific hour/minute
          } as Notifications.DailyTriggerInput, // Keep cast for now, but consider channel-based triggers
          identifier: identifier,
        });
        scheduledCount++;
        console.log(`[Notification Schedule] Scheduled reminder for goal ${goal.id} at ${hour}:${String(minute).padStart(2, '0')}. Identifier: ${identifier}`);

      } catch (error) {
        console.error(`[Notification Schedule] Failed to schedule reminder for goal ${goal.id} at ${hour}:${minute}. Error:`, error);
        // Decide if you want to stop scheduling or continue with others
      }
    }
     console.log(`[Notification Schedule] Finished scheduling for goal ${goal.id}. Total reminders scheduled: ${scheduledCount}`);
  }

  // --- REFACTORED: cancel ---
  async cancel(goalId: string): Promise<void> {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const goalNotificationPrefix = this.getNotificationIdentifierPrefix(goalId);
      const notificationsToCancel = scheduledNotifications.filter(
        notification => notification.identifier.startsWith(goalNotificationPrefix)
      );

      if (notificationsToCancel.length > 0) {
         console.log(`[Notification Cancel] Found ${notificationsToCancel.length} reminders to cancel for goal ${goalId}.`);
         await Promise.all(
           notificationsToCancel.map(notification => {
              console.log(`[Notification Cancel] Canceling reminder with ID: ${notification.identifier}`);
              return Notifications.cancelScheduledNotificationAsync(notification.identifier);
           })
         );
         console.log(`[Notification Cancel] Successfully canceled ${notificationsToCancel.length} reminders for goal ${goalId}.`);
      } else {
         console.log(`[Notification Cancel] No scheduled reminders found for goal ${goalId} with prefix ${goalNotificationPrefix}.`);
      }
    } catch (error) {
       console.error(`[Notification Cancel] Error canceling reminders for goal ${goalId}:`, error);
       // Rethrow or handle as needed
       throw error;
    }
  }

  // --- updateSchedule remains the same (calls schedule) ---
  async updateSchedule(goal: Goal): Promise<void> {
    console.log(`[Notification Update] Updating schedule for goal ${goal.id} (${goal.type})`);
    await this.schedule(goal); // schedule now handles disabling and rescheduling correctly
  }

  // ... (getNotificationDataType, getNotificationTitle, getNotificationBody, getNotificationSound remain the same)

  // --- ADDED: Keep sound formatting logic here ---
  private validateAndFormatSound(sound?: any): string | undefined | null {
    // On newer Expo SDKs, 'default' might be represented as null
    if (!sound || sound === 'default') return Platform.OS === 'ios' ? 'default' : null;

    // Extract just the filename if it's an object (like from require)
    const soundName = typeof sound === 'object' && sound !== null && 'name' in sound ? sound.name : sound;

    if (typeof soundName !== 'string' || !soundName) return Platform.OS === 'ios' ? 'default' : null;


    // For iOS, keep the extension if present
    if (Platform.OS === 'ios') {
      return soundName;
    }

    // For Android, remove common audio extensions
    // Return null for 'default' on Android as per newer docs
    const baseName = soundName.replace(/\.(mp3|wav|aiff|caf)$/i, '');
    return baseName === 'default' ? null : baseName;
  }
}

export default ExpoGoalsNotificationService;
3. Streamline Permission Handling

Problem: Both the provider (checkNotificationPermissions, checks within sendNotification/scheduleNotification) and the service (ensurePermissions) handle permission checks. This is redundant.
Recommendation:
Let ExpoGoalsNotificationService be the single source of truth for checking and requesting permissions via its ensurePermissions method (which is called by schedule).
The provider's getNotificationPermissions can perhaps call the service's requestPermissions method to trigger the check/request flow if needed explicitly from the UI.
Remove the hasPermission state and the checks within sendNotification/scheduleNotification in the provider if these methods are only ever going to delegate to the service (which handles permissions internally). If the provider's send/schedule are for other non-goal notifications, keep the checks but consider calling the service's permission method for consistency.
4. Refine LotusNotificationProvider.tsx

Remove the duplicated validateAndFormatSound.
Refactor scheduleWaterReminders to manage the goal data and then call notificationService.updateSchedule.
Remove cancelWaterReminders from the context value.
Decide if the generic sendNotification and scheduleNotification are needed at the provider level. If so, ensure their permission handling is consistent (perhaps by calling notificationService.requestPermissions() first).
Consider adding error handling around service calls.
Example Refactoring for LotusNotificationProvider.tsx:

typescriptreact
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { AppState, Platform } from 'react-native';
import { ExpoGoalsNotificationService, GoalsNotificationService } from '../services/goalsNotificationService';
import { Goal } from '../types'; // Assuming Goal type is correctly defined
import { GoalsStorageService, LocalGoalsStorageService } from '../services/goalsStorageService';
// import { tokenCache } from '@/lib/auth'; // Assuming this is used elsewhere

interface LotusNotificationContextType {
  // Keep generic ones if needed for non-goal notifications
  sendNotification: (title: string, body: string, data?: object, sound?: any) => Promise<void>;
  scheduleNotification: (title: string, body: string, trigger: any, data?: object, sound?: any) => Promise<string>;
  cancelNotification: (notificationId: string) => Promise<void>; // For generic notifications
  cancelAllNotifications: () => Promise<void>; // For generic notifications

  // Permissions
  getNotificationPermissions: () => Promise<boolean>; // Request/check permissions

  // Goal-specific actions (orchestration)
  updateGoalReminders: (goal: Goal) => Promise<void>; // Use this instead of direct schedule/cancel
  disableGoalReminders: (goalId: string) => Promise<void>; // Explicit disable action

  // Specific example for water (could be generalized)
  configureWaterReminders: (frequency: number, targetGoal: number, enabled: boolean) => Promise<void>;
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
  // Service instances
  // Use React.useMemo to avoid recreating instances on every render
  const notificationService = React.useMemo<GoalsNotificationService>(() => new ExpoGoalsNotificationService(), []);
  const storageService = React.useMemo<GoalsStorageService>(() => new LocalGoalsStorageService(), []);

  useEffect(() => {
    const initializeApp = async () => {
      configureNotifications(); // Basic Expo config
      await notificationService.requestPermissions(); // Initial permission check/request via service

      // Load initial goals - consider if this should trigger rescheduling
      try {
        await storageService.loadGoals();
        // Optional: Reschedule all active goals on app start?
        // const goals = storageService.getGoals(); // Assuming getGoals exists
        // await Promise.all(goals.map(goal => notificationService.updateSchedule(goal)));
      } catch (error) {
        console.error('Error loading initial goals:', error);
      }

      const subscription = AppState.addEventListener('change', async (nextAppState) => {
        if (nextAppState === 'active') {
          console.log('App came to foreground. Checking permissions and loading goals.');
          await notificationService.requestPermissions(); // Re-check permissions on foreground
          try {
            await storageService.loadGoals(); // Reload goals
             // Optional: Reschedule active goals when app becomes active?
             // const goals = storageService.getGoals();
             // await Promise.all(goals.map(goal => notificationService.updateSchedule(goal)));
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
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notificationService, storageService]);

  // Basic Expo Notification config (run once)
  const configureNotifications = () => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true, // Be mindful of badge management
      }),
    });
     // Consider setting up Android Notification Channels here if not done elsewhere
     // if (Platform.OS === 'android') { /* ... setup channels ... */ }
  };

  // Expose permission request via service
  const getNotificationPermissions = async (): Promise<boolean> => {
    return await notificationService.requestPermissions();
  };

  // --- Generic Notification Methods (if needed) ---
  // These should likely also use the service's permission check
  // and potentially its sound formatting utility if kept public

  const sendNotification = async (title: string, body: string, data: object = {}, sound?: any) => {
     const hasPermission = await notificationService.requestPermissions();
     if (!hasPermission) {
       throw new Error('Notification permissions not granted');
     }
     // TODO: Use sound formatting from service or a shared util
     // const formattedSound = notificationService.validateAndFormatSound(sound); // If made public/static
     await Notifications.scheduleNotificationAsync({
       content: { title, body, data /*, sound: formattedSound */ },
       trigger: null, // Immediate
     });
  };

  const scheduleNotification = async (title: string, body: string, trigger: any, data: object = {}, sound?: any): Promise<string> => {
     const hasPermission = await notificationService.requestPermissions();
     if (!hasPermission) {
       throw new Error('Notification permissions not granted');
     }
     // TODO: Use sound formatting from service or a shared util
     // const formattedSound = notificationService.validateAndFormatSound(sound);
     return Notifications.scheduleNotificationAsync({
       content: { title, body, data /*, sound: formattedSound */ },
       trigger,
     });
  };

  const cancelNotification = async (notificationId: string) => {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  };

  const cancelAllNotifications = async () => {
    // Careful: This cancels ALL notifications, including goal reminders
    // Might need a more specific approach if generic and goal notifications coexist significantly
    console.warn('[Notification Provider] Canceling ALL scheduled notifications.');
    await Notifications.cancelAllScheduledNotificationsAsync();
  };

  // --- Goal Reminder Orchestration ---

  // Central method to update reminders based on goal state
  const updateGoalReminders = async (goal: Goal) => {
    try {
      // Persist the goal changes first (important!)
      await storageService.saveGoal(goal); // Assuming saveGoal exists
      // Then update the notification schedule based on the saved goal state
      await notificationService.updateSchedule(goal);
    } catch (error) {
      console.error(`Error updating reminders for goal ${goal.id}:`, error);
      throw error; // Re-throw for UI handling
    }
  };

  // Explicit method to disable reminders for a goal
  const disableGoalReminders = async (goalId: string) => {
    try {
       // Optionally update the goal's isEnabled state in storage first
       // const goal = await storageService.getGoal(goalId);
       // if (goal) {
       //   goal.isEnabled = false;
       //   await storageService.saveGoal(goal);
       // }
       // Then cancel the notifications
      await notificationService.cancel(goalId);
    } catch (error) {
      console.error(`Error disabling reminders for goal ${goalId}:`, error);
      throw error;
    }
  };


  // Specific water reminder configuration - interacts with storage and updateGoalReminders
  const configureWaterReminders = async (frequency: number, targetGoal: number, enabled: boolean) => {
    try {
      // Define a consistent ID for the water goal
      const waterGoalId = 'system_water_goal'; // Or load from config/constants

      // Attempt to load existing water goal or create a new one
      let waterGoal = await storageService.getGoal(waterGoalId); // Assuming getGoal exists

      const now = new Date();

      if (waterGoal) {
        // Update existing goal
        waterGoal.targetValue = targetGoal;
        waterGoal.reminderFrequency = frequency;
        waterGoal.isEnabled = enabled;
        waterGoal.lastUpdated = now;
      } else {
        // Create new goal if it doesn't exist
        waterGoal = {
          id: waterGoalId,
          type: 'water',
          currentValue: 0, // Or load current progress if tracked elsewhere
          targetValue: targetGoal,
          reminderFrequency: frequency,
          isEnabled: enabled,
          lastUpdated: now,
          every: 'day', // Or relevant period
        };
      }

      // Use the central update method which saves and schedules
      await updateGoalReminders(waterGoal);

      console.log(`Water reminders configured: Enabled=${enabled}, Freq=${frequency}h, Target=${targetGoal}oz`);

    } catch (error) {
      console.error('Error configuring water reminders:', error);
      throw error;
    }
  };


  const value = {
    sendNotification,
    scheduleNotification,
    cancelNotification,
    cancelAllNotifications,
    getNotificationPermissions,
    updateGoalReminders, // Expose the central update method
    disableGoalReminders, // Expose the central disable method
    configureWaterReminders, // Expose the specific water config method
  };

  return (
    <LotusNotificationContext.Provider value={value}>
      {children}
    </LotusNotificationContext.Provider>
  );
};
Use code with care. Learn more
5. Sound File Handling (validateAndFormatSound)

Problem: Duplicated logic. Also, the handling of 'default' and file extensions needs care.
Recommendation:
Keep this logic within ExpoGoalsNotificationService as it's directly related to formatting the content.sound property for goal notifications.
Refine it slightly based on newer Expo documentation:
On iOS, sound: 'default' is valid.
On Android, sound: null often represents the default sound. Custom sounds should be the filename without the extension, placed in android/app/src/main/res/raw.
The updated validateAndFormatSound in the ExpoGoalsNotificationService example above incorporates this. Ensure your sound files (Lotus-Water-Goals.mp3) are correctly placed for each platform if using custom sounds.
By making these changes, you'll have:

A goalsNotificationService that correctly handles scheduling multiple reminders per goal based on frequency.
A cleaner separation of concerns, with goal-specific logic inside the service.
A LotusNotificationProvider that orchestrates goal updates and provides general notification capabilities if needed.
More robust handling of permissions and notification cancellation.