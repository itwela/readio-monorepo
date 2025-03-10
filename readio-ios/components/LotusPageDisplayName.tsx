import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { colors, giantFont } from '@/constants/tokens';

interface LotusPageDisplayNameProps {
  title: string;
  paddingTop?: number;
  paddingBottom?: number;
}

export function LotusPageDisplayName({ title, paddingTop = 30, paddingBottom = 10, }: LotusPageDisplayNameProps) {
  return (
    <Animated.Text
      entering={FadeInUp.duration(300)}
      exiting={FadeOutDown.duration(100)}
      allowFontScaling={false}
      style={[styles.bettertittle, { paddingTop, paddingBottom}]}
    >
      {title}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  bettertittle: {
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: giantFont,
    color: colors.readioWhite,
    textAlign: 'center',
  },
});