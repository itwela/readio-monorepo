import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { ThemedText } from './ThemedText'; // Assuming ThemedText handles font and color
import { giantFont, colors, readioBoldFont, readioRegularFont } from '@/constants/tokens'; // Adjust path if needed
import { Text } from 'react-native';
import LotusGap from './LotusGap';

interface LotusHomeChangingContentProps {
  /** Array of strings to display */
  textArray: string[];
  headlineArray?: string[];
  /** Duration in seconds to display each text item */
  durationSeconds: number;
  /** Optional style for the text component */
  textStyle?: object;
  headlineStyle?: object,
  /** Optional style for the container view */
  containerStyle?: object;
}

const LotusHomeChangingContent: React.FC<LotusHomeChangingContentProps> = ({
  textArray,
  headlineArray,
  durationSeconds,
  textStyle = {},
  headlineStyle = {},
  containerStyle = {},
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!textArray || textArray.length === 0 || durationSeconds <= 0) {
      return; // No text or invalid duration
    }

    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % textArray.length);
    }, durationSeconds * 1000); // Convert seconds to milliseconds

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, [textArray, durationSeconds]);

  if (!textArray || textArray.length === 0) {
    return null; // Render nothing if no text is provided
  }

  const currentText = textArray[currentIndex];
  const currentHeadline = headlineArray ? headlineArray[currentIndex] : undefined;

  return (
      <Animated.View
        key={currentIndex} // Key prop is crucial for triggering animation on change
        entering={FadeIn.duration(500)} // Adjust duration as needed
        exiting={FadeOut.duration(500)} // Adjust duration as needed
        style={[styles.container, containerStyle]}
      >
        <LotusGap backgroundColor='transparent' gapNumber={20}/>
        {headlineArray && (   
        <>
        <Text style={[styles.headline, headlineStyle]}>
          {currentHeadline}
        </Text>
        </>   
        )}
        <Text style={[styles.text, textStyle]}>
          {currentText}
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
