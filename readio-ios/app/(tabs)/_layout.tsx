import { HapticTab } from '@/components/HapticTab';
import LotusHeader from '@/components/LotusHeader';


import ReadioFloatingPlayer from '@/components/ReadioFloatingPlayer';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { getLocalImageUri, ImageAssets } from '@/constants/imageAssets';
import { buttonStyle, colors } from '@/constants/tokens';
import { setStateAsync } from '@/constants/utilityFunctions';
import { handleGenerateArticleReplicate, handleGenerateArticleElevenLabs } from '@/handleArticleGenerations/handleGenerateArticle';
import { handleGenerateArticleElevenLabs_Custom, handleGenerateArticleReplicate_Custom } from '@/handleArticleGenerations/handleGenerateArticleCustom';
import { geminiTest } from '@/helpers/geminiClient';
import sql from '@/helpers/neonClient';
import { pexelsClient } from '@/helpers/pexelsClient';
import { useLotusModal } from '@/helpers/providers/lotusModalContext';
import { useLotusMeditation } from '@/helpers/providers/lotusMeditationContext';
import { useLotusTabBar } from '@/helpers/providers/lotusTabBarProvider';
import { useLotusUser } from '@/helpers/providers/lotusUserContext';
import { useLotusUtils } from '@/helpers/providers/lotusUtilsContext';
import { tokenCache } from '@/lib/auth';
import { FontAwesome, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { getFocusedRouteNameFromRoute, useNavigation, useRoute } from '@react-navigation/native';
import { Tabs, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, Platform, Pressable, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { RootNavigationProp } from "@/types/type";
import { handleGenerateArticleProps } from '@/handleArticleGenerations/generationUtilities';
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";
import { PurchasesOffering } from 'react-native-purchases';
import { useLotusHaptic } from '@/helpers/providers/lotusHapticProvider';

export default function TabLayout() {


  const navigation = useNavigation<RootNavigationProp>();
  const { user, setUser, needsToRefresh, refreshUserData, setNeedsToRefresh, checkSignInStatus } = useLotusUser()
  const { currentRouteName, setCurrentRouteName, } = useLotusUtils()
  const { form, setForm, isArticleModalVisible, wantsToMakeA_D_I_Y_Article, setWantsToMakeA_D_I_Y_Article, setIsArticleGenerating, setIsStudyModalVisible, setIsArticleModalVisible, setArticleGenerationStatus, setWantsToMakeAnArticle, wantsToMakeAnArticle, articleGenerationStatus, minuteHasPassed, setMinuteHasPassed } = useLotusModal()
  const { isTabBarVisible } = useLotusTabBar()
  const { meditationSessionHasStarted, setMeditationSessionHasStarted } = useLotusMeditation()
  const [isGenerationLocked, setIsGenerationLocked] = React.useState(false);
  // default role is 'user'
  const isUserAPayedSubscriber = user?.subscription_plan !== 'blank' || user?.user_role === 'admin';
  const { lightFeedback, mediumFeedback }= useLotusHaptic()
  
  const router = useRouter();
  const route = useRoute();

  const handleShowCreateArticlePage = () => {
    navigation.navigate('createArticle');
  };

  const goToNewAppPage = (page_route: any) => {

    mediumFeedback()

    router.push(page_route)
  //  if (isUserAPayedSubscriber === true) {
  //  }

  //  if (isUserAPayedSubscriber === false) {
  //   subscribeToLotus()
  //  }

  }

  const subscribeToLotus = async () => {

    const paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywall({
      displayCloseButton: false,
    });
    console.log('paywallResult', paywallResult)
    
    switch (paywallResult) { 
      case PAYWALL_RESULT.NOT_PRESENTED:
      case PAYWALL_RESULT.ERROR:
      case PAYWALL_RESULT.CANCELLED:
        return false;
      case PAYWALL_RESULT.PURCHASED:
      case PAYWALL_RESULT.RESTORED:
        return true;
      default:
        return false;
     }

  }


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
  const make_D_I_Y_ArticleNow = async () => {

    if (form.provider === 'replicate') {

      const result = await handleGenerateArticleReplicate_Custom({
        form: form,
        user: user,
      } as handleGenerateArticleProps);

      if (result?.success === true) {
        setNeedsToRefresh?.(true); // Just set it to true and let the provider handle the reset
      }

    }

    if (form.provider === 'elevenlabs') {

      const result = await handleGenerateArticleElevenLabs_Custom({
        form: form,
        user: user,
      } as handleGenerateArticleProps);

      if (result?.success === true) {
        setNeedsToRefresh?.(true); // Just set it to true and let the provider handle the reset
      }

    }



  };

  // TODO this is where i will decide what voice function
  const makeCreateArticleNow = async () => {

    if (form.provider === 'replicate') {

      const result = await handleGenerateArticleReplicate({
        form: form,
        user: user,
      } as handleGenerateArticleProps);

      if (result?.success === true) {
        setNeedsToRefresh?.(true);
      }

    }

    if (form.provider === 'elevenlabs') {

      const result = await handleGenerateArticleElevenLabs({
        form: form,
        user: user,
      } as handleGenerateArticleProps);

      if (result?.success === true) {
        setNeedsToRefresh?.(true);
      }

    }


  };

  // STUB ---------------------- CREATE ARTICLE HANDLING ----------------------------------------------

  // Executes the article generation process if tests succeed
  const executeCreateArticleGeneration = async () => {
    // Ensure all prerequisite tests pass before proceeding
    const testsSucceeded = await runTests();

    if (testsSucceeded) {
      // Perform the article generation action
      const make = await makeCreateArticleNow();

      // Update UI-related states asynchronously
      await setStateAsync(setWantsToMakeAnArticle, false, 'affectsSomethingVisual');
      await setStateAsync(setIsArticleGenerating, false, 'affectsSomethingVisual');
      await setStateAsync(setArticleGenerationStatus, 'done', 'affectsSomethingVisual');

      console.log("gen status is done now");
    } else {
      // Handle the failure case gracefully
      console.log("Service outage...Please try again 🔴");
    }
  };

  // REVIEW AFTER A DAY OF DEBUGGING, THIS FINALLY WORKS CORRECTLY IN DEV MODE SO I KNOW IT WILL IN PRODUCTION
  useEffect(() => {
    let isActive = true;

    const handleArticleProcess = async () => {
      if (!isActive) return;

      try {
        // Ensure the UI reflects that the process is starting
        await setStateAsync(setIsArticleGenerating, true, 'affectsSomethingVisual');
        await setStateAsync(setWantsToMakeAnArticle, false, 'backendData');

        // NOTE: This function actually triggers the article generation, everything else is just state management
        await executeCreateArticleGeneration();

      } catch (error) {
        if (isActive) {
          // Handle errors while keeping UI state consistent
          console.error("Article generation error:", error);
          await setStateAsync(setIsArticleGenerating, false, 'affectsSomethingVisual');
          await setStateAsync(setArticleGenerationStatus, 'error', 'affectsSomethingVisual');
        }
      }
    };

    // Start article generation process if the user requested it
    if (wantsToMakeAnArticle === true) {
      handleArticleProcess();
    }

    return () => {
      // Cleanup function to prevent state updates on unmounted components
      isActive = false;
    };
  }, [wantsToMakeAnArticle]);


  // STUB ---------------------- STUDY ARTICLE HANDLING ----------------------------------------------
  // Executes the DIY article generation process if tests succeed
  const execute_D_I_Y_ArticleGeneration = async () => {
    // Ensure all prerequisite tests pass before proceeding
    const testsSucceeded = await runTests();

    if (testsSucceeded) {
      
      // Perform the article generation action
      const make = await make_D_I_Y_ArticleNow();

      // Update relevant states to reflect process completion
      await setStateAsync(setWantsToMakeA_D_I_Y_Article, false, 'backendData');
      await setStateAsync(setIsArticleGenerating, false, 'affectsSomethingVisual');
      await setStateAsync(setArticleGenerationStatus, 'done', 'affectsSomethingVisual');

      console.log("gen status is done now");
    } else {
      // Handle the failure case gracefully
      console.log("Service outage...Please try again 🔴");
    }
  };

  // REVIEW AFTER A DAY OF DEBUGGING, THIS FINALLY WORKS CORRECTLY IN DEV MODE SO I KNOW IT WILL IN PRODUCTION
  useEffect(() => {
    let isActive = true;

    const handle_D_I_Y_Process = async () => {
      if (!isActive) return;

      try {
        // Ensure UI reflects that the process is starting
        await setStateAsync(setIsArticleGenerating, true, 'affectsSomethingVisual');
        await setStateAsync(setWantsToMakeA_D_I_Y_Article, false, 'backendData');

        // NOTE: This function actually triggers the DIY article generation, everything else is just state management
        await execute_D_I_Y_ArticleGeneration();

      } catch (error) {
        if (isActive) {
          // Handle errors while keeping UI state consistent
          console.error("DIY Article generation error:", error);
          await setStateAsync(setIsArticleGenerating, false, 'affectsSomethingVisual');
          await setStateAsync(setArticleGenerationStatus, 'error', 'affectsSomethingVisual');
        }
      }
    };

    // Start the DIY article generation process if requested
    if (wantsToMakeA_D_I_Y_Article === true) {
      handle_D_I_Y_Process();
    }

    return () => {
      // Cleanup function to prevent state updates on unmounted components
      isActive = false;
    };
  }, [wantsToMakeA_D_I_Y_Article]);

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
              borderColor: currentRouteName === '(home)' ? 'transparent' : `${colors.readioWhite}50`,
              borderTopWidth: 1,
              paddingTop: 15,
              height: 85,
              flexDirection: 'row',
              justifyContent: 'space-evenly',
              alignItems: 'center',
              paddingHorizontal: 10,
              display: meditationSessionHasStarted === true ? 'none' : currentRouteName === 'profileAndSettings' ? 'none' : 'flex',

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
              display: meditationSessionHasStarted === true ? 'none' : 'flex',

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
              <Pressable onPress={() => goToNewAppPage('/(tabs)/(library)/lib')} style={{ backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                <View style={{ borderRadius: 100, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <IconSymbol size={30} name="book.fill" color={currentRouteName === '(library)' ? colors.readioOrange : colors.readioWhite} />
                </View>
              </Pressable>
            )
          }}
        />


        <Tabs.Screen
          name="meditation"
          options={{
            title: '',
            // tabBarIcon: ({ color }) => 
            tabBarButton: () => (
              <Pressable onPress={() => goToNewAppPage('/(tabs)/meditation')} style={{ backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                <View style={{ borderRadius: 100, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Image style={{ width: 34, height: 34 }} source={currentRouteName === 'meditation' ? ImageAssets.meditationIconOrange : ImageAssets.meditationIcon} resizeMode="contain" />
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
                onPress={() => {
                  isUserAPayedSubscriber ? handleShowCreateArticlePage() : subscribeToLotus();
                  // setIsStudyModalVisible(false)
                }}
                style={[buttonStyle.shadowOrange, {
                  backgroundColor: colors.readioOrange,
                  borderRadius: 70,
                  width: 50,
                  height: 50,
                  // top: -25, // Lift the button up more
                  justifyContent: "center",
                  alignItems: "center",
                  alignSelf: 'center',
                }]}
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
              <Pressable onPress={() => goToNewAppPage('/(tabs)/fithop')} style={{ backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                <View style={{ borderRadius: 100, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  {/* <IconSymbol size={28} name="music.note"  color={ currentRouteName === 'fithop' ? colors.readioOrange : colors.readioWhite }/> */}
                  <MaterialCommunityIcons size={30} name="music" color={currentRouteName === 'fithop' ? colors.readioOrange : colors.readioWhite} />
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
              <Pressable onPress={() => goToNewAppPage('/(tabs)/giant')} style={{ backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                <View style={{ borderRadius: 100, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <IconSymbol size={28} name='shoeprints.fill' color={currentRouteName === 'giant' ? colors.readioOrange : colors.readioWhite} />
                </View>
              </Pressable>
            )
          }}
        />

          <Tabs.Screen
            name="profileAndSettings"
            options={{
              // Href is set to null to hide this screen from the tab bar
              href: null,
              // Other options like title, badge, label are likely redundant now but kept for clarity
              title: '',
              // tabBarBadgeStyle: {
              //   display: 'none',
              // },
              // tabBarLabelStyle: {
              //   display: 'none',
              // },
              // Removed the custom tabBarButton as href: null is the standard way to hide a tab
            }}
          />

      </Tabs>

      <View style={{ position: 'absolute', top: 0 }}>
        <LotusHeader
          backgroundColor={colors.readioBrown}
          onSignUpPage={false}
        />
      </View>

      <ReadioFloatingPlayer
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 78,
          display: meditationSessionHasStarted === true ? 'none' : 'flex',
        }}
      />


      {/* </LotusUserProvider> */}


    </>
  );

}
