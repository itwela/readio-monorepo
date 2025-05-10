import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { colors, readioRegularFont } from '@/constants/tokens';
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";
import Purchases, { CustomerInfo, PurchasesError, PurchasesPackage } from "react-native-purchases";
import { useLotusUser } from '@/helpers/providers/lotusUserContext';
import sql from "@/helpers/neonClient"; // Import the SQL helper

interface PremiumBadgeProps {
  duration?: number;
  subTier?: string;
}

interface RichPaywallResult {
  paywallResult: PAYWALL_RESULT;
  customerInfo?: CustomerInfo; // Optional, as it might not always be present
  productIdentifier?: string;  // Optional
  errorString?: string;        // Optional, for error cases
}

export const PremiumBadge: React.FC<PremiumBadgeProps> = ({ duration = 300, subTier }) => {

  const { user, packages, setNeedsToRefresh, subscribeToLotus, userIsSubscribed } = useLotusUser()

  const displayedText = subTier === 'starter' ? 'STARTER' :
    subTier === 'premium' ? 'PREMIUM' :
      subTier === 'admin' ? 'ADMIN' :
        subTier === 'blank' ? 'SUBSCRIBE' :
          subTier === 'upgrade' ? 'UPGRADE' :
            'PREMIUM';

  return (
    <Pressable onPress={ () => {userIsSubscribed ? console.log('conditionToRunSubFunction is true') : subTier === 'upgrade' ? subscribeToLotus() : subscribeToLotus()}  }>
    <Animated.View
      entering={FadeInUp.duration(duration)}
      exiting={FadeOutDown.duration(100)}
      style={styles.premiumBadge}
      
    >
      <Text style={styles.premiumText}>{displayedText}</Text>
    </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  premiumBadge: {
    backgroundColor: colors.readioOrange,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    height: 25,
  },
  premiumText: {
    color: colors.readioWhite,
    fontSize: 12,
    fontFamily: readioRegularFont,
  },
});