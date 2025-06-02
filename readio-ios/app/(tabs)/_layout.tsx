import { HapticTab } from '@/components/HapticTab';
import LotusHeader from '@/components/LotusHeader';
import LotusSubscriptionProcessingModal from '@/components/LotusModals/LotusProcessingSubModal';
import ReadioFloatingPlayer from '@/components/ReadioFloatingPlayer';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ImageAssets } from '@/constants/imageAssets';
import { buttonStyle, colors } from '@/constants/tokens';
import { setStateAsync } from '@/constants/utilityFunctions';
import { useLotusEnv } from '@/helpers/providers/LotusEnvHandler';
import { useLotusHaptic } from '@/helpers/providers/lotusHapticProvider';
import { useLotusMeditation } from '@/helpers/providers/lotusMeditationContext';
import { useLotusModal } from '@/helpers/providers/lotusModalContext';
import { useLotusTabBar } from '@/helpers/providers/lotusTabBarProvider';
import { useLotusUser } from '@/helpers/providers/lotusUserContext';
import { useLotusUtils } from '@/helpers/providers/lotusUtilsContext';
import { useRevenueCat } from '@/helpers/providers/RevenueCatProvider';
import { RootNavigationProp } from "@/types/type";
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { getFocusedRouteNameFromRoute, useNavigation, useRoute } from '@react-navigation/native';
import { Tabs, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, Platform, Pressable, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';

export default function TabLayout() {
  const navigation = useNavigation<RootNavigationProp>();
  const { user, isSubscriptionProcessing, userIsSubscribed, userIsNotSubscribed, needsToRefresh, refreshUserData, setNeedsToRefresh, checkSignInStatus, newlyGeneratedArticle, setNewlyGeneratedArticle } = useLotusUser()
  const {subscribeToLotus} = useRevenueCat();
  const { currentRouteName, setCurrentRouteName, } = useLotusUtils()
  const { isTabBarVisible } = useLotusTabBar()
  const { meditationSessionHasStarted, setMeditationSessionHasStarted } = useLotusMeditation()
  const { clients, getEnv } = useLotusEnv(); // Get clients from LotusEnvHandler
  const { lightFeedback } = useLotusHaptic();
  // default role is 'user'

  const router = useRouter();
  const route = useRoute();

  const handleShowCreateArticlePage = () => {
    lightFeedback();
    router.navigate('/createArticle')
  };

  const goToNewAppPage = (page_route: any) => {

    lightFeedback()

    router.push(page_route)
    // if (userIsNotSubscribed) {
    //   subscribeToLotus();
    // } else {
    // }

  }


  useEffect(() => {

    const unsubscribe = navigation.addListener('state', () => {
      const routeName = getFocusedRouteNameFromRoute(route) ?? 'Home';
      setCurrentRouteName?.(routeName);
      // console.log("Current Route:", routeName);
    });

    return () => {
      unsubscribe();
    };

  }, [navigation, route]);

  // REVIEW  --------------------- GENERAL ARTICLE HANDLING ---------------------------------------------

  //  GEMINI TEST FUNCTION
  const testGemini = async () => {
    // console.log("Gemini Test started...");
    try {
      // Step 1: Gemini Title Test
      // console.log("Generating title...");
      const titleResponse = await clients.geminiTest.generateContent(
        `Hello Gemini`
      );
      const generatedTest = titleResponse.response.text().trim() ? true : false;
      // console.log("Generated Test Gemini:", generatedTest);
      return generatedTest;
    } catch (error) {
      console.error("Error during Gemini Test:", error);
      return false; // Continue even if there's an error
    }
  };

  const runTests = async () => {

    setTimeout(() => {
      // console.log('generation started...RUNNING TESTS')
    }, 100)

    // setArticleGenerationStatus('generating...')
    const geminiTestResult = await testGemini();
    // const pexelsTestResult = await testPexels(geminiTestResult);
    // console.log('success')

    // NOTE  ---- Test are good ✅, we can make the article now with free service
    return geminiTestResult === true ;
    // return geminiTestResult === true && pexelsTestResult === true;
  }

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
                  <Image style={{ width: 34, height: 34 }} source={currentRouteName === 'meditation' ? ImageAssets.meditationIconGold : ImageAssets.meditationIcon} resizeMode="contain" />
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
                  if (userIsNotSubscribed) {
                    subscribeToLotus();
                  } else {
                    handleShowCreateArticlePage();
                  }
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
                      color: colors.readioDustyWhite,
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

      <LotusSubscriptionProcessingModal visible={isSubscriptionProcessing as boolean} />
      {/* <LotusSubscriptionProcessingModal visible={true} /> */}


      {/* </LotusUserProvider> */}


    </>
  );

}
