import * as Notifications from 'expo-notifications';
import { Goal } from '@/helpers/types';

export interface GoalsNotificationService {
  schedule: (goal: Goal) => Promise<void>;
  cancel: (goalId: string) => Promise<void>;
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

  async schedule(goal: Goal): Promise<void> {
    if (!goal.isEnabled) return;

    const hasPermission = await this.ensurePermissions();
    if (!hasPermission) return;

    // Cancel any existing notifications for this goal
    await this.cancel(goal.id);

    // Set initial notification time to 8 AM
    const startHour = 8;
    
    // Schedule a single repeating notification
    const identifier = this.getNotificationIdentifier(goal.id);
    
    // Always schedule a daily notification at 8 AM
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Time for your ${goal.type} goal!`,
        body: this.getNotificationBody(goal),
      },
      trigger: {
        type: 'daily',
        hour: startHour,
        minute: 0,
        repeats: true
      } as Notifications.DailyTriggerInput,
      identifier,
    });
    
    console.log(`[Notification Schedule] Scheduled daily ${goal.type} reminder at ${startHour}:00`);
  }

  async cancel(goalId: string): Promise<void> {
    const identifier = this.getNotificationIdentifier(goalId);
    await Notifications.cancelScheduledNotificationAsync(identifier);
  }

  async updateSchedule(goal: Goal): Promise<void> {
    await this.schedule(goal);
  }

  private getNotificationBody(goal: Goal): string {
    const progressPercentage = Math.round((goal.currentValue / goal.targetValue) * 100);
    
    switch (goal.type) {
      case 'water':
        return `You've had ${goal.currentValue}ml of water (${progressPercentage}% of your daily goal). Stay hydrated!`;
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
}