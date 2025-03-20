import React, { useState, useEffect } from 'react';
import { View, Text, Animated } from 'react-native';
import { colors, readioBoldFont, readioRegularFont } from '@/constants/tokens';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LotusStepsContainer } from './LotusStepsContainer';

interface LotusStepCounterProps {
  currentStepCount: number;
  updateInterval?: number;
}

export const LotusStepCounter: React.FC<LotusStepCounterProps> = ({
  currentStepCount,
  updateInterval = 25
}) => {
  const [displayedSteps, setDisplayedSteps] = useState(0);
  const [opacity] = useState(new Animated.Value(1));
  const [iconScale] = useState(new Animated.Value(1));

  useEffect(() => {
    const milestone = Math.floor(currentStepCount / updateInterval) * updateInterval;

    if (currentStepCount >= milestone && displayedSteps !== milestone) {
      setDisplayedSteps(milestone);
      // Animate icon
      Animated.sequence([
        Animated.timing(iconScale, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(iconScale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [currentStepCount, updateInterval]);

  // return `${displayedSteps} steps and counting`;

  const getMessage = () => {
    return "Keep walking! \n Almost at 25 steps...";
  };

  {/* <Animated.View style={{ transform: [{ scale: iconScale }] }}>
    <MaterialCommunityIcons 
      name="shoe-print" 
      size={40} 
      color={colors.readioWhite} 
    />
  </Animated.View> */}
  return (
    <>
    <LotusStepsContainer>
        {currentStepCount < 25 && (
          <>
            <View style={{ paddingHorizontal: 16.18, }}>

              <Animated.Text
                allowFontScaling={false}
                style={{
                  color: colors.readioWhite,
                  fontFamily: readioBoldFont,
                  opacity: opacity,
                  textAlign: 'center',
                  lineHeight: 20,
                }}
              >
                {getMessage()}
              </Animated.Text>
            </View>
          </>
        )}

        {currentStepCount >= 25 && (
          <>
            <View style={{ display: 'flex', flexDirection: 'row', gap: 6.18 }}>
              <Animated.Text
                allowFontScaling={false}
                style={{
                  color: colors.readioWhite,
                  fontFamily: readioBoldFont,
                  fontSize: 40,
                  opacity: opacity,
                  textAlign: 'center',
                }}
              >
                {displayedSteps}
              </Animated.Text>
              <Animated.View style={{ transform: [{ scale: iconScale }] }}>
                <MaterialCommunityIcons
                  name="shoe-print"
                  size={40}
                  color={colors.readioWhite}
                />
              </Animated.View>
            </View>

            <View style={{ paddingHorizontal: 16.18,}}>
              <Text allowFontScaling={false} style={{ textAlign: 'center', color: colors.readioWhite, fontFamily: readioRegularFont }}>Steps and counting!</Text>
            </View>
          </>

        )}
    </LotusStepsContainer>
    </>
  );
};