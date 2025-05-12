import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { initializeRevenueCat } from '@/helpers/revenueCatConfig';
import { useLotusUtils } from '@/helpers/providers/lotusUtilsContext';

export const RevenueCatInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { masterDebugMode } = useLotusUtils();

  useEffect(() => {
    const init = async () => {
      try {
        
        const success = await initializeRevenueCat();
        
        if (success) {
          setIsInitialized(true);
        } else {
          setError('Failed to initialize payments system');
        }
      } catch (err) {
        console.error('[RevenueCat] Critical initialization error:', err);
        setError(err instanceof Error ? err.message : 'Unknown payment system error');
      }
    };

    init();
  }, []);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text  allowFontScaling={false} style={{ color: 'red', fontSize: 16 }}>⚠️ Payment System Error</Text>
        <Text  allowFontScaling={false} style={{ marginTop: 10 }}>{error}</Text>
      </View>
    );
  }

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text   allowFontScaling={false} style={{ marginTop: 10 }}>Initializing payment system...</Text>
      </View>
    );
  }

  return <>{children}</>;
};
