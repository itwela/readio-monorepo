import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { colors, readioRegularFont } from '@/constants/tokens';
import { Ionicons } from '@expo/vector-icons';
import { RelativePathString, router } from 'expo-router';

interface LotusMenuOptionProps {
  title: string;
  route?: string;
  onPress?: () => void;
  duration?: number;
}

export const LotusMenuOption: React.FC<LotusMenuOptionProps> = ({
  title,
  route,
  onPress,
  duration = 300,
}) => {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (route) {
      router.push(route as RelativePathString);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      <Animated.Text
        entering={FadeInUp.duration(duration)}
        exiting={FadeOutDown.duration(100)}
        allowFontScaling={false}
        style={styles.option}
      >
        {title}
      </Animated.Text>
      <Animated.View
        entering={FadeInUp.duration(duration)}
        exiting={FadeOutDown.duration(100)}
      >
        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.readioWhite}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  option: {
    fontSize: 20,
    color: colors.readioWhite,
    fontFamily: readioRegularFont,
  },
});