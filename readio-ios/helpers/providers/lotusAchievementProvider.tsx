import React, { createContext, useContext, useState, ReactNode } from 'react';
import sql from '@/helpers/neonClient';
import { useLotusUser } from '@/helpers/providers/lotusUserContext';

interface Achievement {
  id: string;
  earned_at: string;
  notified: boolean;
}

interface LotusAchievementContextType {
  achievements: Achievement[];
  checkAchievements: () => Promise<void>;
  hasAchievement: (achievementId: string) => boolean;
  getAchievementProgress: (achievementId: string) => Promise<number>;
}

const LotusAchievementContext = createContext<LotusAchievementContextType | null>(null);

export const LotusAchievementProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const { user } = useLotusUser();

  // Check if user has a specific achievement
  const hasAchievement = (achievementId: string): boolean => {
    return achievements.some(achievement => achievement.id === achievementId);
  };

  // Award a new achievement to the user
  const awardAchievement = async (achievementId: string) => {
    if (!user?.id || hasAchievement(achievementId)) return;

    const newAchievement: Achievement = {
      id: achievementId,
      earned_at: new Date().toISOString(),
      notified: false
    };

    try {
      // Update database with new achievement
      await sql`
        UPDATE users
        SET achievements = COALESCE(achievements, '[]'::jsonb) || ${JSON.stringify([newAchievement])}::jsonb
        WHERE id = ${user.id}
      `;

      // Update local state
      setAchievements([...achievements, newAchievement]);

      // Show achievement notification
      // TODO: Implement notification system
    } catch (error) {
      console.error('Error awarding achievement:', error);
    }
  };

  // Get progress towards an achievement
  const getAchievementProgress = async (achievementId: string): Promise<number> => {
    if (!user?.id) return 0;

    try {
      switch (achievementId) {
        case 'mindful_beginner':
          const presenceResult = await sql`
            SELECT presence_stats FROM users WHERE id = ${user.id}
          `;
          return presenceResult[0]?.presence_stats?.length || 0;

        case 'presence_streak_master':
          const streakResult = await sql`
            SELECT presence_current_streak FROM users WHERE id = ${user.id}
          `;
          return streakResult[0]?.presence_current_streak?.length || 0;

        case 'meditation_champion':
          const highestStreakResult = await sql`
            SELECT presence_highest_streak FROM users WHERE id = ${user.id}
          `;
          return highestStreakResult[0]?.presence_highest_streak || 0;

        case 'first_steps':
          const giantStepsResult = await sql`
            SELECT giant_steps_stats FROM users WHERE id = ${user.id}
          `;
          return giantStepsResult[0]?.giant_steps_stats?.length || 0;

        case 'walking_warrior':
          const walkingStreakResult = await sql`
            SELECT giant_steps_current_streak FROM users WHERE id = ${user.id}
          `;
          return walkingStreakResult[0]?.giant_steps_current_streak || 0;

        case 'step_master':
          const totalStepsResult = await sql`
            SELECT giant_steps_stats FROM users WHERE id = ${user.id}
          `;
          const totalSteps = totalStepsResult[0]?.giant_steps_stats?.reduce((acc: any, stat: any) => acc + (stat.steps || 0), 0) || 0;
          return totalSteps;

        case 'double_discipline':
          const streaksResult = await sql`
            SELECT presence_current_streak, giant_steps_current_streak FROM users WHERE id = ${user.id}
          `;
          const presenceStreak = streaksResult[0]?.presence_current_streak || 0;
          const walkStreak = streaksResult[0]?.giant_steps_current_streak || 0;
          return Math.min(presenceStreak, walkStreak);

        case 'wellness_explorer':
          const sessionsResult = await sql`
            SELECT presence_stats, giant_steps_stats FROM users WHERE id = ${user.id}
          `;
          const totalSessions = (sessionsResult[0]?.presence_stats?.length || 0) + 
                              (sessionsResult[0]?.giant_steps_stats?.length || 0);
          return totalSessions;

        case 'consistency_king':
          const highestStreaksResult = await sql`
            SELECT presence_highest_streak, giant_steps_highest_streak FROM users WHERE id = ${user.id}
          `;
          const presenceHighest = highestStreaksResult[0]?.presence_highest_streak || 0;
          const walkHighest = highestStreaksResult[0]?.giant_steps_highest_streak || 0;
          return Math.min(presenceHighest, walkHighest);

        case 'balance_master':
          const weeklyStatsResult = await sql`
            SELECT presence_stats, giant_steps_stats FROM users WHERE id = ${user.id}
            WHERE created_at >= NOW() - INTERVAL '7 days'
          `;
          const weeklyPresence = weeklyStatsResult[0]?.presence_stats?.length || 0;
          const weeklyWalks = weeklyStatsResult[0]?.giant_steps_stats?.length || 0;
          return weeklyPresence === weeklyWalks ? weeklyPresence : 0;

        default:
          return 0;
      }
    } catch (error) {
      console.error('Error getting achievement progress:', error);
      return 0;
    }
  };

  // Check for new achievements
  const checkAchievements = async () => {
    if (!user?.id) return;

    try {
      // Mindful Beginner - Complete first meditation
      const presenceProgress = await getAchievementProgress('mindful_beginner');
      if (presenceProgress > 0) {
        await awardAchievement('mindful_beginner');
      }

      // Presence Streak Master - 7-day streak
      const streakProgress = await getAchievementProgress('presence_streak_master');
      if (streakProgress >= 7) {
        await awardAchievement('presence_streak_master');
      }

      // Meditation Champion - 30-day streak
      const meditationChampionProgress = await getAchievementProgress('meditation_champion');
      if (meditationChampionProgress >= 30) {
        await awardAchievement('meditation_champion');
      }

      // First Steps - Complete first walking meditation
      const firstStepsProgress = await getAchievementProgress('first_steps');
      if (firstStepsProgress > 0) {
        await awardAchievement('first_steps');
      }

      // Walking Warrior - 5-day walking streak
      const walkingWarriorProgress = await getAchievementProgress('walking_warrior');
      if (walkingWarriorProgress >= 5) {
        await awardAchievement('walking_warrior');
      }

      // Step Master - 100,000 total steps
      const stepMasterProgress = await getAchievementProgress('step_master');
      if (stepMasterProgress >= 100000) {
        await awardAchievement('step_master');
      }

      // Double Discipline - 3-day streak in both
      const doubleDisciplineProgress = await getAchievementProgress('double_discipline');
      if (doubleDisciplineProgress >= 3) {
        await awardAchievement('double_discipline');
      }

      // Wellness Explorer - 50 combined sessions
      const wellnessExplorerProgress = await getAchievementProgress('wellness_explorer');
      if (wellnessExplorerProgress >= 50) {
        await awardAchievement('wellness_explorer');
      }

      // Consistency King/Queen - 14+ days highest streak in both
      const consistencyKingProgress = await getAchievementProgress('consistency_king');
      if (consistencyKingProgress >= 14) {
        await awardAchievement('consistency_king');
      }

      // Balance Master - Equal sessions in a week
      const balanceMasterProgress = await getAchievementProgress('balance_master');
      if (balanceMasterProgress >= 3) { // Requiring at least 3 sessions of each type
        await awardAchievement('balance_master');
      }

    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  };

  return (
    <LotusAchievementContext.Provider
      value={{
        achievements,
        checkAchievements,
        hasAchievement,
        getAchievementProgress
      }}
    >
      {children}
    </LotusAchievementContext.Provider>
  );
};

// Custom hook for using the achievement context
export const useLotusAchievement = () => {
  const context = useContext(LotusAchievementContext);
  if (!context) {
    throw new Error('useLotusAchievement must be used within a LotusAchievementProvider');
  }
  return context;
};