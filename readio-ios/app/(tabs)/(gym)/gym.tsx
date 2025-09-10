import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { useSharedValue, FadeIn, FadeInDown, FadeOut, FadeInUp, FadeOutDown, useAnimatedReaction, useAnimatedStyle, withTiming, FadeOutUp } from "react-native-reanimated";
import LotusImageWithLoader from "@/components/LotusImageWithLoader";
import { getLocalImageUri } from "@/constants/imageAssets";
import { colors, readioBoldFont, readioRegularFont } from "@/constants/tokens";
import { LotusPageDisplayName } from "@/components/LotusPageDisplayName";
import { LotusGymMainContainer } from "@/components/LotusGymMainContainer";
import { useRevenueCat } from "@/helpers/providers/RevenueCatProvider";
import { useLotusUser } from "@/helpers/providers/lotusUserContext";

export default function GymScreen() {

  const {subscribeToLotus} = useRevenueCat();
  const { userIsSubscribed } = useLotusUser()


  const goToGiantPage = () => {
    router.push('/(tabs)/giant');
  }

  const styles = StyleSheet.create({
    mainContainer: {
      flexDirection: 'column',
      justifyContent: 'flex-start',
      paddingTop: 100,
      alignItems: 'center',
      width: '100%',
      height: '100%',
      // backgroundColor: 'red',
      gap: 10,
    },
    explainerText: {
      color: colors.readioWhite + 'CC',
      fontSize: 16,
      fontFamily: readioRegularFont,
      textAlign: 'center',
      marginTop: 10,
      marginBottom: 20,
      paddingHorizontal: 20,
      lineHeight: 22,
    },
  });

  return (
    <View style={{ backgroundColor: colors.readioBrown, height: '100%', width: '100%' }}>
    
    {/* <LinearGradient
      colors={[colors.readioBrown, 'transparent']}
      style={{
        zIndex: -1,
        position: 'absolute',
        width: '100%',
        height: '80%',
        opacity: 0.618
      }}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    />

    <Animated.View style={{ zIndex: -2, opacity: 1, position: 'absolute', width: '100%', height: '100%', }} entering={FadeIn.duration(600)} exiting={FadeOut.duration(600)}>

      <LotusImageWithLoader
        source={{
          uri: getLocalImageUri("manDrinkWater"),
        }}
        style={{ zIndex: -3, position: 'absolute', width: '100%', height: '100%', backgroundColor: colors.readioBrown }}
        resizeMode="cover"
      />

    </Animated.View>

    <LinearGradient
        colors={[
          '#272121',
          '#272121',
          '#27212180',  // Semi-transparent version of #272121 (50% opacity)
          'transparent',
          'transparent',
          'transparent',
          'transparent',
        ]}
        style={{
          zIndex: -1,
          bottom: '0%',
          position: 'absolute',
          width: '150%',
          height: 1000,
          transform: [{ rotate: '-180deg' }]
        }}
        start={{ x: 0.5, y: -0.06 }}
        end={{ x: 0.5, y: 1.3 }}
      /> */}

    {/* NOTE - GYM PAGE */}
    <View style={styles.mainContainer}>

      <LotusPageDisplayName title="GYM" />

      <View/>
      
      {/* <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <Text allowFontScaling={false} style={styles.explainerText}>
          Track your workouts with interval timers and monitor your daily steps with Giant Steps.
        </Text>
      </View> */}

      {/* INTERVAL TIMER */}
      <LotusGymMainContainer
        title="Interval Timer"
        subTitle="From Workouts to Workflows, Set it and Get it!"
        icon="clock"
        link="timer"
        userIsSubscribed={userIsSubscribed as boolean}
        subscribeToLotus={subscribeToLotus}
      />
      {/* GIANTS STEPS */}
      <LotusGymMainContainer
        title="Giant Steps"
        subTitle="Walk, Run, Make Every Step Count."
        icon="shoeprints.fill"
        link="giant"
        userIsSubscribed={userIsSubscribed as boolean}
        subscribeToLotus={subscribeToLotus}
      />

    </View>
    </View>
  );
}   