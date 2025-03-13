# Presence Meditation Streak Tracking Guide

## Overview
This guide explains the implementation of streak tracking for the Presence Meditation feature in Lotus. The system tracks both current streaks and highest achieved streaks for users practicing meditation.

## Database Structure

### Columns
- `presence_current_streak` (JSONB)
  - Tracks daily meditation usage
  - Stores first meditation timestamp for each day
  - Used to calculate current streak

- `presence_highest_streak` (Integer)
  - Stores the user's highest achieved streak
  - Only updates when current streak exceeds previous record

## Streak Logic Implementation

### Current Streak Tracking

1. **Daily Usage Recording**
   ```json
   {
     "date": "2024-01-20",
     "used": true
   }
   ```
   - Only record first meditation session of the day
   - Additional sessions on same day don't create new entries

2. **Streak Calculation**
   - Check most recent date in `presence_current_streak`
   - Compare with current date
   - Streak continues if:
     - User meditated today
     - OR last meditation was yesterday
   - Streak breaks if gap > 1 day

### Highest Streak Management

1. **Update Conditions**
   - Compare current streak with `presence_highest_streak`
   - Update only if current streak exceeds highest
   - Never decrease highest streak

2. **Reset Conditions**
   - Current streak resets to 0 when broken
   - Highest streak remains unchanged

## Implementation Requirements

### Daily Check Logic
```typescript
interface DailyUsage {
  date: string;
  used: boolean;
}

interface CurrentStreak {
  streak: DailyUsage[];
}
```

1. **First Daily Session**
   - Check if entry exists for current date
   - If no entry, add new usage record
   - If entry exists, no action needed

2. **Streak Validation**
   - Get last meditation date
   - Calculate days between last and current date
   - Update streak count accordingly

3. **Highest Streak Update**
   - Compare current streak length with highest
   - Update if current exceeds highest

## API Integration

1. **Record Daily Usage**
   ```typescript
   async function recordMeditation() {
     // Check if already recorded today
     // If not, add new record
     // Update streak calculations
   }
   ```

2. **Get Streak Status**
   ```typescript
   async function getStreakStatus() {
     // Return current and highest streaks
     // Include last meditation date
   }
   ```

## Edge Cases

1. **Timezone Handling**
   - Use user's local timezone for date calculations
   - Ensure consistent date boundaries

2. **Data Migration**
   - Handle existing users' historical data
   - Maintain streak integrity during updates

3. **Error Recovery**
   - Handle failed API calls
   - Prevent duplicate daily entries
