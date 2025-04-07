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
    const endHour = 22;
    
    // Get current time
    const now = new Date();
    const currentHour = now.getHours();
    
    // Schedule a single repeating notification
    const identifier = this.getNotificationIdentifier(goal.id);
    
    // If it's past endHour or if the first notification would be after endHour,
    // schedule everything for the next day starting at 8 AM
    const shouldStartTomorrow = currentHour >= endHour || 
      (currentHour + goal.reminderFrequency > endHour);
    
    if (goal.reminderFrequency >= (endHour - startHour) || shouldStartTomorrow) {
      console.log(`[Notification Schedule] Scheduling single daily notification for ${goal.type} goal`);
      console.log(`[Notification Schedule] Goal ID: ${goal.id}, Reminder Frequency: ${goal.reminderFrequency}h`);
      console.log(`[Notification Schedule] Setting notification for ${startHour}:00 daily`);
      
      // Schedule for next day at 8 AM
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Time for your ${goal.type} goal!`,
          body: this.getNotificationBody(goal),
        },
        trigger: {
          type: 'daily' as Notifications.SchedulableTriggerInputTypes,
          hour: startHour,
          minute: 0,
          repeats: true
        } as Notifications.DailyTriggerInput,
        identifier,
      });
      
      console.log(`[Notification Schedule] Successfully scheduled notification with ID: ${identifier}`);
    } else {
      console.log(`[Notification Schedule] Scheduling multiple daily notifications for ${goal.type} goal`);
      console.log(`[Notification Schedule] Current hour: ${currentHour}, Reminder Frequency: ${goal.reminderFrequency}h`);
      
      // Calculate the next available notification time
      let nextHour = currentHour + goal.reminderFrequency;
      if (nextHour < startHour) nextHour = startHour;
      
      console.log(`[Notification Schedule] First notification scheduled for ${nextHour}:00`);
      
      // Schedule notifications within allowed hours
      for (let hour = nextHour; hour < endHour; hour += goal.reminderFrequency) {
        const additionalIdentifier = `${identifier}_${hour}`;
        console.log(`[Notification Schedule] Scheduling notification for ${hour}:00`);
        
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `Time for your ${goal.type} goal!`,
            body: this.getNotificationBody(goal),
          },
          trigger: {
            type: 'daily' as Notifications.SchedulableTriggerInputTypes,
            hour,
            minute: 0,
            repeats: true
          } as Notifications.DailyTriggerInput,
          identifier: additionalIdentifier,
        });
        
        console.log(`[Notification Schedule] Successfully scheduled notification with ID: ${additionalIdentifier}`);
      }
      
      console.log(`[Notification Schedule] Completed scheduling ${Math.floor((endHour - nextHour) / goal.reminderFrequency)} notifications`);
    }
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