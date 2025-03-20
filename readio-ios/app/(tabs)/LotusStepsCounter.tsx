import React, { useState, useEffect } from 'react';
import { Text, Animated } from 'react-native';
import { colors, readioBoldFont } from '@/constants/tokens';

interface LotusStepCounterProps {
  currentStepCount: number;
  updateInterval?: number;
  visibilityRange?: number;
}

export const LotusStepCounter: React.FC<LotusStepCounterProps> = ({ 
  currentStepCount, 
  updateInterval = 25,
  visibilityRange = 5 // Show for 5 steps after each interval
}) => {
  const [displayedSteps, setDisplayedSteps] = useState(0);
  const [opacity] = useState(new Animated.Value(0));

  useEffect(() => {
    const roundedSteps = Math.floor(currentStepCount / updateInterval) * updateInterval;
    const stepsAfterInterval = currentStepCount - roundedSteps;

    if (stepsAfterInterval <= visibilityRange && currentStepCount > displayedSteps) {
      setDisplayedSteps(roundedSteps);
      // Fade in
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(1000),
        // Fade out
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [currentStepCount, updateInterval, visibilityRange]);

  return (
    <Animated.Text 
      allowFontScaling={false} 
      style={{ 
        color: colors.readioWhite, 
        fontSize: 60, 
        fontFamily: readioBoldFont,
        opacity: opacity
      }}
    >
      {displayedSteps}
    </Animated.Text>
  );
};