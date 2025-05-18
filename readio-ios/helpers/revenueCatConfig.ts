import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import Constants from 'expo-constants';

type Environment = 'development' | 'production';

export const initializeRevenueCat = async () => {
  const rcApiKey = getApiKeyForEnvironment();

  try {
    Purchases.configure({ apiKey: rcApiKey });
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    // console.log('[RevenueCat] Initialized successfully');
    return true;
  } catch (error) {
    console.error('[RevenueCat] Initialization failed:', error);
    return false;
  }
};

const getApiKeyForEnvironment = (): string => {

  const {
    REVENUECAT_API_KEY_APPLE
  } = Constants?.expoConfig?.extra || {};


  //   const extra = Constants.expoConfig?.extra || {};
  //   // Validate environment variables
  //   if (!extra?.REVENUECAT_API_KEY_APPLE_1 || !extra?.REVENUECAT_API_KEY_APPLE_2) {
  //     throw new Error('Missing RevenueCat API keys in environment config');
  //   }
  // const rcKeyParts = [
  //   extra.REVENUECAT_API_KEY_APPLE_1,
  //   extra.REVENUECAT_API_KEY_APPLE_2,
  // ];
  // const reconstructKey = (parts: string[]) => parts.join("");

  const apiKey = REVENUECAT_API_KEY_APPLE;

  // console.log(apiKey);

  return apiKey;
};

// Utility function to safely access Purchases
export const getPurchasesInstance = () => {
  if (!Purchases.isConfigured) {
    throw new Error('RevenueCat not initialized - call initializeRevenueCat first');
  }
  return Purchases;
};
