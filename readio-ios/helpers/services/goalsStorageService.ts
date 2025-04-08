import AsyncStorage from '@react-native-async-storage/async-storage';
import { Goal } from '@/helpers/types';

export interface GoalsStorageService {
  loadGoals: () => Promise<Goal[]>;
  saveGoals: (goals: Goal[]) => Promise<void>;
  updateGoal: (goalId: string, updates: Partial<Goal>) => Promise<void>;
  createGoal: (goal: Omit<Goal, 'id' | 'lastUpdated'>) => Promise<Goal>;
  deleteGoal: (goalId: string) => Promise<void>;
}

export class LocalGoalsStorageService implements GoalsStorageService {

  // STUB ---- GOAL UTILITY FUNCTIONS
  private getStorageKey(): string {
    return `user_goals_lotus`;
  }

  async loadGoals(): Promise<Goal[]> {
    try {
      const storageKey = this.getStorageKey();
      const storedGoals = await AsyncStorage.getItem(storageKey);
      
      if (storedGoals) {
        console.log('🟢[Storage] Loaded goals for user:');
        console.log(storedGoals, '<--');
        return JSON.parse(storedGoals);
      }

      // Return default goals if none exist
      const defaultGoals = [
        {
          id: '1',
          type: 'water',
          currentValue: 0,
          targetValue: 64,
          reminderFrequency: 2,
          isEnabled: false,
          lastUpdated: new Date(),
          every: 'day',
        } as Goal,
      ];

      // await this.saveGoals(userJWT, defaultGoals);

      console.log('🟡[Storage] Loaded DEFAULT goals for user:');
      console.log(defaultGoals, '<--');

      return defaultGoals;
      // return [];
      
    } catch (error) {
      console.error('Error loading goals:', error);
      throw error;
    }
  }

  async saveGoals(goals: Goal[]): Promise<void> {
    try {
      const storageKey = this.getStorageKey();
      const sItem = await AsyncStorage.setItem(storageKey, JSON.stringify(goals));

      console.log('🟢[Storage] Set goal item for user / SAVED GOAL:');
      console.log(sItem, '<--');

    } catch (error) {
      console.error('Error saving goals:', error);
      throw error;
    }
  }

  // STUB  ------ THE BRAIN
  async updateGoal(goalId: string, updates: Partial<Goal>): Promise<void> {
    try {
      const currentGoals = await this.loadGoals();
      const updatedGoals = currentGoals.map(goal =>
        goal.id === goalId ? { ...goal, ...updates, lastUpdated: new Date() } : goal
      );
      await this.saveGoals(updatedGoals);
    } catch (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
  }

  // STUB --- For future if we ever need it
  async createGoal(goalData: Omit<Goal, 'id' | 'lastUpdated'>): Promise<Goal> {
    try {
      const currentGoals = await this.loadGoals();
      
      const newGoal: Goal = {
        ...goalData,
        id: Date.now().toString(), // Simple ID generation
        lastUpdated: new Date()
      };

      const updatedGoals = [...currentGoals, newGoal];
      await this.saveGoals(updatedGoals);

      return newGoal;
    } catch (error) {
      console.error('Error creating goal:', error);
      throw error;
    }
  }

  async deleteGoal(goalId: string): Promise<void> {
    try {
      const currentGoals = await this.loadGoals();
      const updatedGoals = currentGoals.filter(goal => goal.id !== goalId);
      await this.saveGoals(updatedGoals);
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  }

  async clearStorage(userJWT: string): Promise<void> {
    try {
      const storageKey = this.getStorageKey();
      await AsyncStorage.removeItem(storageKey);
      console.log('[Storage] Cleared goals storage for user:', userJWT);
    } catch (error) {
      console.error('Error clearing goals storage:', error);
      throw error;
    }
  }

}

export default LocalGoalsStorageService;
