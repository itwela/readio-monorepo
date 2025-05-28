import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useLotusUser } from '@/helpers/providers/lotusUserContext';
import { Id } from '@/convex/_generated/dataModel';

interface LotusStreakContextType {
  // presenceCurrentStreak: number;
  // presenceHighestStreak: number;
  giantStepsCurrentStreak: number;
  giantStepsHighestStreak: number;
  updateMeditationStreak: () => Promise<void>;
  updateGiantStepsStreak: () => Promise<void>;
  resetPresenceStreak: () => Promise<void>;
  resetGiantStepsStreak: () => Promise<void>;
  updatePresenceStatsForUser: (userId: string, minutes: number) => Promise<void>;
  updateGiantStepsStatsForUser: (userId: string, steps: number, duration: number) => Promise<void>;
}

const LotusStreakContext = createContext<LotusStreakContextType | null>(null);

export const LotusStreakProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // const [presenceCurrentStreak, setPresenceCurrentStreak] = useState(0);
  // const [presenceHighestStreak, setPresenceHighestStreak] = useState(0);
  const [giantStepsCurrentStreak, setGiantStepsCurrentStreak] = useState(0);
  const [giantStepsHighestStreak, setGiantStepsHighestStreak] = useState(0);

  const { user } = useLotusUser();
  const updateMeditationStreakMutation = useMutation(api.users.updateMeditationStreak);
  const updateGiantStepsStreakMutation = useMutation(api.users.updateGiantStepsStreak);
  const updateMeditationStatsMutation = useMutation(api.users.updateMeditationStats);
  const updateGiantStepsStatsMutation = useMutation(api.users.updateGiantStepsStats);

  const updateMeditationStreak = async () => {
    if (!user?._id) return;

    try {
      const today = new Date().toISOString().split('T')[0];


      let currentStreak = user.meditation_current_streak || [];
      const lastEntry = currentStreak[currentStreak.length - 1];

      if (lastEntry?.date === today) return;

      const lastDate = lastEntry ? new Date(lastEntry.date) : null;
      const dayGap = lastDate ? 
        Math.floor((new Date(today).getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)) : 
        null;

      if (!lastDate || (dayGap && dayGap > 1)) {
        currentStreak = [{ date: today, used: true }];
      } else {
        currentStreak.push({ date: today, used: true });
      }

      const newCurrentStreak = currentStreak.length;
      const newHighestStreak = Math.max(newCurrentStreak, user.meditation_highest_streak || 0);

      await updateMeditationStreakMutation({
        userId: user._id,
        currentStreak,
        highestStreak: newHighestStreak
      });


    } catch (error) {
      console.error('Error updating presence streak:', error);
    }
  };

  const updateGiantStepsStreak = async () => {
    if (!user?._id) return;

    try {
      const today = new Date().toISOString().split('T')[0];

      let currentStreak = user.giant_steps_current_streak || [];
      const lastEntry = currentStreak[currentStreak.length - 1];

      if (lastEntry?.date === today) return;

      const lastDate = lastEntry ? new Date(lastEntry.date) : null;
      const dayGap = lastDate ? 
        Math.floor((new Date(today).getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)) : 
        null;

      if (!lastDate || (dayGap && dayGap > 1)) {
        currentStreak = [{ date: today, used: true }];
      } else {
        currentStreak.push({ date: today, used: true });
      }

      const newCurrentStreak = currentStreak.length;
      const newHighestStreak = Math.max(newCurrentStreak, user.giant_steps_highest_streak || 0);

      await updateGiantStepsStreakMutation({
        userId: user._id,
        currentStreak,
        highestStreak: newHighestStreak
      });

      setGiantStepsCurrentStreak(newCurrentStreak);
      setGiantStepsHighestStreak(newHighestStreak);
    } catch (error) {
      console.error('Error updating giant steps streak:', error);
    }
  };

  const updatePresenceStatsForUser = async (userId: string, minutes: number) => {
    try {
      
      const currentStats = user.meditation_stats || [];
      currentStats.push({
        timestamp: new Date().toISOString(),
        minutes: minutes
      });
      
      await updateMeditationStatsMutation({
        userId: user._id,
        meditationStats: currentStats
      });
    } catch (error) {
      console.error('Error updating presence stats:', error);
    }
  };

  const updateGiantStepsStatsForUser = async (userId: string, steps: number, duration: number) => {
    try {
      
      const currentStats = user.giant_steps_stats || [];
      currentStats.push({
        timestamp: new Date().toISOString(),
        steps: steps,
        minutes: duration
      });
      
      await updateGiantStepsStatsMutation({
        userId: user._id,
        giantStepsStats: currentStats
      });
    } catch (error) {
      console.error('Error updating giant steps stats:', error);
    }
  };

  const resetPresenceStreak = async () => {
    if (!user?._id) return;

    try {
      await updateMeditationStreakMutation({
        userId: user._id,
        currentStreak: [],
        highestStreak: 0
      });
      // setPresenceCurrentStreak(0);
    } catch (error) {
      console.error('Error resetting presence streak:', error);
    }
  };

  const resetGiantStepsStreak = async () => {
    if (!user?._id) return;

    try {
      await updateGiantStepsStreakMutation({
        userId: user._id,
        currentStreak: [],
        highestStreak: 0
      });
      setGiantStepsCurrentStreak(0);
    } catch (error) {
      console.error('Error resetting giant steps streak:', error);
    }
  };

  return (
    <LotusStreakContext.Provider value={{
      // presenceCurrentStreak,
      // presenceHighestStreak,
      giantStepsCurrentStreak,
      giantStepsHighestStreak,
      updateMeditationStreak,
      updateGiantStepsStreak,
      resetPresenceStreak,
      resetGiantStepsStreak,
      updatePresenceStatsForUser,
      updateGiantStepsStatsForUser,
    }}>
      {children}
    </LotusStreakContext.Provider>
  );
};

export const useLotusStreak = () => {
  const context = useContext(LotusStreakContext);
  if (!context) throw new Error('useLotusStreak must be used within a LotusStreakProvider');
  return context;
};
