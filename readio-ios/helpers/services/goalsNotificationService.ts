import * as Notifications from 'expo-notifications';
import { Goal } from '@/helpers/types';
import { Platform } from 'react-native';

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

  private getNotificationIdentifier(goalId: string): string {
    return `goal_notification_${goalId}`;
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
    
    // If goals are not enabled, do nothing
    if (!goal.isEnabled) return;

    // Ensure permissions are granted
    const hasPermission = await this.ensurePermissions();
    if (!hasPermission) return;

    // Cancel any existing scheduled notifications for this goal
    await this.cancel(goal.id);

    // Make new ones

    // Start with variables needed
    const startHour = 8;  // 8 AM
    const endHour = 22;   // 10 PM
    const now = new Date();
    const currentHour = now.getHours();
    const nextHour = currentHour >= endHour || currentHour < startHour ? startHour : currentHour + 1;
    const identifier = this.getNotificationIdentifier(goal.id);
    const formattedSound = this.validateAndFormatSound(this.getNotificationSound(goal));

    // Schedule the notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: this.getNotificationTitle(goal),
        body: this.getNotificationBody(goal),
        data: {
          type: this.getNotificationDataType(goal),
          goalAmount: goal.targetValue,
          reminderAmount: goal.reminderFrequency,
          // TODO
          scheduledHour: startHour
        },
        sound: formattedSound
      },
      trigger: {
        type: 'daily',
        // TODO
        hour: nextHour,
        // TODO
        minute: 0,
        repeats: true
      } as Notifications.DailyTriggerInput,
      identifier: identifier,
    });

    // Log the schedule
    console.log(`[Notification Schedule] Scheduled daily ${goal.type} reminder at ${startHour}:00`);
  }

  async cancel(goalId: string): Promise<void> {
    const identifier = this.getNotificationIdentifier(goalId);
    await Notifications.cancelScheduledNotificationAsync(identifier);
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
        return 'Lotus-Water-Goals.mp3';
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