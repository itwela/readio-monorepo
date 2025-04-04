import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { colors, readioRegularFont } from '@/constants/tokens';
import { Ionicons } from '@expo/vector-icons';
import { RelativePathString, router } from 'expo-router';
import { PremiumBadge } from './LotusPremiumBadge';

interface LotusMenuOptionProps {
  title: string;
  route?: string;
  onPress?: () => void;
  duration?: number;
  premium?: boolean;
}

export const LotusMenuOption: React.FC<LotusMenuOptionProps> = ({
  title,
  route,
  onPress,
  duration = 300,
  premium = false,
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
      <View style={styles.titleContainer}>
        <Animated.Text
          entering={FadeInUp.duration(duration)}
          exiting={FadeOutDown.duration(100)}
          allowFontScaling={false}
          style={styles.option}
        >
          {title}
        </Animated.Text>
        {premium && <PremiumBadge duration={duration} />}
      </View>
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  option: {
    fontSize: 20,
    color: colors.readioWhite,
    fontFamily: readioRegularFont,
  },

});