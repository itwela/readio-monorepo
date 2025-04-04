Here's a task list for implementing the water reminder feature:

```markdown:/Users/itwelaibomu/Documents/Projects/Lotus/readio-ios/docs/WATER_REMINDER_IMPLEMENTATION.md
# Water Reminder Feature Implementation

## 1. Database Setup
- [ ] Create `user_goals` table
  ```sql
  CREATE TABLE user_goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    type VARCHAR(50),
    current_value INTEGER,
    target_value INTEGER,
    reminder_frequency INTEGER,
    is_enabled BOOLEAN DEFAULT true,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  ```
- [ ] Create index on user_id for better query performance
- [ ] Add water_intake_history table for tracking
  ```sql
  CREATE TABLE water_intake_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    amount INTEGER,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  ```

## 2. Context/Provider Setup
- [ ] Install required packages
  ```bash
  npx expo install expo-notifications expo-task-manager @react-native-async-storage/async-storage
  ```
- [ ] Create LotusGoalsContext
- [ ] Implement basic CRUD operations in context
- [ ] Add notification handling methods
- [ ] Add the provider to App.tsx

## 3. Notification Setup
- [ ] Configure notification permissions
- [ ] Set up background tasks for notifications
- [ ] Create notification templates
- [ ] Implement notification scheduling logic
- [ ] Add notification response handling

## 4. UI Components
- [ ] Complete WaterReminderCard component
  - [ ] Progress visualization
  - [ ] Goal setting interface
  - [ ] Reminder frequency selector
  - [ ] Enable/disable toggle
- [ ] Add animation for progress updates
- [ ] Implement quick-add buttons
- [ ] Add history view

## 5. Data Management
- [ ] Implement local storage caching
- [ ] Add sync mechanism with backend
- [ ] Create data validation
- [ ] Add error handling
- [ ] Implement offline support

## 6. Testing
- [ ] Unit tests for context
- [ ] Integration tests for notifications
- [ ] UI component tests
- [ ] End-to-end testing
- [ ] Test offline functionality

## 7. Polish & Optimization
- [ ] Add loading states
- [ ] Implement error states
- [ ] Add success feedback
- [ ] Optimize performance
- [ ] Add analytics tracking

## 8. Documentation
- [ ] Document setup process
- [ ] Add usage examples
- [ ] Document notification handling
- [ ] Add troubleshooting guide

## Nice to Have
- [ ] Add different measurement units (oz/ml)
- [ ] Add custom reminder sounds
- [ ] Implement smart reminders based on user activity
- [ ] Add weekly/monthly reports
- [ ] Add sharing capabilities

## Notes
- Ensure all SQL queries are properly parameterized
- Follow iOS notification guidelines
- Consider timezone handling for reminders
- Plan for scalability in database design
- Consider battery impact of background tasks
```

This task list breaks down the implementation into manageable chunks. Would you like me to elaborate on any specific section?