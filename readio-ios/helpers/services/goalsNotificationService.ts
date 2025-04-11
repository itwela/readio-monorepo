import * as Notifications from 'expo-notifications';
import { Goal } from '@/helpers/types';
import { Platform } from 'react-native';
import { SoundAssets } from '@/constants/soundAssets';

export interface GoalsNotificationService {
  schedule: (goal: Goal) => Promise<void>;
  cancel: (goalId: string,) => Promise<void>;
  updateSchedule: (goal: Goal) => Promise<void>;
  requestPermissions: () => Promise<boolean>;
}

export class ExpoGoalsNotificationService implements GoalsNotificationService {
  
  private async ensurePermissions(): Promise<boolean> {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      return newStatus === 'granted';
    }
    return true;
  }

  async requestPermissions(): Promise<boolean> {
    return this.ensurePermissions();
  }

  private getNotificationIdentifierPrefix(goalId: string): string {
    return `goal_notification_${goalId}_`;
  }

  private getNotificationIdentifier(goalId: string, hour: number, minute: number): string {
    const hourStr = String(hour).padStart(2, '0');
    const minuteStr = String(minute).padStart(2, '0');
    return `${this.getNotificationIdentifierPrefix(goalId)}${hourStr}_${minuteStr}`;
  }

  private validateAndFormatSound = (sound?: any) => {
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

  async schedule(goal: Goal): Promise<void> {
    // If goals are not enabled, cancel existing and return
    if (!goal.isEnabled) {
      await this.cancel(goal.id);
      console.log(`[Notification Schedule] Goal ${goal.id} (${goal.type}) is disabled. Canceled any existing reminders.`);
      return;
    }

    // Ensure permissions are granted
    const hasPermission = await this.ensurePermissions();
    if (!hasPermission) {
      console.warn(`[Notification Schedule] Permissions not granted. Cannot schedule reminders for goal ${goal.id}.`);
      return;
    }

    // Cancel ALL existing notifications for this goal first
    await this.cancel(goal.id);
    console.log(`[Notification Schedule] Canceled existing reminders for goal ${goal.id} before rescheduling.`);

    // Scheduling Logic for Multiple Reminders
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
            body: this.getNotificationBody(goal),
            data: {
              type: this.getNotificationDataType(goal),
              goalId: goal.id,
              goalAmount: goal.targetValue,
              reminderAmount: goal.reminderFrequency,
              scheduledHour: hour,
              scheduledMinute: minute,
            },
            sound: formattedSound,
            interruptionLevel: 'timeSensitive'
          }, 
          trigger: {
            // TODO
            type: 'daily' as Notifications.SchedulableTriggerInputTypes, 
            hour: hour,
            minute: minute,
            repeats: true
          } as Notifications.DailyTriggerInput,
          identifier: identifier,
        });
        scheduledCount++;
        console.log(`[Notification Schedule] Scheduled reminder for goal ${goal.id} at ${hour}:${String(minute).padStart(2, '0')}. Identifier: ${identifier}`);
      } catch (error) {
        console.error(`[Notification Schedule] Failed to schedule reminder for goal ${goal.id} at ${hour}:${minute}. Error:`, error);
      }
    }
    console.log(`[Notification Schedule] Finished scheduling for goal ${goal.id}. Total reminders scheduled: ${scheduledCount}`);
  }

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
        console.log(`[Notification Cancel] No scheduled reminders found for goal ${goalId}.`);
      }
    } catch (error) {
      console.error(`[Notification Cancel] Error canceling reminders for goal ${goalId}:`, error);
      throw error;
    }
  }

  async updateSchedule(goal: Goal): Promise<void> {
    await this.schedule(goal);
  }

  private getNotificationDataType(goal: Goal): string {
    switch (goal.type) {
      case 'water':
        return 'water_reminder';
      case'meditation':
        return 'meditation_reminder';
      case'steps':
        return 'steps_reminder';
      case'reading':
        return 'reading_reminder';
      default:
        return 'goal_reminder';
    }
  }

  private getNotificationTitle(goal: Goal): string {
    switch (goal.type) {
      case 'water':
        return `It's time to drink water!`;
      case'meditation':
        return 'Meditation Reminder';
      case'steps':
        return 'Step Count Reminder';
      case'reading':
        return 'Reading Reminder';
      default:
        return 'Goal Reminder';
    }
  }

  private getNotificationBody(goal: Goal): string {
    const progressPercentage = Math.round((goal.currentValue / goal.targetValue) * 100);
    
    switch (goal.type) {
      case 'water':
        return `Lets hit that ${goal.targetValue}oz daily goal. Stay hydrated!`;
      case 'meditation':
        return `You've meditated for ${goal.currentValue} minutes today. Time to find your zen!`;
      case 'steps':
        return `You've taken ${goal.currentValue} steps (${progressPercentage}% of your daily goal). Keep moving!`;
      case 'reading':
        return `You've read for ${goal.currentValue} minutes today. Time to dive back into your book!`;
      default:
        return `Don't forget to track your ${goal.type} progress!`;
    }
  }

  private getNotificationSound(goal: Goal): string {
    switch (goal.type) {
      case 'water':
        return SoundAssets.waterSound.name;
      case'meditation':
        return 'default';
      case'steps':
        return 'default';
      case'reading':
        return 'default';
      default:
        return 'default';
    }
  }

}

export default ExpoGoalsNotificationService;