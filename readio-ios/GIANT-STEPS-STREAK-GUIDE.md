# Giant Steps Streak Tracking Guide

## Overview
This guide explains the implementation of streak tracking for the Giant Steps feature in Lotus. The system tracks both current streaks and highest achieved streaks for users engaging with the step tracking feature.

## Database Structure

### Columns
- `giant_steps_current_streak` (JSONB)
  - Tracks daily step tracking usage
  - Stores first step tracking timestamp for each day
  - Used to calculate current streak

- `giant_steps_highest_streak` (Integer)
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
   - Only record first step tracking session of the day
   - Additional tracking sessions on same day don't create new entries

2. **Streak Calculation**
   - Check most recent date in `giant_steps_current_streak`
   - Compare with current date
   - Streak continues if:
     - User tracked steps today
     - OR last tracking was yesterday
   - Streak breaks if gap > 1 day

### Highest Streak Management

1. **Update Conditions**
   - Compare current streak with `giant_steps_highest_streak`
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
   - Get last tracking date
   - Calculate days between last and current date
   - Update streak count accordingly

3. **Highest Streak Update**
   - Compare current streak length with highest
   - Update if current exceeds highest

## API Integration

1. **Record Daily Usage**
   ```typescript
   async function recordStepTracking() {
     // Check if already recorded today
     // If not, add new record
     // Update streak calculations
   }
   ```

2. **Get Streak Status**
   ```typescript
   async function getStreakStatus() {
     // Return current and highest streaks
     // Include last tracking date
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

## Display Requirements

1. **User Interface**
   - Show current streak prominently
   - Display highest streak achievement
   - Indicate if step tracking needed for today

2. **Notifications**
   - Alert user about streak maintenance
   - Celebrate streak milestones
   - Remind about daily step tracking

## Testing Scenarios

1. **Streak Calculation**
   - Verify consecutive days counting
   - Test streak break conditions
   - Validate highest streak updates

2. **Date Handling**
   - Test different timezones
   - Verify date rollover handling
   - Check historical data accuracy

This guide serves as a reference for implementing the Giant Steps streak tracking system in Lotus. Follow these specifications to ensure consistent and accurate streak tracking for users.