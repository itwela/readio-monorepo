import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { ThemedText } from './ThemedText'; // Assuming ThemedText handles font and color
import { giantFont, colors, readioBoldFont, readioRegularFont } from '@/constants/tokens'; // Adjust path if needed
import { Text } from 'react-native';
import LotusGap from './LotusGap';
import { useLotusUtils } from '@/helpers/providers/lotusUtilsContext';

interface LotusHomeChangingContentProps {
  /** Array of strings for headlines */
  headlineArray: string[];
  /** Duration in seconds to display each headline */
  durationSeconds: number;
  /** Optional style for the headline text component */
  headlineStyle?: object;
  /** Optional style for the container view */
  containerStyle?: object;
}

const LotusHomeChangingContent: React.FC<LotusHomeChangingContentProps> = ({
  headlineArray,
  durationSeconds,
  headlineStyle = {},
  containerStyle = {},
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { currentRouteName } = useLotusUtils();

  useEffect(() => {
    if (!headlineArray || headlineArray.length === 0 || durationSeconds <= 0) {
      return; // No headlines or invalid duration
    }

    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % headlineArray.length;
        // Clear and reset interval when changing to/from first headline
        if (nextIndex === 1 || prevIndex === 0) {
          clearInterval(intervalId);
          const newInterval = nextIndex === 0 ? durationSeconds * 3000 : durationSeconds * 1000;
          setInterval(() => {
            setCurrentIndex((i) => (i + 1) % headlineArray.length);
          }, newInterval);
        }
        return nextIndex;
      });
    }, currentIndex === 0 ? durationSeconds * 3000 : durationSeconds * 1000);

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, [headlineArray, durationSeconds, currentRouteName]);

  if (!headlineArray || headlineArray.length === 0) {
    return null; // Render nothing if no headlines are provided
  }

  const currentHeadline = headlineArray[currentIndex];

  return (
      <Animated.View
        key={currentIndex} // Key prop is crucial for triggering animation on change
        entering={FadeIn.duration(500)} // Adjust duration as needed
        exiting={FadeOut.duration(500)} // Adjust duration as needed
        style={[styles.container, containerStyle]}
      >
        <LotusGap backgroundColor='transparent' gapNumber={10}/>
        <Text style={[styles.headline, headlineStyle]}>
          {currentHeadline}
        </Text>
      </Animated.View>
  );
};
const styles = StyleSheet.create({
  container: {
    // Add any default container styles if needed
    paddingHorizontal: 30
  },
  headline: {
    fontSize: 25, // Example size, adjust as needed
    color: colors.readioWhite, // Use themed color
    textAlign: 'center',
    fontFamily: giantFont, // Use themed font
    // Add other default text styles
  },
  text: {
    fontSize: 18, // Example size, adjust as needed
    color: colors.readioWhite, // Use themed color
    textAlign: 'center',
    fontFamily: readioRegularFont, // Use themed font
    // Add other default text styles
  },
});

export default LotusHomeChangingContent;
