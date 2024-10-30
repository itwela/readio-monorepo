import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot, Redirect, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { useSetupTrackPlayer } from '@/hooks/useSetupTrackPlayer';
import { useLogTrackPlayerState } from '@/hooks/useLogTrackPlayerState';
import { useAuth, ClerkProvider, ClerkLoaded } from "@clerk/clerk-expo";
import { tokenCache } from "@/lib/auth";
import { LogBox } from "react-native";
import { ReadioProvider } from '@/constants/readioContext';

// Catch any errors thrown by the Layout component.
export { ErrorBoundary } from 'expo-router';

// Ensure that reloading on `/modal` keeps a back button present.
export const unstable_settings = { initialRouteName: '(tabs)' };

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error(
    "Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env",
  );
}

LogBox.ignoreLogs(["Clerk:"]);
LogBox.ignoreLogs(["The player has already been initialized via setupPlayer."]);

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    ...FontAwesome.font,
  });

  const handleTrackPlayerLoaded = useCallback(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useSetupTrackPlayer({
    onLoad: handleTrackPlayerLoaded,
  });

  useLogTrackPlayerState();

  // const colorScheme = useColorScheme();
  // const { isSignedIn, isLoaded } = useAuth();

  // if (!fontsLoaded || !isLoaded) {
  //   return null;
  // }

  // if (!isSignedIn) {
  //   return <Redirect href="/(auth)/welcome" />;
  // }

  return (
    <ReadioProvider>

    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <ClerkLoaded>

        <Stack>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="player" options={{ 
                  headerShown: false, 
                  presentation: 'card',
                  gestureEnabled: true,
                  gestureDirection: 'vertical',
                  animationDuration: 400
                  }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        {/* <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}> */}
          {/* <Slot /> */}
        {/* </ThemeProvider> */}
          
      </ClerkLoaded>
    </ClerkProvider>
    
    </ReadioProvider>
  );
}
