# Reliable State Management and Data Update Patterns

## Core Utility: setStateAsync

### The Foundation
The `setStateAsync` utility function serves as the cornerstone for reliable state updates:

```typescript
export const setStateAsync = (setter: Function, value: any, type: 'affectsSomethingVisual' | 'backendData' = 'backendData') => {
    return new Promise(resolve => {
      if (type === 'affectsSomethingVisual') {
        // Run three times for layout updates
        setter(value);
        setter(value);
        setter(value);
      } else {
        // Run once for data updates
        setter(value);
      }
      resolve(true);
    });
};
```

Key Features:
- Returns a Promise for async operation handling
- Differentiates between visual and data updates
- Ensures reliable layout updates by applying changes multiple times

## Implementation Patterns

### 1. Backend Data Updates (LotusUserContext)

Pattern for handling user authentication and data synchronization:

```typescript
const checkSignInStatus = async () => {
  try {
    const savedHash = await tokenCache.getToken('lotusJWTAlwaysGrowingToken');
    await setStateAsync(setIsSignedInLotus, Boolean(savedHash), 'backendData');
    
    if (savedHash) {
      const userInfo = await sql`SELECT * FROM users WHERE jwt = ${savedHash}`;
      if (userInfo && userInfo[0]) {  
        await setStateAsync(setUser, userInfo[0], 'backendData');
        await setStateAsync(setHasAccount, true, 'backendData');
      } else {
        await setStateAsync(setHasAccount, false, 'backendData');
        await setStateAsync(setUser, null, 'backendData');
      }
    }
  } catch (error) {
    // Error handling with state updates
    await setStateAsync(setIsSignedIn, false, 'backendData');
  }
};
```

Key Principles:
- Sequential async operations
- Consistent error handling
- State updates after data fetching

### 2. Visual State Management (LotusHeader)

Pattern for managing dynamic visual transitions:

```typescript
const handleDynamicStyleValues = async () => {
  if (isArticleGenerating === true) {
    setStepKey(20);
    await setStateAsync(setCurrentHeaderText, "Your article is on the way!", 'affectsSomethingVisual');
    await setStateAsync(setCurrentVideoUri, brownGradientVideo, 'affectsSomethingVisual');
    await setStateAsync(setCurrentOpacityValue_Video, 1, 'affectsSomethingVisual');
  }
};
```

Key Principles:
- Visual state changes marked with 'affectsSomethingVisual'
- Sequential animation and style updates
- State-driven UI transitions

### 3. Modal State Management (LotusStudyModal)

Pattern for handling modal interactions:

```typescript
const handleStartStudyArticleGeneration = async() => {
    await setStateAsync(setWantsToMakeAStudyArticle, true, 'backendData');
    await setStateAsync(setIsStudyModalVisible, false, 'backendData');
    await setStateAsync(setForm, { query: '' }, 'backendData');
};
```

Key Principles:
- Atomic state updates
- Clear separation of concerns
- Predictable modal behavior

## Best Practices

1. **State Update Types**
   - Use 'backendData' for data-only updates
   - Use 'affectsSomethingVisual' for UI-related changes

2. **Error Handling**
   - Always include try-catch blocks
   - Update error states using setStateAsync
   - Maintain consistent state in error scenarios

3. **Component Integration**
   - Use useEffect for side effects
   - Handle cleanup in useEffect returns
   - Manage dependencies array carefully

4. **Performance Optimization**
   - Batch related state updates
   - Use appropriate update type
   - Implement proper cleanup

## Common Patterns

### Data Refresh Pattern
```typescript
const refreshUserData = async () => {
  try {
    const savedHash = await tokenCache.getToken('lotusJWTAlwaysGrowingToken');
    if (savedHash && user) {
      const articles = await sql`SELECT * FROM readios WHERE clerk_id = ${user.clerk_id}`;
      await setStateAsync(setUserArticles, articles, 'backendData');
      await setStateAsync(setUserArticleCount, articles.length, 'backendData');
    }
  } catch (error) {
    console.error('Error refreshing user data:', error);
  }
};
```

### Visual Update Pattern
```typescript
const updateVisualState = async () => {
  await setStateAsync(setCurrentOpacityValue_Video, 1, 'affectsSomethingVisual');
  await setStateAsync(setCurrentBackgroundColorValue_BorderBottom, '#DB581A', 'affectsSomethingVisual');
  await setStateAsync(setCurrentHeightValue_BorderBottom, 5, 'affectsSomethingVisual');
};
```

## Conclusion

This state management pattern provides:
- Reliable state updates for both data and UI
- Clear separation between visual and data updates
- Consistent error handling
- Predictable component behavior
- Scalable state management solution

By following these patterns and principles, you can maintain a robust and reliable state management system in your React Native applications.