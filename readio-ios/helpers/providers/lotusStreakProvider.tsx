import React, { createContext, useContext, useState, ReactNode } from 'react';
import sql from '@/helpers/neonClient';
import { useLotusUser } from '@/helpers/providers/lotusUserContext';

interface LotusStreakContextType {
  presenceCurrentStreak: number;
  presenceHighestStreak: number;
  giantStepsCurrentStreak: number;
  giantStepsHighestStreak: number;
  updatePresenceStreak: () => Promise<void>;
  updateGiantStepsStreak: () => Promise<void>;
  resetPresenceStreak: () => Promise<void>;
  resetGiantStepsStreak: () => Promise<void>;
}

const LotusStreakContext = createContext<LotusStreakContextType | null>(null);

// LotusStreakProvider: Main component that manages meditation streak tracking
// Maintains two types of streaks: Presence (meditation) and Giant Steps
export const LotusStreakProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State management for both types of streaks
  // Each streak type has a current streak (ongoing) and highest streak (all-time best)
  const [presenceCurrentStreak, setPresenceCurrentStreak] = useState(0);
  const [presenceHighestStreak, setPresenceHighestStreak] = useState(0);
  const [giantStepsCurrentStreak, setGiantStepsCurrentStreak] = useState(0);
  const [giantStepsHighestStreak, setGiantStepsHighestStreak] = useState(0);

  // Get current user context for database operations
  const { user } = useLotusUser();

  // Function to update the meditation (presence) streak
  // This is called whenever a user completes a meditation session
  const updatePresenceStreak = async () => {
    if (!user?.id) return;

    try {
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];

      const result = await sql`
        SELECT presence_current_streak, presence_highest_streak
        FROM users
        WHERE id = ${user.id}
      `;

      if (!result || result.length === 0) return;

      let currentStreak = result[0].presence_current_streak || [];
      const lastEntry = currentStreak[currentStreak.length - 1];

      // If no previous entries, start new streak
      if (!lastEntry) {
        currentStreak = [{ date: todayString, used: true }];
      } else {
        // Get the date difference
        const lastDate = new Date(lastEntry.date);
        const diffTime = today.getTime() - lastDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        // Same day - do nothing
        if (diffDays === 0) {
          return;
        }
        // Yesterday - continue streak
        else if (diffDays === 1) {
          currentStreak.push({ date: todayString, used: true });
        }
        // Before yesterday - reset streak
        else {
          currentStreak = [{ date: todayString, used: true }];
        }
      }

      const newCurrentStreak = currentStreak.length;
      const newHighestStreak = Math.max(newCurrentStreak, result[0].presence_highest_streak || 0);

      await sql`
        UPDATE users
        SET 
          presence_current_streak = array[${JSON.stringify(currentStreak)}]::jsonb[],
          presence_highest_streak = ${newHighestStreak}
        WHERE id = ${user.id}
      `;

      setPresenceCurrentStreak(newCurrentStreak);
      setPresenceHighestStreak(newHighestStreak);
    } catch (error) {
      console.error('Error updating presence streak:', error);
    }
  };
  

  const updateGiantStepsStreak = async () => {
    if (!user?.id) return;

    try {
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];

      const result = await sql`
        SELECT giant_steps_current_streak, giant_steps_highest_streak
        FROM users
        WHERE id = ${user.id}
      `;

      if (!result || result.length === 0) return;

      let currentStreak = result[0].giant_steps_current_streak || [];
      const lastEntry = currentStreak[currentStreak.length - 1];

      // If no previous entries, start new streak
      if (!lastEntry) {
        currentStreak = [{ date: todayString, used: true }];
      } else {
        // Get the date difference
        const lastDate = new Date(lastEntry.date);
        const diffTime = today.getTime() - lastDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        // Same day - do nothing
        if (diffDays === 0) {
          return;
        }
        // Yesterday - continue streak
        else if (diffDays === 1) {
          currentStreak.push({ date: todayString, used: true });
        }
        // Before yesterday - reset streak
        else {
          currentStreak = [{ date: todayString, used: true }];
        }
      }

      const newCurrentStreak = currentStreak.length;
      const newHighestStreak = Math.max(newCurrentStreak, result[0].giant_steps_highest_streak || 0);

      await sql`
        UPDATE users
        SET 
          giant_steps_current_streak = array[${JSON.stringify(currentStreak)}]::jsonb[],
          giant_steps_highest_streak = ${newHighestStreak}
        WHERE id = ${user.id}
      `;

      setGiantStepsCurrentStreak(newCurrentStreak);
      setGiantStepsHighestStreak(newHighestStreak);
    } catch (error) {
      console.error('Error updating giant steps streak:', error);
    }
  };

  const resetPresenceStreak = async () => {
    if (!user?.id) return;

    try {
      await sql`
        UPDATE users
        SET presence_current_streak = '[]'::jsonb[]
        WHERE id = ${user.id}
      `;
      setPresenceCurrentStreak(0);
    } catch (error) {
      console.error('Error resetting presence streak:', error);
    }
  };

  const resetGiantStepsStreak = async () => {
    if (!user?.id) return;

    try {
      await sql`
        UPDATE users
        SET giant_steps_current_streak = '[]'::jsonb[]
        WHERE id = ${user.id}
      `;
      setGiantStepsCurrentStreak(0);
    } catch (error) {
      console.error('Error resetting giant steps streak:', error);
    }
  };

  return (
    <LotusStreakContext.Provider value={{
      presenceCurrentStreak,
      presenceHighestStreak,
      giantStepsCurrentStreak,
      giantStepsHighestStreak,
      updatePresenceStreak,
      updateGiantStepsStreak,
      resetPresenceStreak,
      resetGiantStepsStreak,
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