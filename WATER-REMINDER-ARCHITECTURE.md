# Water Reminder Architecture

The water reminder system in Lotus follows a modern, maintainable architecture pattern that emphasizes separation of concerns and single responsibility. This document outlines the key components and their interactions.

## Core Components

### LotusSettingsProvider

The central state management component that handles:
- User preferences for water reminders
- Daily water intake goals
- Reminder frequency settings
- Persistent storage of settings

```typescript
interface Settings {
  waterReminderEnabled: boolean
  waterDailyGoal: number      // in ounces
  waterReminderFrequency: number  // in hours
}
```

### LotusNotificationProvider

A dedicated service for managing all notification-related functionality:
- Permission handling
- Scheduling notifications
- Custom sound support
- Platform-specific adaptations

## Key Features

### Persistent Storage
- Settings are automatically saved to AsyncStorage
- Settings are restored on app launch
- Consistent state management across app restarts

### Smart Scheduling
- Notifications are scheduled based on user preferences
- Automatic rescheduling when settings change
- Intelligent handling of permission states

### Error Handling
- Graceful error recovery
- User-friendly error messages
- Automatic retry mechanisms

## Data Flow

1. User modifies settings through UI
2. LotusSettingsProvider updates internal state
3. Settings are persisted to AsyncStorage
4. LotusNotificationProvider is triggered to update schedules
5. New notification schedule is created

## Benefits

- **Single Source of Truth**: All water reminder settings are managed in one place
- **Separation of Concerns**: Clear distinction between settings and notifications
- **Type Safety**: Full TypeScript support for better reliability
- **Testability**: Isolated components are easier to test
- **Maintainability**: Clear architecture makes future updates simpler

## Usage Example

```typescript
// In a component
const { 
  waterReminderEnabled,
  waterDailyGoal,
  setWaterReminderEnabled 
} = useLotusSettings()

// Toggle reminders
await setWaterReminderEnabled(!waterReminderEnabled)
```

## Future Considerations

- Integration with health tracking systems
- Advanced scheduling patterns
- Analytics and insights
- Multi-device sync support