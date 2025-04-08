import React, { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { Goal } from '@/helpers/types';
import { useLotusUser } from './lotusUserContext';
import { ExpoGoalsNotificationService, GoalsNotificationService } from '../services/goalsNotificationService';
import { LocalGoalsStorageService, GoalsStorageService } from '../services/goalsStorageService';
import { tokenCache } from '@/lib/auth';
import { setStateAsync } from '@/constants/utilityFunctions';

interface LotusGoalsContextType {
  goals: Goal[];
  setGoals: (goals: Goal[]) => void;
  updateGoal: (goalId: string, updates: Partial<Goal>) => Promise<void>;
  loadUserGoals: () => Promise<void>;
  toggleGoalReminder: (goalId: string) => Promise<void>;
  updateGoalProgress: (goalId: string, value: number) => Promise<void>;
  createGoal: (goal: Omit<Goal, 'id' | 'lastUpdated'>) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
}

const LotusGoalsContext = createContext<LotusGoalsContextType | null>(null);

export const LotusGoalsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, needsToRefresh } = useLotusUser();
  const [goals, setGoals] = useState<Goal[]>([]);

  // Initialize services
  const notificationService: GoalsNotificationService = new ExpoGoalsNotificationService();
  const storageService: GoalsStorageService = new LocalGoalsStorageService();


  useEffect(() => {
    loadUserGoals();
  }, [needsToRefresh]);
  
  const loadUserGoals = async () => {
    try {
      const userGoals = await storageService.loadGoals();
      await setStateAsync(setGoals, userGoals, 'backendData');

      console.log('\n\n🟢[lotusGoalContext] Loaded goals...', userGoals);
      
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const updateGoal = async (goalId: string, updates: Partial<Goal>) => {
    try {
      
      await storageService.updateGoal(goalId, updates);

      const uDGoals  = await storageService.loadGoals();
      console.log('\n\n🟢[lotusGoalContext] Updated goals now...', uDGoals);
      // setGoals(updatedGoals);

      // TODO
      // Update notifications if needed
      const updatedGoals = goals.map(goal =>
        goal.id === goalId ? { ...goal, ...updates, lastUpdated: new Date() } : goal
      ) as any;
      const updatedGoal = updatedGoals.find((g: any) => g.id === goalId);

      if (updatedGoal) {
        await notificationService.updateSchedule(updatedGoal);
        console.log('\n\n🟢[lotusGoalContext] Found update and am updated notifications...', updatedGoal);
      }

    } catch (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
  };

  const toggleGoalReminder = async (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const isEnabled = !goal.isEnabled;
    await updateGoal(goalId, { isEnabled: isEnabled });

    console.log('\n\n🟢[lotusGoalContext] Toggled goal reminder...', goal);
    console.log('\n\n🟢[lotusGoalContext] isEnabled...', isEnabled);

    if (isEnabled) {
      await notificationService.schedule(goal);
    } else {
      await notificationService.cancel(goalId);
    }
  };


  // STUB --- For future if we ever need it
  const updateGoalProgress = async (goalId: string, value: number) => {
    await updateGoal(goalId, {
      currentValue: value,
      lastUpdated: new Date()
    });
  };

  const createGoal = async (goalData: Omit<Goal, 'id' | 'lastUpdated'>) => {
    try {
      const newGoal = await storageService.createGoal(goalData);
      setGoals([...goals, newGoal]);

      if (newGoal.isEnabled) {
        await notificationService.schedule(newGoal);
      }
    } catch (error) {
      console.error('Error creating goal:', error);
      throw error;
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      await storageService.deleteGoal(goalId);
      await notificationService.cancel(goalId);
      setGoals(goals.filter(goal => goal.id !== goalId));
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  };
  // ---------

  return (
    <LotusGoalsContext.Provider
      value={{
        goals,
        setGoals,
        updateGoal,
        loadUserGoals,
        toggleGoalReminder,
        updateGoalProgress,
        createGoal,
        deleteGoal,
      }}
    >
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