import { router, Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { readioRegularFont } from '@/constants/tokens';
import { colors } from '@/constants/tokens';
import ReadioFloatingPlayer from '@/components/ReadioFloatingPlayer';
import sql from '@/helpers/neonClient';
import { useReadio } from '@/constants/readioContext';
import { tokenCache } from '@/lib/auth';
import { useActiveTrack } from 'react-native-track-player';
import { useLastActiveTrack } from '@/hooks/useLastActiveTrack';
import { FontAwesome } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, FadeOutDown, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const navigation = useNavigation();
  const {currentRouteName, setCurrentRouteName, needsToRefresh, setNeedsToRefresh} = useReadio()

  // const { user, setUser } = useReadio();
  // useEffect(() => {
  //   const checkSignInStatus = async () => {
  //     const savedHash = await tokenCache.getToken('userPasswordHash');
  //     if (savedHash) {
  //       getUserInfo(savedHash);
  //     }
  //   };
  //   const getUserInfo = async (hash: string) => {
  //     const userInfo = await sql`SELECT * FROM users WHERE pwhash = ${hash}`
  //     setUser?.(userInfo[0]);
  //     console.log("userInfo: ", userInfo[0]);
  //   }
  //   checkSignInStatus();
  // }, [user?.clerk_id]);

  return (
    <>
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
              borderColor: "transparent",
              borderTopWidth: 0,
              paddingTop: 15,
            },
            default: {
              backgroundColor: colors.readioBrown,
              borderColor: "transparent",
              borderTopWidth: 0,
            },
          }),
          tabBarLabelStyle: {
            fontFamily: readioRegularFont,
          },
        }}
      >
        <Tabs.Screen
          name="(home)"
          options={{
            title: '',
            // tabBarIcon: ({ color }) => 
            tabBarButton: () => (
              <Pressable onPress={() => router.push('/(tabs)/(home)/home')} style={{backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%'}}>
                <View style={{borderRadius: 100, backgroundColor: currentRouteName === '(home)' ? colors.readioOrange : 'transparent', alignItems: 'center', justifyContent: 'center', width: '50%', height: '100%'}}>
                  <IconSymbol size={28} name="house.fill" color={ colors.readioWhite} />
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
                <View style={{borderRadius: 100, backgroundColor: currentRouteName === '(library)' ? colors.readioOrange : 'transparent', alignItems: 'center', justifyContent: 'center', width: '50%', height: '100%'}}>
                  <IconSymbol size={28} name="book.fill" color={colors.readioWhite} />
                </View>
              </Pressable>
            )
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: '',
            // tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
            tabBarButton: () => (
              <Pressable onPress={() => router.push('/(tabs)/profile')} style={{backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%'}}>
                <View style={{borderRadius: 100, backgroundColor: currentRouteName === 'profile' ? colors.readioOrange : 'transparent', alignItems: 'center', justifyContent: 'center', width: '50%', height: '100%'}}>
                  <IconSymbol size={28} name="person.fill" color={colors.readioWhite}  />
                </View>
              </Pressable>
            )
          }}
        />
          <Tabs.Screen
            name="giant"
            options={{
              title: '',
              // tabBarIcon: ({ color }) => <IconSymbol size={28} name='star.fill' color={color} />,
              tabBarButton: () => (
                <Pressable onPress={() => router.push('/(tabs)/giant')} style={{backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%'}}>
                  <View style={{borderRadius: 100, backgroundColor: currentRouteName === 'giant' ? colors.readioOrange : 'transparent', alignItems: 'center', justifyContent: 'center', width: '50%', height: '100%'}}>
                    <IconSymbol size={28} name='star.fill' color={colors.readioWhite} />
                  </View>
                </Pressable>
              )
            }}

          />

      </Tabs>

      <AnouncmentPopup/>

        <ReadioFloatingPlayer
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 78,
          }}
        />

    </>
  );
}

const AnouncmentPopup = () => {
  
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

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const handleGesture = ({ nativeEvent }: {nativeEvent: any}) => {
    if (nativeEvent.translationX < -50) { // Detect downward swipe
      setShow(false);
    }
    if (nativeEvent.translationX > 50) { // Detect downward swipe
      router.push('/(tabs)/giant');
    }
  };

  return (
    <>
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
            {/* <Pressable
              onPress={() => setShow(!show)}
              style={{
                left: '0%',
                width: 30,
                height: 30,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.readioOrange,
                borderRadius: 100,
                marginBottom: 5,
              }}
            >
              <FontAwesome
                name='close'
                size={15}
                style={{
                  color: colors.readioWhite,
                  borderRadius: 100,
                  fontFamily: readioRegularFont,
                }}
              ></FontAwesome>
            </Pressable> */}
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
                <View
                  style={{
                    width: 45,
                    alignSelf: 'center',
                    height: 45,
                    borderRadius: 100,
                    backgroundColor: colors.readioOrange,
                  }}
                />
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
                    Here for the Giant Steps?
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
                <FontAwesome
                  color={colors.readioWhite}
                  name='arrow-right'
                  style={{ fontSize: 18 }}
                />
              </Pressable>
            </Pressable>
          </Animated.View>
      </PanGestureHandler>
    </>
  );
}