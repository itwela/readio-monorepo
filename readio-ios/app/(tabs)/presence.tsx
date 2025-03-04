import LotusHeader from "@/components/LotusHeader";
import { colors, readioBoldFont, utilStyle } from "@/constants/tokens";
import React from "react";
import { View, StyleSheet, FlatList, Pressable, Text } from "react-native";
import Animated, { FadeInDown, FadeInUp, FadeOutDown } from "react-native-reanimated";
import { ResizeMode, Video } from 'expo-av';
import { getLocalImageUri, ImageAssets } from "@/constants/imageAssets";
import { LinearGradient } from 'expo-linear-gradient';
import { useLotusPresence } from "@/helpers/providers/lotusPresenceContext";
import { utilsStyles } from "@/styles";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function LotusPresencePage() {

  const {} = useLotusPresence()

  interface Section {
    id: string;
    type: 'display-name' | 'options';
    // data?: LotusArticle[];
  }

  // Create sections for the FlatList with explicit typing
  const sections: Section[] = [
    { id: 'display-name', type: 'display-name' },
    { id: 'options', type: 'options' },
  ];

  const PresenceOptions = () => {

      // Add to StyleSheet
  const optionStyles = StyleSheet.create({
    optionButton: {
      ...utilsStyles.buttonContainer,
      display: 'flex',
      flexDirection: 'row',
      overflow: 'hidden',
      width: '100%',
      alignItems: 'center',
      paddingHorizontal: 16,
      justifyContent: 'space-between'    
    },
    gradientBackground: {
      ...StyleSheet.absoluteFillObject,
      opacity: 0.7,
    },
    icon: {
      marginLeft: 8
    },
    optionText: {
      ...utilsStyles.buttonText,
      color: colors.readioWhite,
      textShadowColor: 'rgba(0,0,0,0.2)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    pressed: {
      opacity: 0.9,
    },
  });

    return (
      <View style={{ gap: 24, paddingHorizontal: 20, marginTop: 40, bottom: 150, alignSelf: 'center', position: 'absolute'}}>
       
        {/* Music Selection */}
        <Animated.View style={{borderRadius: 100,}} entering={FadeInDown.duration(300)}>
          <Pressable
            style={({ pressed }) => [
              optionStyles.optionButton, 
              { backgroundColor: colors.readioBlack }
            ]}
            android_ripple={{ color: colors.readioBrown }}
          >
            <Text style={optionStyles.optionText}>Music</Text>
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3}}>
              <Text style={optionStyles.optionText}>---</Text>
              <MaterialCommunityIcons 
                name="music-circle" 
                size={28} 
                color={colors.readioWhite} 
                style={optionStyles.icon}
              />
            </View>
          </Pressable>
        </Animated.View>
  
        {/* Time Selection */}
        <Animated.View entering={FadeInDown.duration(300).delay(50)}>
          <Pressable
            style={({ pressed }) => [
              optionStyles.optionButton, 
              { backgroundColor: colors.readioBlack }
            ]}
            android_ripple={{ color: colors.readioBrown }}
          >
            <Text style={optionStyles.optionText}>Duration</Text>
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3}}>
              <Text style={optionStyles.optionText}>5 mins</Text>
              <MaterialCommunityIcons 
                name="timer-outline" 
                size={28} 
                color={colors.readioWhite} 
                style={optionStyles.icon}
              />
            </View>
          </Pressable>
        </Animated.View>
  
        {/* Lesson Selection */}
        <Animated.View entering={FadeInDown.duration(300).delay(100)}>
          <Pressable
            style={({ pressed }) => [
              optionStyles.optionButton, 
              { backgroundColor: colors.readioBlack }
            ]}
            android_ripple={{ color: colors.readioBrown }}
          >
            <Text style={optionStyles.optionText}>Guided Lessons</Text>
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3}}>
              <Text style={optionStyles.optionText}>---</Text>
              <MaterialCommunityIcons 
                name="book-open-outline" 
                size={28} 
                color={colors.readioWhite} 
                style={optionStyles.icon}
              />
            </View>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(300).delay(100)}>
          <Pressable
            style={({ pressed }) => [
              optionStyles.optionButton, 
              { backgroundColor: colors.readioOrange, justifyContent: 'center' }
            ]}
            android_ripple={{ color: colors.readioOrange }}
          >
            <Text style={optionStyles.optionText}>Start</Text>
          </Pressable>
        </Animated.View>

      </View>
    );
  };


  return (
    <>
      <LotusHeader backgroundColor={'transparent'} />
      {/* Add video here */}
      <Animated.View 
          // key={stepKey}
          entering={FadeInUp.duration(300)}
          exiting={FadeOutDown.duration(300)}
          style={{ position: 'absolute', width: '100%', height: '100%', zIndex: -1 }}
        >

        {/* TODO Video --- soon to be depreciated migrate to expo-video */}
          <Video
          source={ImageAssets.lotusFlowerPondVidDark}
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isLooping
          isMuted
          rate={0.618}
          style={{ 
            width: '100%', height: '100%',
            opacity: 1
           }}
        />

         {/* Top Gradient */}
         <LinearGradient
            colors={[
              colors.readioBrown, 
              colors.readioBrown,
              'rgba(45, 28, 22, 0.7)',
              'rgba(45, 28, 22, 0)'
            ]}
            locations={[0, 0.5, 0.6, 1]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 0.5 }}
            style={{
              position: 'absolute',
              top: 0,
              width: '100%',
              height: '100%',
              zIndex: 1
            }}
          />
          
          {/* Bottom Gradient */}
          <LinearGradient
            colors={[
              'rgba(45, 28, 22, 0)',
              'rgba(45, 28, 22, 0.7)',
              'rgba(45, 28, 22, 0.7)',
              colors.readioBrown
            ]}
            locations={[0, 0.4, 0.5, 1]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 0.8 }}
            style={{
              position: 'absolute',
              bottom: 0,
              width: '100%',
              height: '100%',
              zIndex: 1
            }}
          />


        </Animated.View>
      <View style={styles.container}>

        <Animated.Text 
          entering={FadeInUp.duration(300)} 
          exiting={FadeOutDown.duration(100)} 
          allowFontScaling={false} 
          style={[styles.bettertittle, {paddingTop: 30}]}
        >
          Presence
        </Animated.Text>

        <PresenceOptions/>

      {/* <FlatList
        data={sections}
        contentContainerStyle={{
          // backgroundColor: 'red'
        }}
        renderItem={({ item }: { item: Section }) => {
          switch (item.type) {
            case 'display-name':
              return (
              );
            case 'options':
              return (
                // <>
                // </>
              );
            default:
              return null;
          }
        }}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      /> */}
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    // alignItems: 'center',
    backgroundColor: 'transparent',
    width: "100%",
    justifyContent: "space-between",
    flex: 1,
  },
  bettertittle: {
    fontSize: 45,
    fontWeight: 'bold',
    fontFamily: readioBoldFont,
    color: colors.readioWhite,
    paddingHorizontal: 20,
  },
});