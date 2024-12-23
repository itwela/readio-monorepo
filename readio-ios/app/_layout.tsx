import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, useCallback } from 'react';
import 'react-native-reanimated';
import { LogBox, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ReadioProvider } from '@/constants/readioContext';
import { ClerkLoaded, ClerkProvider } from '@clerk/clerk-expo';
import Constants from 'expo-constants';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ConnectionErrorBanner from '@/components/ConnectionError';
import { useSetupTrackPlayer } from '@/hooks/useSetupTrackPlayer';
import { useLogTrackPlayerState } from '@/hooks/useLogTrackPlayerState';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Validate that all dummy parts exist
if (!Constants.expoConfig?.extra?.CLERK_KEY_DEV_1 ||!Constants.expoConfig?.extra?.CLERK_KEY_DEV_2) {
  console.log(
    "Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env"
  );
}

// Extract dummy parts and salt from Expo config
const extra = Constants?.expoConfig?.extra;

const clerkKeyParts = [
  extra?.CLERK_KEY_DEV_1,
  extra?.CLERK_KEY_DEV_2
];

const reconstructKey = (parts: string[]) => parts.join("");

const publishableKey = reconstructKey(clerkKeyParts);

// Suppress specific logs
LogBox.ignoreLogs(["Clerk:"]);
LogBox.ignoreLogs(["The player has already been initialized via setupPlayer."]);


export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    MonteserratReg: require('../assets/fonts/Montserrat-Regular.ttf'),
    MonteserratBold: require('../assets/fonts/Montserrat-Bold.ttf'),
  });

  // NOTE - HANDLE ERRORS ----------------------------------------------------
  const [hasConnectionError, setHasConnectionError] = useState(false);
  
  const originalConsoleError = console.error;
  
  const handleConnectionError = (error: any) => {
    console.error(error); // Log the error for debugging
    setHasConnectionError(true); // Show the banner
    setTimeout(() => setHasConnectionError(false), 3000); // Hide banner after 3 seconds
  };
  const checkConnectionError = (error: any) => {
    if (typeof error === 'string' && /request/i.test(error)) {
      handleConnectionError(error);
    }
  };
  console.error = (...args) => {
    originalConsoleError(...args); // Call the original console.error
    args.forEach(arg => checkConnectionError(arg)); // Check each argument for the word "connection"
  };
  
  // ANCHOR - END HANDLE ERRORS ----------------------------------------------------
  

  // NOTE - TRACK PLAYER -----------------------------------------------------------
  const [appIsReady, setAppIsReady] = useState(false);
  
  // Setup TrackPlayer and handle app readiness with logging for errors
  const handleTrackPlayerLoaded = useCallback(() => {
    console.log('TrackPlayer loaded successfully');
    setAppIsReady(true);
  }, []);

  useSetupTrackPlayer({
    onLoad: handleTrackPlayerLoaded,
  });

  useLogTrackPlayerState();

  useEffect(() => {
    if (loaded && appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [loaded, appIsReady]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ClerkProvider publishableKey={publishableKey}>
        <ClerkLoaded>
        {hasConnectionError && <ConnectionErrorBanner />}
        <GestureHandlerRootView>
          <ReadioProvider>
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
          <StatusBar style="auto" />
          </ReadioProvider>
        </GestureHandlerRootView>
        </ClerkLoaded>
      </ClerkProvider>
    </ThemeProvider>
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