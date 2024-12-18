import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { useCallback, useEffect, useState } from 'react';
import { LogBox, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useSetupTrackPlayer } from '@/hooks/useSetupTrackPlayer';
import { useLogTrackPlayerState } from '@/hooks/useLogTrackPlayerState';
import { ClerkProvider, ClerkLoaded } from "@clerk/clerk-expo";
import { tokenCache } from "@/lib/auth";
import { ReadioProvider } from '@/constants/readioContext';
import ConnectionErrorBanner from '@/components/ConnectionErrorBanner';
import { useFonts } from 'expo-font';
import { Video, ResizeMode } from 'expo-av';
import CustomSplashScreen from '@/components/ReadioSplashScreen';

// Prevent the splash screen from auto-hiding before asset loading is complete.
const hideSplashScreen = async () => {
  await SplashScreen.preventAutoHideAsync();
};

// Ensure the app has a valid Clerk publishable key
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;
if (!publishableKey) {
  throw new Error(
    "Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env"
  );
}

// Suppress specific logs
LogBox.ignoreLogs(["Clerk:"]);
LogBox.ignoreLogs(["The player has already been initialized via setupPlayer."]);

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Montserrat-Regular': require('@/assets/fonts/Montserrat-Regular.ttf'),
    'Montserrat-Bold': require('@/assets/fonts/Montserrat-Bold.ttf'),
  });
  const [appIsReady, setAppIsReady] = useState(false);
  const [isSplashFinished, setIsSplashFinished] = useState(false);
  const [hasConnectionError, setHasConnectionError] = useState(false);

  // Custom error logger for connection issues
  const originalConsoleError = console.error;
  const checkConnectionError = (error: any) => {
    if (typeof error === 'string' && /request/i.test(error)) {
      handleConnectionError(error);
    }
  };

  console.error = (...args) => {
    originalConsoleError(...args); // Call the original console.error
    args.forEach(arg => checkConnectionError(arg)); // Check each argument for the word "connection"
  };

  // Setup TrackPlayer and handle app readiness
  const handleTrackPlayerLoaded = useCallback(() => {
    setAppIsReady(true);
  }, []);

  useSetupTrackPlayer({
    onLoad: handleTrackPlayerLoaded,
  });

  useLogTrackPlayerState();

  const handleConnectionError = (error: any) => {
    console.error(error); // Log the error for debugging
    setHasConnectionError(true); // Show the banner
    setTimeout(() => setHasConnectionError(false), 3000); // Hide banner after 3 seconds
  };

  // Hide the splash screen only when the app is ready
  useEffect(() => {
    const hideSplashScreen = async () => {
      if (appIsReady && fontsLoaded) {
        await SplashScreen.hideAsync();
        setIsSplashFinished(true);
      }
    };

    hideSplashScreen();
  }, [fontsLoaded, appIsReady]);

  if (!isSplashFinished) {
    return (
      <CustomSplashScreen onFinish={() => setIsSplashFinished(true)} />
    );
  }

  return (
    <ReadioProvider>
      <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
        <ClerkLoaded>
          <GestureHandlerRootView>
            {hasConnectionError && <ConnectionErrorBanner />}
            <Stack>
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen
                name="player"
                options={{
                  headerShown: false,
                  presentation: 'card',
                  gestureEnabled: true,
                  gestureDirection: 'vertical',
                  animationDuration: 400,
                }}
              />
              <Stack.Screen
                name="radioLoading"
                options={{
                  headerShown: false,
                  presentation: 'card',
                  gestureEnabled: true,
                  gestureDirection: 'vertical',
                  animationDuration: 400,
                }}
              />
              <Stack.Screen name="+not-found" />
            </Stack>
          </GestureHandlerRootView>
        </ClerkLoaded>
      </ClerkProvider>
    </ReadioProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  splashGif: {
    width: '80%',
    height: '80%',
  },
});