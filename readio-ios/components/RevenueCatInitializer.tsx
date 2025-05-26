import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useLotusUtils } from '@/helpers/providers/lotusUtilsContext';
import Constants from 'expo-constants';
import { useLotusEnv } from '@/helpers/providers/LotusEnvHandler';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { colors } from '@/constants/tokens';

export const RevenueCatInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const { masterDebugMode } = useLotusUtils();
  const { getEnv, isLoading: envIsLoading } = useLotusEnv();

  useEffect(() => {
    const initializeRevenueCat = async () => {
      try {
        // Wait for environment variables to be loaded
        if (envIsLoading) {
          return;
        }

        const apiKey = getEnv('EXPO_PUBLIC_REVENUECAT_API_KEY_APPLE');
        if (!apiKey) {
          console.warn('No RevenueCat API key found. Check environment variables.');
          setError('RevenueCat API key not found');
          return;
        }

        // console.log('Initializing RevenueCat with API key (length):', apiKey.length);
        await Purchases.configure({ apiKey });
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);
        setIsInitialized(true);
      } catch (error) {
        console.error('[RevenueCat] Initialization error:', error);
        setError('Failed to initialize RevenueCat');
      }
    };

    initializeRevenueCat();
  }, [envIsLoading, getEnv]);

  if (envIsLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.readioBrown }}>
        <ActivityIndicator size="large" color={colors.readioGold} />
        <Text allowFontScaling={false} style={{ marginTop: 10, color: colors.readioWhite, fontFamily: 'MonteserratReg' }}>
          Loading subscription...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: colors.readioBrown }}>
        <Text allowFontScaling={false} style={{ color: '#FF3B30', fontSize: 16, textAlign: 'center', fontFamily: 'MonteserratReg' }}>
          {error}
        </Text>
      </View>
    );
  }

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text allowFontScaling={false} style={{ marginTop: 10, color: colors.text, fontFamily: 'MonteserratReg' }}>
          Initializing payment system...
        </Text>
      </View>
    );
  }

  return <>{children}</>;
};
