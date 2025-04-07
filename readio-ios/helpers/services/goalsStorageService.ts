import AsyncStorage from '@react-native-async-storage/async-storage';
import { Goal } from '@/helpers/types';

export interface GoalsStorageService {
  loadGoals: (userId: string) => Promise<Goal[]>;
  saveGoals: (userId: string, goals: Goal[]) => Promise<void>;
  updateGoal: (userId: string, goalId: string, updates: Partial<Goal>) => Promise<void>;
  createGoal: (userId: string, goal: Omit<Goal, 'id' | 'lastUpdated'>) => Promise<Goal>;
  deleteGoal: (userId: string, goalId: string) => Promise<void>;
}

export class LocalGoalsStorageService implements GoalsStorageService {

  private getStorageKey(userId: string): string {
    return `user_goals_${userId}`;
  }

  async loadGoals(userId: string): Promise<Goal[]> {
    try {
      const storageKey = this.getStorageKey(userId);
      const storedGoals = await AsyncStorage.getItem(storageKey);
      
      if (storedGoals) {
        return JSON.parse(storedGoals);
      }

      // Return default goals if none exist
      const defaultGoals = [
        {
          id: '1',
          type: 'water',
          currentValue: 0,
          targetValue: 0,
          reminderFrequency: 2,
          isEnabled: false,
          lastUpdated: new Date(),
          every: 'day',
        } as Goal,
      ];

      await this.saveGoals(userId, defaultGoals);
      return defaultGoals;
      
    } catch (error) {
      console.error('Error loading goals:', error);
      throw error;
    }
  }

  async saveGoals(userId: string, goals: Goal[]): Promise<void> {
    try {
      const storageKey = this.getStorageKey(userId);
      await AsyncStorage.setItem(storageKey, JSON.stringify(goals));
    } catch (error) {
      console.error('Error saving goals:', error);
      throw error;
    }
  }

  async updateGoal(userId: string, goalId: string, updates: Partial<Goal>): Promise<void> {
    try {
      // First get current goals
      const currentGoals = await this.loadGoals(userId);
      
      // Update the specific goal
      const updatedGoals = currentGoals.map(goal =>
        goal.id === goalId ? { ...goal, ...updates, lastUpdated: new Date() } : goal
      );

      // Save updated goals
      await this.saveGoals(userId, updatedGoals);
    } catch (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
  }

  // STUB --- For future if we ever need it
  async createGoal(userId: string, goalData: Omit<Goal, 'id' | 'lastUpdated'>): Promise<Goal> {
    try {
      const currentGoals = await this.loadGoals(userId);
      
      const newGoal: Goal = {
        ...goalData,
        id: Date.now().toString(), // Simple ID generation
        lastUpdated: new Date()
      };

      const updatedGoals = [...currentGoals, newGoal];
      await this.saveGoals(userId, updatedGoals);

      return newGoal;
    } catch (error) {
      console.error('Error creating goal:', error);
      throw error;
    }
  }

  async deleteGoal(userId: string, goalId: string): Promise<void> {
    try {
      const currentGoals = await this.loadGoals(userId);
      const updatedGoals = currentGoals.filter(goal => goal.id !== goalId);
      await this.saveGoals(userId, updatedGoals);
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  }

  async clearStorage(userId: string): Promise<void> {
    try {
      const storageKey = this.getStorageKey(userId);
      await AsyncStorage.removeItem(storageKey);
      console.log('[Storage] Cleared goals storage for user:', userId);
    } catch (error) {
      console.error('Error clearing goals storage:', error);
      throw error;
    }
  }

}