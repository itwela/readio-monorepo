import React from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { colors, readioRegularFont } from '@/constants/tokens';

interface PremiumBadgeProps {
  duration?: number;
  subTier?: string;
}

export const PremiumBadge: React.FC<PremiumBadgeProps> = ({ duration = 300, subTier }) => {
  
  const displayedText = subTier === 'starter' ? 'STARTER' : 
                        subTier === 'premium' ? 'PREMIUM' : 
                        subTier === 'admin' ? 'ADMIN' :
                        'PREMIUM';

  return (
    <Animated.View
      entering={FadeInUp.duration(duration)}
      exiting={FadeOutDown.duration(100)}
      style={styles.premiumBadge}
    >
      <Text style={styles.premiumText}>{displayedText}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  premiumBadge: {
    backgroundColor: colors.readioOrange,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 40,
  },
  premiumText: {
    color: colors.readioWhite,
    fontSize: 12,
    fontFamily: readioRegularFont,
  },
});