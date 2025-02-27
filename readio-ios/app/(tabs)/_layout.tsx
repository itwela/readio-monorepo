import { router, Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useRouter } from "expo-router";
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { readioRegularFont } from '@/constants/tokens';
import { colors } from '@/constants/tokens';
import ReadioFloatingPlayer from '@/components/ReadioFloatingPlayer';
import sql from '@/helpers/neonClient';
import { LotusUserProvider, useLotusUser } from '@/helpers/providers/lotusUserContext';
import { tokenCache } from '@/lib/auth';
import { useActiveTrack } from 'react-native-track-player';
import { useLastActiveTrack } from '@/hooks/useLastActiveTrack';
import { FontAwesome } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, FadeOutDown, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native'; // Import this
import { useLotusModal } from '@/helpers/providers/lotusModalContext';
import { geminiTest } from '@/helpers/geminiClient';
import { pexelsClient } from '@/helpers/pexelsClient';
import { handleGenerateReadioCustom, HandleGenerateReadioCustomProps } from '@/handleArticleGenerations/handleGenerateReadioCustom';
import { handleGenerateArticleCompletelyFree, handleGenerateArticleCompletelyFreeProps } from '@/handleArticleGenerations/handleGenerateArticle';
import { useLotusUtils } from '@/helpers/providers/lotusUtilsContext';
import { setStateAsync } from '@/constants/utilityFunctions';

export default function TabLayout() {


  const navigation = useNavigation();
  const {user, setUser, needsToRefresh, refreshUserData, setNeedsToRefresh, checkSignInStatus  } = useLotusUser()
  const { currentRouteName, setCurrentRouteName } = useLotusUtils() 
  const { form, setForm, isArticleModalVisible, wantsToMakeAStudyArticle, setWantsToMakeAStudyArticle, setIsArticleGenerating, setIsStudyModalVisible, setIsArticleModalVisible, setArticleGenerationStatus, setWantsToMakeAnArticle, wantsToMakeAnArticle, articleGenerationStatus , minuteHasPassed, setMinuteHasPassed} = useLotusModal()

  useEffect(() => {
    const checkSignInStatus = async () => {
      const savedHash = await tokenCache.getToken('userPasswordHash');
      if (savedHash) {
        getUserInfo(savedHash);
      }
    };
    const getUserInfo = async (hash: string) => {
      const userInfo = await sql`SELECT * FROM users WHERE pwhash = ${hash}`
      setUser?.(userInfo[0]);
      // console.log("userInfo: ", userInfo[0]);
    }
    checkSignInStatus();
  }, [user?.clerk_id]);

  const router = useRouter();
  const route = useRoute();

  useEffect(() => {

    const unsubscribe = navigation.addListener('state', () => {
      const routeName = getFocusedRouteNameFromRoute(route) ?? 'Home';
      setCurrentRouteName?.(routeName);
      console.log("Current Route:", routeName);
    });

  }, [navigation, route]); 

// REVIEW  --------------------- GENERAL ARTICLE HANDLING ---------------------------------------------
  
    //  GEMINI TEST FUNCTION
    const testGemini = async () => {
      console.log("Gemini Test started...");
      try {
        // Step 1: Gemini Title Test
        console.log("Generating title...");
        const titleResponse = await geminiTest.generateContent(
          `Hello Gemini`
        );
        const generatedTest = titleResponse.response.text().trim() ? true : false;
        console.log("Generated Test Gemini:", generatedTest);
        return generatedTest;
      } catch (error) {
        console.error("Error during Gemini Test:", error);
        return false; // Continue even if there's an error
      }
    };

    // 
    const testPexels = async (title: any) => {
      try {
        // Step 2: Pexels Test
        console.log("Fetching image from Pexels...");
        const pexelsData = await pexelsClient.photos.search({
          query: `${title}`,
          per_page: 1,
        });
        const pexelsImage = pexelsData ? true : false;
        console.log("Fetched Image:", pexelsImage);

        return pexelsImage;
      } catch (error) {
        console.error("Error during Pexels Test:", error);
        return false; // Continue even if there's an error
      }
    };

    // 
    const runTests = async () => {
        
        setTimeout(() => {
          console.log('generation started...RUNNING TESTS')
        }, 100)

        // setArticleGenerationStatus('generating...')
        const geminiTestResult = await testGemini();
        const pexelsTestResult = await testPexels(geminiTestResult);
        console.log('success')

        // NOTE  ---- Test are good ✅, we can make the article now with free service
        return geminiTestResult === true && pexelsTestResult === true;
    }

    // 
    const makeStudyArticleNow = async () => {
      const result = await handleGenerateReadioCustom({
        form: form,
        user: user,
      } as HandleGenerateReadioCustomProps);
    
      if (result?.success === true) {
        setNeedsToRefresh?.(true); // Just set it to true and let the provider handle the reset
      }
    };

    const makeCreateArticleNow = async () => {
      const result = await handleGenerateArticleCompletelyFree({
        form: form,
        user: user,
      } as handleGenerateArticleCompletelyFreeProps);
     
      if (result?.success === true) {
        setNeedsToRefresh?.(true);
        router.reload();
        console.log("i reloaded the router...")
      }
    };

    // 
    
// FIXME ---------------------- CREATE ARTICLE HANDLING ----------------------------------------------
    
    const executeCreateArticleGeneration = async () => {

      const testsSucceeded = await runTests();

      if (testsSucceeded) {
        await makeCreateArticleNow();

        setTimeout(() => {
          setNeedsToRefresh?.(true)
          console.log("i refreshed the data...")
        }, 1000)

      } else {
        console.log("Service outage...Please try again 🔴");
      }

    };

    useEffect(() => {
      if (wantsToMakeAnArticle === true) {
          setIsArticleGenerating(true)
          setIsArticleModalVisible(false)

          const handleArticleCreation = async () => {
            try {

              await executeCreateArticleGeneration();

              setIsArticleGenerating(false)
              setWantsToMakeAnArticle(false)
              setArticleGenerationStatus('done')
              
              
            } catch (error) {
              console.error('Article creation error:', error);
            }
          };

          handleArticleCreation();
      }
    }, [wantsToMakeAnArticle]);

// FIXME ---------------------- STUDY ARTICLE HANDLING ----------------------------------------------

    //  
    const executeStudyArticleGeneration = async () => {
            
      const testsSucceeded = await runTests();

      if (testsSucceeded) {
        const make = await makeStudyArticleNow();
      } else {
        console.log("Service outage...Please try again 🔴");
      }
    };

    // FIXME USE EFFECT TO HANDLE STUDY ARTICLE GENERATION FUNCTION
    useEffect(() => {
      if (wantsToMakeAStudyArticle === true) {
        
        const handleStudyProcess = async () => {

            await setStateAsync(setIsArticleGenerating, true, 'affectsSomethingVisual')

            // NOTE THIS MAKES THE ARTICLE EVERYTHING ELSE IS JUST HOW I NEED TO HANDLE STATES
            await executeStudyArticleGeneration();

            await refreshUserData();

            await setStateAsync(setIsArticleGenerating, false, 'affectsSomethingVisual')
            await setStateAsync(setArticleGenerationStatus, 'done', 'affectsSomethingVisual')

            console.log("gen status is done now");
            
            const statusTimeout = setTimeout(() => {
            }, 60000)
            
            await setStateAsync(setArticleGenerationStatus, '', 'affectsSomethingVisual')            
            
            return () => {
              clearTimeout(statusTimeout)
            }

          };

          handleStudyProcess();

      }
    }, [wantsToMakeAStudyArticle]);

  return (
    <>
    <LotusUserProvider>

    <Tabs
  screenOptions={{
    tabBarActiveTintColor: colors.readioOrange,
    tabBarInactiveTintColor: colors.readioWhite,
    headerShown: false,
    tabBarButton: HapticTab,
    tabBarStyle: Platform.select({
      ios: {
        position: 'absolute',
        backgroundColor: colors.readioBrown,
        borderColor: `${colors.readioWhite}50`,
        borderTopWidth: 1,
        paddingTop: 15,
        height: 85,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        paddingHorizontal: 10
      },
      default: {
        backgroundColor: colors.readioBrown,
        borderColor: colors.readioWhite,
        borderTopWidth: 1,
        height: 85,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        paddingHorizontal: 10
      },
    }),
  }}
>
        <Tabs.Screen
          name="(home)"
          options={{
            title: '',
            // tabBarIcon: ({ color }) => 
            tabBarButton: () => (
              <Pressable onPress={() => router.push('/(tabs)/(home)/home')} style={{backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%'}}>
                <View style={{borderRadius: 100, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
                  <IconSymbol size={28} name="house.fill" color={ currentRouteName === '(home)' ? colors.readioOrange : colors.readioWhite } />
                </View>
              </Pressable>
            )
          }}
        />
        <Tabs.Screen
          name="(library)"
          options={{
            title: '',
            // tabBarIcon: ({ color }) => <IconSymbol size={28} name="book.fill" color={color} />,
            tabBarButton: () => (
              <Pressable onPress={() => router.push('/(tabs)/(library)/lib')} style={{backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%'}}>
                <View style={{borderRadius: 100, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center',  height: '100%'}}>
                  <IconSymbol size={28} name="book.fill" color={ currentRouteName === '(library)' ? colors.readioOrange : colors.readioWhite } />
                </View>
              </Pressable>
            )
          }}
        />

          {/* FIXME */}
          {/* I WANT TO ADD THIS BUTTON IN THE MIDDLE OF THE TAB BAR WIHTOUT ACTUALLY GOING TO A NEW ROUTE OR MESSING UP WHATS HERE HOW DO I DO THAT? */}
          <Tabs.Screen
            name="create"
            options={{
              title: '',
              tabBarButton: () => (
                <TouchableOpacity 
                  onPress={() => setIsArticleModalVisible(true)} 
                  style={{
                    backgroundColor: colors.readioOrange,
                    borderRadius: 70,
                    width: 50,
                    height: 50,
                    // top: -25, // Lift the button up more
                    justifyContent: "center",
                    alignItems: "center",
                    shadowColor: "#000",
                    shadowOffset: {
                      width: 0,
                      height: 4,
                    },
                    shadowOpacity: 0.35,
                    shadowRadius: 5.5,
                    elevation: 8,
                    alignSelf: 'center',
                  }} 
                  activeOpacity={0.9}
                >
                  <Animated.View 
                    entering={FadeInUp.duration(300)} 
                    exiting={FadeOutDown.duration(100)}
                  >
                    <FontAwesome 
                      allowFontScaling={false} 
                      name="plus" 
                      style={{ 
                        color: colors.readioWhite, 
                        fontWeight: "bold", 
                        fontSize: 24 
                      }} 
                    />
                  </Animated.View>
                </TouchableOpacity>
              ),
            }}
          />

        <Tabs.Screen
          name="profile"
          options={{
            title: '',
            // tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
            tabBarButton: () => (
              <Pressable onPress={() => router.push('/(tabs)/profile')} style={{backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%'}}>
                <View style={{borderRadius: 100, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
                  <IconSymbol size={28} name="person.fill"  color={ currentRouteName === 'profile' ? colors.readioOrange : colors.readioWhite }/>
                </View>
              </Pressable>
            ),
          }}        
        />
          <Tabs.Screen
            name="giant"
            options={{
              title: '',
              // tabBarIcon: ({ color }) => <IconSymbol size={28} name='star.fill' color={color} />,
              tabBarButton: () => (
                <Pressable onPress={() => router.push('/(tabs)/giant')} style={{backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%'}}>
                  <View style={{borderRadius: 100, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
                    <IconSymbol size={28} name='shoeprints.fill' color={ currentRouteName === 'giant' ? colors.readioOrange : colors.readioWhite }/>
                  </View>
                </Pressable>
              )
            }}
          />

      </Tabs>

      <AnnouncementPopup/>

        <ReadioFloatingPlayer
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 78,
          }}
        />
      
      </LotusUserProvider>


    </>
  );

}

const AnnouncementPopup = () => {
  const { currentRouteName } = useLotusUtils();

  if (currentRouteName === 'giant') {
    return null;
  }

  const activeTrack = useActiveTrack();
  const lastActiveTrack = useLastActiveTrack();
  const displayedTrack = activeTrack ?? lastActiveTrack;

  const [show, setShow] = useState(true);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (!show) {
      opacity.value = withTiming(0, { duration: 300 });
    } else {
      opacity.value = withTiming(1, { duration: 300 });
    }
  }, [show]);

  // Automatically hide after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 5000); // Auto-hide after 5 seconds
    return () => clearTimeout(timer); // Cleanup on unmount or re-render
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const handleGesture = ({ nativeEvent }: { nativeEvent: any }) => {
    if (nativeEvent.translationX < -50) {
      setShow(false); // Hide on swipe left
    }
    if (nativeEvent.translationX > 50) {
      router.push('/(tabs)/giant'); // Navigate on swipe right
    }
  };

  if (!show) return null;

  return (
    <PanGestureHandler onGestureEvent={handleGesture}>
      <Animated.View
        style={[
          animatedStyle,
          {
            position: 'absolute',
            bottom: activeTrack ? 150 : 80,
            width: '90%',
            alignSelf: 'center',
          },
        ]}
      >
        <Pressable
          style={{
            width: '100%',
            overflow: 'hidden',
            paddingLeft: 5,
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            height: 50,
            backgroundColor: colors.readioWhite,
            borderRadius: 50,
          }}
        >
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Pressable
              onPress={() => setShow(false)}
              style={{
                width: 45,
                alignSelf: 'center',
                height: 45,
                borderRadius: 100,
                backgroundColor: colors.readioOrange,
                justifyContent: 'center',
              }}
            >
              <FontAwesome name="close" size={20} style={{ color: colors.readioWhite, alignSelf: 'center' }} />
            </Pressable>
            <View
              style={{
                display: 'flex',
                flexDirection: 'column',
                paddingLeft: 5,
              }}
            >
              <Text
                style={{
                  fontWeight: 'bold',
                  fontFamily: readioRegularFont,
                }}
              >
                Here for Giant Steps?
              </Text>
              <Text>Press "go" to get started!</Text>
            </View>
          </View>
          <Pressable
            onPress={() => {
              router.push('/(tabs)/giant');
            }}
            style={{
              display: 'flex',
              width: 100,
              height: '100%',
              flexDirection: 'row',
              gap: 10,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.readioOrange,
            }}
          >
            <Text
              style={{
                fontWeight: 'bold',
                fontFamily: readioRegularFont,
                fontSize: 18,
                color: colors.readioWhite,
              }}
            >
              Go
            </Text>
            <FontAwesome color={colors.readioWhite} name="arrow-right" style={{ fontSize: 18 }} />
          </Pressable>
        </Pressable>
      </Animated.View>
    </PanGestureHandler>
  );
};