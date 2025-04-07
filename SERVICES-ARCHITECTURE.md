# Understanding Classes in Modern JavaScript/TypeScript

This guide explains how classes work in modern JavaScript/TypeScript, using our Goals Notification Service as a practical example.

## Basic Class Concepts

### Interfaces

Interfaces define a contract that classes must follow. In our codebase, we have:

```typescript
export interface GoalsNotificationService {
  schedule: (goal: Goal) => Promise<void>;
  cancel: (goalId: string) => Promise<void>;
  updateSchedule: (goal: Goal) => Promise<void>;
  requestPermissions: () => Promise<boolean>;
}
```

This interface ensures any class implementing it must provide these methods.

### Class Implementation

Classes in JavaScript/TypeScript are similar to other languages like C# or Java. Here's how our service implements the interface:

```typescript
export class ExpoGoalsNotificationService implements GoalsNotificationService {
  // Class methods here
}
```

### Access Modifiers

TypeScript supports access modifiers like `private` and `public`:

- `private`: Only accessible within the class

  ```typescript
  private getNotificationIdentifier(goalId: string): string {
    return `goal_notification_${goalId}`;
  }
  ```
- `public`: Accessible from anywhere (default)

  ```typescript
  async schedule(goal: Goal): Promise<void> {
    // Implementation
  }
  ```

### Async Methods

Modern JavaScript classes support async/await for handling asynchronous operations:

```typescript
async schedule(goal: Goal): Promise<void> {
  const hasPermission = await this.ensurePermissions();
  if (!hasPermission) return;
  // More async operations...
}
```

### Method Types

1. **Instance Methods**: Regular methods that access instance data

   ```typescript
   private getNotificationBody(goal: Goal): string {
     const progressPercentage = Math.round((goal.currentValue / goal.targetValue) * 100);
     // Implementation
   }
   ```
2. **Helper Methods**: Private methods that support public functionality

   ```typescript
   private async ensurePermissions(): Promise<boolean> {
     const { status } = await Notifications.getPermissionsAsync();
     // Implementation
   }
   ```

## Best Practices

1. **Interface-First Design**: Define interfaces before implementation to ensure consistent contracts
2. **Private Helpers**: Use private methods for internal logic
3. **Single Responsibility**: Each class should handle one main responsibility
4. **Async Operations**: Use async/await for cleaner asynchronous code
5. **Type Safety**: Leverage TypeScript's type system for better reliability

## Key Differences from C/C++

1. [ ] No header files needed - everything is in one file
2. [ ] No memory management required - JavaScript handles this
3. [ ] No multiple inheritance - use interfaces instead
4. [ ] Dynamic typing (though TypeScript adds static typing)
5. [ ] Prototype-based inheritance under the hood

This implementation shows how modern JavaScript/TypeScript can use object-oriented principles effectively while maintaining the language's flexibility and ease of use.
