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
import { RevenueCatProvider } from '@/helpers/providers/RevenueCatProvider';
import { ClerkLoaded, ClerkProvider } from '@clerk/clerk-expo';
import Constants from 'expo-constants';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ConnectionErrorBanner from '@/components/ConnectionError';
import { useSetupTrackPlayer } from '@/hooks/useSetupTrackPlayer';
import { useLogTrackPlayerState } from '@/hooks/useLogTrackPlayerState';
import TrackPlayer, { Capability } from 'react-native-track-player';
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
import { LotusSettingsProvider } from '@/helpers/providers/lotusSettingsProvider';
import { LotusAnnouncementProvider } from '@/helpers/providers/lotusAnnouncementProvider';
import { preloadImages } from '@/constants/imageAssets';
import { setStateAsync } from '@/constants/utilityFunctions';
import { LotusMeditationProvider } from '@/helpers/providers/lotusMeditationContext';
import { LotusFithopProvider } from '@/helpers/providers/lotusFithopProvider';
import { LotusGiantStepsProvider } from '@/helpers/providers/lotusGiantStepsProvider';
import { LotusNotificationProvider } from '@/helpers/providers/LotusNotificationProvider';
import { LotusStreakProvider } from '@/helpers/providers/lotusStreakProvider';
import { LotusAchievementProvider } from '@/helpers/providers/lotusAchievementProvider';
import { LotusHapticProvider } from '@/helpers/providers/lotusHapticProvider';
import { LotusGoalsProvider } from '@/helpers/providers/lotusGoalsContext';
import { LotusAudiobookProvider } from '@/helpers/providers/lotusAudiobookProvider';
import { RevenueCatInitializer } from '@/components/RevenueCatInitializer';
import { LotusCreateArticleProvider } from '@/helpers/providers/lotusCreateArticleProvider';
// import { LotusCreateArticleProvider } from '@/helpers/providers/lotusCreateArticleProvider';


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



  // SECTION ------------ CHECK FOR UPDATES ----------

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
    // NOTE --- NEVER AND I MEAN NEVER CHANGE ORDER OF THESE PROVIDERS.
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <LotusUtilsProvider>
        <LotusUserProvider>
          <RevenueCatInitializer>
            <RevenueCatProvider>
              <LotusNotificationProvider>
                <LastActiveTrackProvider>
                  <LotusHapticProvider>
                    <LotusModalProvider>
                      <LotusCreateArticleProvider>
                        <LotusStreakProvider>
                          <LotusAchievementProvider>
                            <LotusTabBarProvider>
                              {hasConnectionError && <ConnectionErrorBanner />}
                              <LotusGoalsProvider>
                                <LotusMeditationProvider>
                                  <LotusFithopProvider>
                                    <LotusAudiobookProvider>
                                      <LotusSettingsProvider>
                                        <LotusAnnouncementProvider>
                                          <LotusGiantStepsProvider>
                                            <LotusAuthProvider>
                                              {/* <LotusCreateArticleProvider> */}
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

                                                  {/* TODO Add Finished Presence/Giant Steps Screens */}
                                                  <Stack.Screen
                                                    name="doneGiantStepsPopup"
                                                    options={{
                                                      headerShown: false,
                                                      presentation: 'modal',
                                                      gestureEnabled: true,
                                                      gestureDirection: 'vertical',
                                                      animationDuration: 400,
                                                    }}
                                                  />

                                                  <Stack.Screen
                                                    name="doneMeditationPopup"
                                                    options={{
                                                      headerShown: false,
                                                      presentation: 'modal',
                                                      gestureEnabled: true,
                                                      gestureDirection: 'vertical',
                                                      animationDuration: 400,
                                                    }}
                                                  />

                                                  {/* TODO Add Profile Screen */}
                                                  <Stack.Screen
                                                    name="profileAndSettings"
                                                    options={{
                                                      headerShown: false,
                                                      // this is the version that still has the app in the background at the top
                                                      // presentation: 'formSheet',
                                                      presentation: 'card',
                                                      gestureEnabled: true,
                                                      gestureDirection: 'vertical',
                                                      animationDuration: 400,
                                                    }}
                                                  />

                                                  <Stack.Screen name="+not-found" />
                                                </Stack>
                                                <StatusBar style="auto" />
                                              </GestureHandlerRootView>
                                              {/* </LotusCreateArticleProvider> */}
                                            </LotusAuthProvider>
                                          </LotusGiantStepsProvider>
                                        </LotusAnnouncementProvider>
                                      </LotusSettingsProvider>
                                    </LotusAudiobookProvider>
                                  </LotusFithopProvider>
                                </LotusMeditationProvider>
                              </LotusGoalsProvider>
                            </LotusTabBarProvider>
                          </LotusAchievementProvider>
                        </LotusStreakProvider>
                      </LotusCreateArticleProvider>
                    </LotusModalProvider>
                  </LotusHapticProvider>
                </LastActiveTrackProvider>
              </LotusNotificationProvider>
            </RevenueCatProvider>
          </RevenueCatInitializer>
        </LotusUserProvider>
      </LotusUtilsProvider>
    </ThemeProvider>
  )
};
