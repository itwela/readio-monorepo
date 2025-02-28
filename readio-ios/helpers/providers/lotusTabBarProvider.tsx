import React, { createContext, useContext, useState, ReactNode } from 'react';
import { LayoutChangeEvent, Dimensions, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

interface LotusTabBarContextType {
  isTabBarVisible: boolean;
  setIsTabBarVisible: (value: boolean) => void;
  handleScroll: (scrollPosition: number) => void;
  handleIntersection: (y: number, position: 'top' | 'bottom') => boolean;
  scrollDirection: 'up' | 'down';
}

const LotusTabBarContext = createContext<LotusTabBarContextType | null>(null);

export const LotusTabBarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isTabBarVisible, setIsTabBarVisible] = useState<boolean>(true);
  const [lastScrollPosition, setLastScrollPosition] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
  const [hidePosition, setHidePosition] = useState<number | null>(null);

  const handleScroll = (scrollPosition: number) => {
    console.log('\n=== Scroll Event ===');
    console.log('Current scroll position:', scrollPosition);
    console.log('Last scroll position:', lastScrollPosition);

    const direction = scrollPosition > lastScrollPosition ? 'down' : 'up';
    setScrollDirection(direction);
    console.log('\n=== Direction Calculation ===');
    console.log('Determined scroll direction:', direction);

    // When scrolling down, hide the toolbar after a small threshold
    if (direction === 'down' && isTabBarVisible && scrollPosition > 50) {
      console.log('\n=== Toolbar Hide Logic ===');
      console.log('Hiding toolbar - Conditions met:');
      console.log('- Direction is down');
      console.log('- Toolbar is currently visible');
      console.log('- Scroll position > 50 (Current:', scrollPosition, ')');
      setIsTabBarVisible(false);
    }

    // When scrolling up, show the toolbar immediately
    if (direction === 'up' && !isTabBarVisible) {
      console.log('\n=== Toolbar Show Logic ===');
      console.log('Showing toolbar - Conditions met:');
      console.log('- Direction is up');
      console.log('- Toolbar is currently hidden');
      setIsTabBarVisible(true);
    }

    setLastScrollPosition(scrollPosition);
    console.log('\n=== Final State ===');
    console.log('Updated last scroll position to:', scrollPosition);
  };
  
  const handleIntersection = (y: number, position: 'top' | 'bottom') => {
    console.log('\n=== Intersection Check ===');
    console.log('Y position:', y);
    console.log('Checking position:', position);

    const threshold = position === 'bottom' ? 
      Dimensions.get('window').height - 85 : 
      85;
    
    console.log('Calculated threshold:', threshold);
    
    const result = position === 'bottom' ? y >= threshold : y <= threshold;
    console.log('Intersection result:', result);
    
    return result;
  };

  return (
    <LotusTabBarContext.Provider value={{
      isTabBarVisible,
      setIsTabBarVisible,
      handleScroll,
      handleIntersection,
      scrollDirection,
    }}>
      {children}
    </LotusTabBarContext.Provider>
  );
};

export const useLotusTabBar = () => {
  const context = useContext(LotusTabBarContext);
  if (!context) throw new Error('useLotusTabBar must be used within a LotusTabBarProvider');
  return context;
};