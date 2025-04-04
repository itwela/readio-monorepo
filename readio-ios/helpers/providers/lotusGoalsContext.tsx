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
  //   TODO
//   setGoals : (goals: Goal[]) => void;
//   updateGoal: (goalId: string, updates: Partial<Goal>) => Promise<void>;
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
  const [goals, setGoals] = useState<Goal[]>([]);
  const { user } = useLotusUser();

  useEffect(() => {
    if (user?.id) {
      loadUserGoals();
    }
  }, [user]);

  const loadUserGoals = async () => {
    try {
      const userGoals = await sql`
        SELECT * FROM user_goals 
        WHERE user_id = ${user.id}
      `;
      setGoals(userGoals as Goal[]);
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

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

//   const updateGoal = async (goalId: string, updates: Partial<Goal>) => {
//     try {
//       await sql`
//         UPDATE user_goals 
//         SET ${sql(updates)}
//         WHERE id = ${goalId} AND user_id = ${user.id}
//       `;
      
//       setGoals(current => 
//         current.map(goal => 
//           goal.id === goalId ? { ...goal, ...updates } : goal
//         )
//       );

//       const updatedGoal = goals.find(g => g.id === goalId);
//       if (updatedGoal) {
//         await scheduleNotification({ ...updatedGoal, ...updates });
//       }
//     } catch (error) {
//       console.error('Error updating goal:', error);
//     }
//   };

  // Add other methods here...

  return (
    <LotusGoalsContext.Provider value={{
      goals,
    //   TODO 
    //   updateGoal,
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