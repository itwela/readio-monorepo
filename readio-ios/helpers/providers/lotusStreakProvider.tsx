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
      // Format today's date as YYYY-MM-DD for database comparison
      const today = new Date().toISOString().split('T')[0];

      // Fetch user's current streak information from database
      // This includes both their current streak array and their highest achieved streak
      const result = await sql`
        SELECT presence_current_streak, presence_highest_streak
        FROM users
        WHERE id = ${user.id}
      `;

      if (!result || result.length === 0) return;

      // Get current streak array (or empty array if none exists)
      // Each streak entry contains a date and a 'used' flag
      let currentStreak = result[0].presence_current_streak || [];
      const lastEntry = currentStreak[currentStreak.length - 1];

      // If user already meditated today, don't update streak
      if (lastEntry?.date === today) return;

      // Check if streak continuity is maintained (gap is not more than one day)
      // If gap is more than one day, streak is broken and needs to reset
      const lastDate = lastEntry ? new Date(lastEntry.date) : null;
      
      // Calculate the gap between today and last meditation date
      const dayGap = lastDate ? Math.floor((new Date(today).getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)) : null;

      // Reset streak only if there's no last date or gap is more than 1 day
      if (!lastDate || dayGap && dayGap > 1) {
        // Reset streak to just today
        currentStreak = [{ date: today, used: true }];
      } else {
        // Add today to existing streak
        currentStreak.push({ date: today, used: true });
      }

      // Calculate new streak lengths
      const newCurrentStreak = currentStreak.length;
      const newHighestStreak = Math.max(newCurrentStreak, result[0].presence_highest_streak || 0);

      // Update database with new streak information
      // Updates both the current streak array and highest streak if applicable
      await sql`
        UPDATE users
        SET 
          presence_current_streak = ${JSON.stringify(currentStreak)}::jsonb,
          presence_highest_streak = ${newHighestStreak}
        WHERE id = ${user.id}
      `;

      // Update local state to reflect new streak values
      setPresenceCurrentStreak(newCurrentStreak);
      setPresenceHighestStreak(newHighestStreak);
    } catch (error) {
      console.error('Error updating presence streak:', error);
    }
  };

  const updatePresenceStatsForUser = async (userId: string, minutes: number) => {
    try {
      const result = await sql`
        SELECT presence_stats
        FROM users
        WHERE id = ${userId}
      `;
      if (!result || result.length === 0) return;
      
      let currentStats = result[0].presence_stats || [];
      const sessionData = {
        timestamp: new Date().toISOString(),
        minutes: minutes
      };
      
      currentStats.push(sessionData);
      
      await sql`
        UPDATE users
        SET
          presence_stats = ${currentStats}::jsonb
        WHERE id = ${userId}
      `;
    } catch (error) {
      console.error('Error updating presence stats:', error);
    }
  };

  const updateGiantStepsStatsForUser = async (userId: string, steps: number, duration: number) => {
    try {
      const result = await sql`
        SELECT giant_steps_stats
        FROM users
        WHERE id = ${userId}
      `;
      if (!result || result.length === 0) return;
      
      let currentStats = result[0].giant_steps_stats || [];
      const sessionData = {
        timestamp: new Date().toISOString(),
        steps: steps,
        minutes: duration
      };
      
      currentStats.push(sessionData);
      
      await sql`
        UPDATE users
        SET
          giant_steps_stats = ${currentStats}::jsonb
        WHERE id = ${userId}
      `;
    } catch (error) {
      console.error('Error updating giant steps stats:', error);
    }
  };

  const updateGiantStepsStreak = async () => {
    if (!user?.id) return;

    try {
      // Similar implementation as updatePresenceStreak but for giant steps
      const today = new Date().toISOString().split('T')[0];

      const result = await sql`
        SELECT giant_steps_current_streak, giant_steps_highest_streak
        FROM users
        WHERE id = ${user.id}
      `;

      if (!result || result.length === 0) return;

      let currentStreak = result[0].giant_steps_current_streak || [];
      const lastEntry = currentStreak[currentStreak.length - 1];

      if (lastEntry?.date === today) return;

      const lastDate = lastEntry ? new Date(lastEntry.date) : null;
      
      // Calculate the gap between today and last steps date
      const dayGap = lastDate ? 
        Math.floor((new Date(today).getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)) : 
        null;

      // Reset streak only if there's no last date or gap is more than 1 day
      if (!lastDate || dayGap && dayGap > 1) {
        currentStreak = [{ date: today, used: true }];
      } else {
        currentStreak.push({ date: today, used: true });
      }

      const newCurrentStreak = currentStreak.length;
      const newHighestStreak = Math.max(newCurrentStreak, result[0].giant_steps_highest_streak || 0);

      await sql`
        UPDATE users
        SET 
          giant_steps_current_streak = ${JSON.stringify(currentStreak)}::jsonb,
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
        SET presence_current_streak = '[]'::jsonb
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
        SET giant_steps_current_streak = '[]'::jsonb
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