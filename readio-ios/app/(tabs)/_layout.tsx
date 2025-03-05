import { HapticTab } from '@/components/HapticTab';

// FIXME This is causing an error in my build ONLY WHEN I RUN EAS BUILD PREVIEW AND ITS CAUSING IT IN THE BUNDLING JAVASCRIPT SPECIFICALLY
import ProfileScreen from '@/components/LotusProfilePage';

import ReadioFloatingPlayer from '@/components/ReadioFloatingPlayer';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { getLocalImageUri, ImageAssets } from '@/constants/imageAssets';
import { colors } from '@/constants/tokens';
import { setStateAsync } from '@/constants/utilityFunctions';
import { handleGenerateArticleCompletelyFree, handleGenerateArticleCompletelyFreeProps } from '@/handleArticleGenerations/handleGenerateArticle';
import { handleGenerateReadioCustom, HandleGenerateReadioCustomProps } from '@/handleArticleGenerations/handleGenerateReadioCustom';
import { geminiTest } from '@/helpers/geminiClient';
import sql from '@/helpers/neonClient';
import { pexelsClient } from '@/helpers/pexelsClient';
import { useLotusModal } from '@/helpers/providers/lotusModalContext';
import { useLotusTabBar } from '@/helpers/providers/lotusTabBarProvider';
import { useLotusUser } from '@/helpers/providers/lotusUserContext';
import { useLotusUtils } from '@/helpers/providers/lotusUtilsContext';
import { tokenCache } from '@/lib/auth';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { getFocusedRouteNameFromRoute, useNavigation, useRoute } from '@react-navigation/native';
import { Tabs, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, Platform, Pressable, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';

export default function TabLayout() {


  const navigation = useNavigation();
  const {user, setUser, needsToRefresh, refreshUserData, setNeedsToRefresh, checkSignInStatus  } = useLotusUser()
  const { currentRouteName, setCurrentRouteName } = useLotusUtils() 
  const { form, setForm, isArticleModalVisible, wantsToMakeAStudyArticle, setWantsToMakeAStudyArticle, setIsArticleGenerating, setIsStudyModalVisible, setIsArticleModalVisible, setArticleGenerationStatus, setWantsToMakeAnArticle, wantsToMakeAnArticle, articleGenerationStatus , minuteHasPassed, setMinuteHasPassed} = useLotusModal()
  const { isTabBarVisible } = useLotusTabBar()

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

    return () => {
      unsubscribe();
    };

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
    {/* <LotusUserProvider> */}

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
        paddingHorizontal: 10,

        // display: isTabBarVisible ? 'flex' : 'none',

      },
      default: {
        backgroundColor: colors.readioBrown,
        borderColor: colors.readioWhite,
        borderTopWidth: 1,
        height: 85,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        paddingHorizontal: 10,
        
        // display: isTabBarVisible ? 'flex' : 'none',

      },
    }),
  }}
>
          {/* NOTE WhatThis screen needs to remain in the tab navigator for routing purposes, but 'href: null' 
            ensures it doesn't take up space in the tab bar while still being accessible */}
        <Tabs.Screen
          name="(home)"
          options={{
            title: '',
            href: null
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
                  <IconSymbol size={30} name="book.fill" color={ currentRouteName === '(library)' ? colors.readioOrange : colors.readioWhite } />
                </View>
              </Pressable>
            )
          }}
        />

        
        <Tabs.Screen
          name="presence"
          options={{
            title: '',
            // tabBarIcon: ({ color }) => 
            tabBarButton: () => (
              <Pressable onPress={() => router.push('/(tabs)/presence')} style={{backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%'}}>
                <View style={{borderRadius: 100, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
                  {/* <IconSymbol size={28} name=""= color={ currentRouteName === 'presence' ? colors.readioOrange : colors.readioWhite } /> */}
                 {/* <FontAwesome name="" /> */}
                  <Image style={{ width: 34, height: 34 }} source={currentRouteName === 'presence' ? ImageAssets.presenceIconOrange : ImageAssets.presenceIcon} resizeMode="contain"/>
                </View>
              </Pressable>
            )
          }}
        />


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
          name="fithop"
          options={{
            title: '',
            // tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
            tabBarButton: () => (
              <Pressable onPress={() => router.push('/(tabs)/fithop')} style={{backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%'}}>
                <View style={{borderRadius: 100, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
                  <IconSymbol size={28} name="music.note"  color={ currentRouteName === 'fithop' ? colors.readioOrange : colors.readioWhite }/>
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

        <ReadioFloatingPlayer
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 78,
          }}
        />

        <ProfileScreen/>
      
      {/* </LotusUserProvider> */}


    </>
  );

}

