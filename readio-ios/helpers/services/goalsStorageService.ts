import sql from '@/helpers/neonClient';
import { Goal } from '@/helpers/types';

export interface GoalsStorageService {
  loadGoals: (userId: string) => Promise<Goal[]>;
  saveGoals: (userId: string, goals: Goal[]) => Promise<void>;
  updateGoal: (userId: string, goalId: string, updates: Partial<Goal>) => Promise<void>;
  createGoal: (userId: string, goal: Omit<Goal, 'id' | 'lastUpdated'>) => Promise<Goal>;
  deleteGoal: (userId: string, goalId: string) => Promise<void>;
}

export class NeonGoalsStorageService implements GoalsStorageService {
  async loadGoals(userId: string): Promise<Goal[]> {
    try {
      const result = await sql`
        SELECT user_goals FROM users 
        WHERE id = ${userId}
      `;
      
      if (result?.[0]?.user_goals) {
        return result[0].user_goals;
      }

      // Return default goals if none exist
      const defaultGoals = [{
        id: '1',
        type: 'water' as Goal['type'],
        currentValue: 0,
        targetValue: 0,
        reminderFrequency: 2,
        isEnabled: true,
        lastUpdated: new Date(),
      }];

      await this.saveGoals(userId, defaultGoals);
      return defaultGoals;
    } catch (error) {
      console.error('Error loading goals:', error);
      throw error;
    }
  }

  async saveGoals(userId: string, goals: Goal[]): Promise<void> {
    try {
      await sql`
        UPDATE users 
        SET user_goals = ${JSON.stringify(goals)}
        WHERE id = ${userId}
      `;
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
}