# FlatList Section Rendering Guide

This guide explains the implementation patterns used in the Library screen (`lib.tsx`) for rendering different sections using FlatList and managing UI visibility.

## Section Data Structure

The screen uses a typed section structure to organize different content blocks:

```typescript
interface Section {
  id: string;
  type: 'header' | 'menu' | 'articles' | 'observer';
  data?: LotusArticle[];
}
```

Sections are defined in an array:

```typescript
const sections: Section[] = [
  { id: 'header', type: 'header' },
  { id: 'menu', type: 'menu' },
  { id: 'articles', type: 'articles', data: mostRecentUserArticles },
  { id: 'observer', type: 'observer' }
];
```

## FlatList Implementation

### Basic Structure

```typescript
<FlatList
  data={sections}
  renderItem={({ item }: { item: Section }) => {
    switch (item.type) {
      // ... section rendering logic
    }
  }}
  keyExtractor={item => item.id}
  showsVerticalScrollIndicator={false}
  onViewableItemsChanged={onViewableItemsChanged}
  viewabilityConfig={viewabilityConfig}
/>
```

### Viewability Configuration

The FlatList uses viewability configuration to control UI elements based on scroll position:

```typescript
const viewabilityConfig = {
  itemVisiblePercentThreshold: 50,
  minimumViewTime: 100
};

const onViewableItemsChanged = useCallback(({ viewableItems }) => {
  const lastItemVisible = viewableItems.some(
    (item) => item.index === sections.length - 1
  );
  setIsTabBarVisible(!lastItemVisible);
}, []);
```

### Switch Statement Pattern

The switch statement pattern allows for clean separation of different section types:

```typescript
switch (item.type) {
  case 'header':
    return (
      <Animated.Text 
        entering={FadeInUp.duration(300)} 
        exiting={FadeOutDown.duration(100)} 
        style={[styles.bettertittle, {paddingTop: 30}]}
      >
        Library
      </Animated.Text>
    );
  case 'menu':
    return (
      // Menu section rendering
    );
  // ... other cases
}
```

## External State Management with Context

The FlatList can control UI elements outside its scope using context providers:

```typescript
// Define context in a separate provider
const TabBarContext = createContext({
  isVisible: true,
  setIsVisible: (value: boolean) => {},
});

// In your FlatList component
const { setIsVisible } = useTabBarContext();

const onViewableItemsChanged = useCallback(({ viewableItems }) => {
  // Control tab bar visibility based on scroll position
  const headerVisible = viewableItems.some(
    (item) => item.item.type === 'header'
  );
  setIsVisible(headerVisible);
}, []);
```

This pattern is useful for:
- Controlling tab bar visibility during scroll
- Animating headers or footers
- Managing global UI states
- Coordinating animations across components

Example with multiple UI elements:
```typescript
const onViewableItemsChanged = useCallback(({ viewableItems }) => {
  const headerVisible = viewableItems.some(item => item.item.type === 'header');
  const menuVisible = viewableItems.some(item => item.item.type === 'menu');

  // Update multiple UI elements
  setTabBarVisible(headerVisible);
  setHeaderShadow(!menuVisible);
  setFloatingButtonVisible(!headerVisible);
}, []);
```

## Animation Integration

The implementation uses React Native Reanimated for smooth transitions:

```typescript
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';

// Usage in sections
<Animated.Text 
  entering={FadeInUp.duration(300)} 
  exiting={FadeOutDown.duration(100)}
  // ... other props
>
```

## Key Implementation Points

1. **Type Safety**: Using TypeScript interfaces for section data structure
2. **Modular Rendering**: Switch statement pattern for different section types
3. **Dynamic UI**: Viewability configuration for responsive UI updates
4. **Smooth Animations**: Integration with Reanimated for transitions
5. **Performance**: FlatList for efficient list rendering

## Best Practices

1. Define clear section types and interfaces
2. Use switch statements for organized section rendering
3. Implement viewability callbacks for UI updates
4. Add animations for smooth transitions
5. Keep section rendering logic modular and reusable

## Example Usage

To implement this pattern in a new screen:

1. Define your section interface
2. Create your sections array
3. Implement the FlatList with switch-based rendering
4. Add viewability configuration if needed
5. Integrate animations as required

This pattern is particularly useful for:
- Screens with multiple distinct sections
- Dynamic content loading
- Scroll-based UI updates
- Animated transitions between sections