import React, { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import sql from '@/helpers/neonClient';
import { useLotusUser } from './lotusUserContext';

interface Goal {
  id: string;
  type: 'water' | 'meditation' | 'steps' | 'reading';
  currentValue: number;
  targetValue: number;
  reminderFrequency: number; // in hours
  isEnabled: boolean;
  lastUpdated: Date;
}

interface LotusGoalsContextType {
  goals: Goal[];
  setGoals: (goals: Goal[]) => void;
  updateGoal: (goalId: string, updates: Partial<Goal>) => Promise<void>;
  toggleGoalReminder: (goalId: string) => Promise<void>;
  updateGoalProgress: (goalId: string, value: number) => Promise<void>;
  createGoal: (goal: Omit<Goal, 'id' | 'lastUpdated'>) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
}

const LotusGoalsContext = createContext<LotusGoalsContextType | null>(null);

const GOALS_NOTIFICATION_TASK = 'GOALS_NOTIFICATION_TASK';

// TaskManager.defineTask(GOALS_NOTIFICATION_TASK, ({ data, error }) => {
//   if (error) {
//     return;
//   }
//   // Handle background notification scheduling
// });

export const LotusGoalsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  
  const { user } = useLotusUser();

  const [goals, setGoals] = useState<Goal[]>([
  ]);

  // TODO
  const scheduleNotification = async (goal: Goal) => {
    if (!goal.isEnabled) return;

    const trigger = {
      seconds: goal.reminderFrequency * 3600, // Convert hours to seconds
      repeats: true
    };

    // TODO
    // await Notifications.scheduleNotificationAsync({
    //   content: {
    //     title: `Time for your ${goal.type} goal!`,
    //     body: `Don't forget to track your ${goal.type} progress`,
    //   },
    //   trigger,
    // });
  };

  // TODO
  const loadUserGoals = async () => {
    try {

      const result = await sql`
        SELECT user_goals FROM users 
        WHERE id = ${user.id}
      `;
      
      if (result?.[0]?.user_goals) {

        setGoals(result[0].user_goals);

      } else {

        // Initialize default goals if none exist
        const defaultGoals = [{
          id: '1',
          type: 'water' as Goal['type'],
          currentValue: 0,
          targetValue: 0,
          reminderFrequency: 2,
          isEnabled: true,
          lastUpdated: new Date(),
        }];

        await updateUserGoals(defaultGoals);
        setGoals(defaultGoals);

      }
    } catch (error) {

      console.error('Error loading goals:', error);

    }
  };

  const updateUserGoals = async (newGoals: Goal[]) => {
    try {

      await sql`
        UPDATE users 
        SET user_goals = ${JSON.stringify(newGoals)}
        WHERE id = ${user.id}
      `;

    } catch (error) {

      console.error('Error updating goals:', error);

    }
  };

  const updateGoal = async (goalId: string, updates: Partial<Goal>) => {
    try {
      // First, update the local state
      const updatedGoals = goals.map(goal => 
        goal.id === goalId ? { ...goal, ...updates } : goal
      );
      
      // Update the database
      await sql`
        UPDATE users 
        SET user_goals = ${JSON.stringify(updatedGoals)}
        WHERE id = ${user.id}
      `;

      // Update local state after successful DB update
      setGoals(updatedGoals);

      // Schedule notification if needed
      const updatedGoal = updatedGoals.find(g => g.id === goalId);
      if (updatedGoal) {
        await scheduleNotification(updatedGoal);
      }
    } catch (error) {
      console.error('Error updating goal:', error);
      throw error; // Propagate error to handle it in the UI if needed
    }
  };

  
  useEffect(() => {
    if (user?.id) {
      loadUserGoals();
    }
  }, [user]);


  // Add other methods here...

  return (
    <LotusGoalsContext.Provider value={{
      goals,
      setGoals,
      updateGoal,
      toggleGoalReminder: async () => {}, // Implement these methods
      updateGoalProgress: async () => {}, // based on your needs
      createGoal: async () => {},
      deleteGoal: async () => {},
    }}>
      {children}
    </LotusGoalsContext.Provider>
  );
};

export const useLotusGoals = () => {
  const context = useContext(LotusGoalsContext);
  if (!context) {
    throw new Error('useLotusGoals must be used within a LotusGoalsProvider');
  }
  return context;
};