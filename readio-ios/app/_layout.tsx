import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, useCallback } from 'react';
import 'react-native-reanimated';
import { LogBox, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { LotusUserProvider, useLotusUser } from '@/helpers/providers/lotusUserContext';
import { ClerkLoaded, ClerkProvider } from '@clerk/clerk-expo';
import Constants from 'expo-constants';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ConnectionErrorBanner from '@/components/ConnectionError';
import { useSetupTrackPlayer } from '@/hooks/useSetupTrackPlayer';
import { useLogTrackPlayerState } from '@/hooks/useLogTrackPlayerState';
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated';
import * as Linking from 'expo-linking';
import * as Updates from 'expo-updates';
import { tokenCache } from '@/lib/auth';
import sql from '@/helpers/neonClient';
import { LotusAuthProvider } from '@/helpers/providers/LotusAuthContext';
import { LastActiveTrackProvider } from '@/hooks/useLastActiveTrack';
import { LotusModalProvider } from '@/helpers/providers/lotusModalContext';
import { LotusUtilsProvider } from '@/helpers/providers/lotusUtilsContext';
import { LotusTabBarProvider } from '@/helpers/providers/lotusTabBarProvider';
import { LotusSettingsProvider } from '@/helpers/providers/lotusSetingsProvider';
import { LotusAnnouncementProvider } from '@/helpers/providers/lotusAnnouncementProvider';
import { preloadImages } from '@/constants/imageAssets';
import { setStateAsync } from '@/constants/utilityFunctions';
import { LotusPresenceProvider } from '@/helpers/providers/lotusPresenceContext';
import { LotusFithopProvider } from '@/helpers/providers/lotusFithopProvider';
import { LotusGiantStepsProvider } from '@/helpers/providers/lotusGiantStepsProvider';
import { LotusNotificationProvider } from '@/helpers/providers/LotusNotificationProvider';
import { LotusStreakProvider } from '@/helpers/providers/lotusStreakProvider';
import { LotusAchievementProvider } from '@/helpers/providers/lotusAchievementProvider';
import { LotusHapticProvider } from '@/helpers/providers/lotusHapticProvider';


// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// This is the default configuration
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false, // Reanimated runs in strict mode by default
});

export default function RootLayout() {

  // SECTION ------------ INITIALIZE CONSTS SETUP STUFF ----------

  const colorScheme = useColorScheme();
  const [trackPlayerIsReady, setTrackPlayerIsReady] = useState(false);

  // SECTION ------------ LOADING ASSETS STUFF ----------

  const [loadedFonts] = useFonts({
    MonteserratReg: require('../assets/fonts/Montserrat-Regular.ttf'),
    MonteserratBold: require('../assets/fonts/Montserrat-Bold.ttf'),
    OldOriginal: require('../assets/fonts/Old_originals.ttf'),
  });
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const loadAssets = async () => {
    const loaded = await preloadImages();
    await setStateAsync(setImagesLoaded, true, 'affectsSomethingVisual')
  };
  useEffect(() => {
    const handleLoadGraphicAssets = async () => {
      await loadAssets();
    };
    handleLoadGraphicAssets();
  }, []);

  // SECTION ------------ ERROR HANDLING SETUP STUFF ----------

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

  // SECTION ------------ TRACK PLAYER SETUP STUFF ----------

  // Setup TrackPlayer and handle app readiness with logging for errors
  const handleTrackPlayerLoaded = useCallback(() => {
    console.log('TrackPlayer loaded successfully');
    setTrackPlayerIsReady(true);
  }, []);

  useSetupTrackPlayer({
    onLoad: handleTrackPlayerLoaded,
  });

  useLogTrackPlayerState();

  // SECTION ------------ DEEP LINKING STUFF ----------

  useEffect(() => {
    const handleDeepLink = ({ url }: { url: string }) => {
      // Process the incoming URL
      console.log('Redirected URL:', url);
    };

    const listener = Linking.addEventListener('url', handleDeepLink);

    return () => {
      listener.remove();
    };
  }, []);

  const linking = {
    prefixes: ['lotus://'], // Your custom scheme
    config: {
      screens: {
        AuthCallback: 'auth/callback', // Matches the redirect URI path
      },
    },
  };

  // SECTION ------------ CHECK IF ALL THINGS ARE LOADED NOW ----------

  const loaded = loadedFonts && imagesLoaded && trackPlayerIsReady;

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          console.log('Update available, downloading...');
          await Updates.fetchUpdateAsync();
          console.log('Update downloaded, reloading...');
          await Updates.reloadAsync();
        }
      } catch (error) {
        console.log('Error checking for updates:', error);
      }
    };

    // Check immediately when app starts
    checkForUpdates();

    // Then check periodically (every 5 minutes)
    const updateInterval = setInterval(checkForUpdates, 300000);

    return () => clearInterval(updateInterval);
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <LastActiveTrackProvider>
        <LotusUtilsProvider>
          <LotusHapticProvider>
            <LotusUserProvider>
              <LotusNotificationProvider>
                <LotusStreakProvider>
                  <LotusAchievementProvider>
                    <LotusTabBarProvider>
                      {hasConnectionError && <ConnectionErrorBanner />}
                      <LotusPresenceProvider>
                        <LotusFithopProvider>

                          <LotusSettingsProvider>
                            <LotusAnnouncementProvider>

                              <LastActiveTrackProvider>
                                <LotusGiantStepsProvider>
                                  <LotusAuthProvider>
                                    <LotusModalProvider>

                                      <GestureHandlerRootView>
                                        <Stack>
                                          <Stack.Screen name="(auth)" options={{ headerShown: false, animation: 'fade', animationDuration: 250 }} />
                                          <Stack.Screen name="(home)" options={{ headerShown: false, animation: 'fade', animationDuration: 250 }} />
                                          <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: 'fade', animationDuration: 250 }} />
                                          <Stack.Screen name="index" options={{ headerShown: false, animation: 'fade', animationDuration: 250 }} />
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
                                          {/* TODO Add Create Article Screen */}
                                          <Stack.Screen
                                            name="createArticle"
                                            options={{
                                              headerShown: false,
                                              presentation: 'card',
                                              gestureEnabled: true,
                                              gestureDirection: 'vertical',
                                              animationDuration: 400,
                                            }}
                                          />
                                          {/* TODO Add Finished Presence/Giant Steps Screen */}
                                          <Stack.Screen name="+not-found" />
                                        </Stack>
                                        <StatusBar style="auto" />
                                      </GestureHandlerRootView>
                                    </LotusModalProvider>
                                  </LotusAuthProvider>
                                </LotusGiantStepsProvider>
                              </LastActiveTrackProvider>

                            </LotusAnnouncementProvider>
                          </LotusSettingsProvider>
                        </LotusFithopProvider>
                      </LotusPresenceProvider>
                    </LotusTabBarProvider>
                  </LotusAchievementProvider>
                </LotusStreakProvider>
              </LotusNotificationProvider>
            </LotusUserProvider>
          </LotusHapticProvider>
        </LotusUtilsProvider>
      </LastActiveTrackProvider>
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