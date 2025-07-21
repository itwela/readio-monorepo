import { colors, readioRegularFont } from "@/constants/tokens";
import { useLotusAnnouncement } from "@/helpers/providers/lotusAnnouncementProvider";
import { useLotusUtils } from '@/helpers/providers/lotusUtilsContext';
import { useLastActiveTrack } from '@/hooks/useLastActiveTrack';
import { FontAwesome } from '@expo/vector-icons';
import { router } from "expo-router";
import { default as React, useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useActiveTrack } from 'react-native-track-player';

interface AnnouncementPopupProps {
    title?: string;
    description?: string;
  }
  

export const AnnouncementPopup = ({
    title = "Here for Giant Steps?", 
    description = "Press \"go\" to get started!" 
}: AnnouncementPopupProps) => {

    const { showAnnouncement, setShowAnnouncement } = useLotusAnnouncement();
    const { currentRouteName } = useLotusUtils();
  
    if (currentRouteName === 'giant' || currentRouteName === 'timer' || currentRouteName === '(gym)' || currentRouteName === 'sign-in' || currentRouteName === 'sign-up') {
      return null;
    }
  
    const activeTrack = useActiveTrack();
    const lastActiveTrack = useLastActiveTrack();
    const displayedTrack = activeTrack ?? lastActiveTrack;
  
    const opacity = useSharedValue(1);
  
    useEffect(() => {
        if (!showAnnouncement) {
        opacity.value = withTiming(0, { duration: 300 });
        } else {
        opacity.value = withTiming(1, { duration: 300 });
        }
    }, [showAnnouncement]);
  
    // Automatically hide after 5 seconds
    useEffect(() => {
        const timer = setTimeout(() => setShowAnnouncement(false), 5000); 
        return () => clearTimeout(timer);
    }, []);
  
    const animatedStyle = useAnimatedStyle(() => {
      return {
        opacity: opacity.value,
      };
    });
  
    const handleGesture = ({ nativeEvent }: { nativeEvent: any }) => {
      if (nativeEvent.translationX < -50) {
        setShowAnnouncement(false); // Hide on swipe left
      }
      if (nativeEvent.translationX > 50) {
        router.push('/(tabs)/giant'); // Navigate on swipe right
      }
    };
  
    if (!showAnnouncement) return null;
  
    return (
      <PanGestureHandler onGestureEvent={handleGesture}>
        <Animated.View
          style={[
            animatedStyle,
            {
              position: 'absolute',
              top: 130,
              width: '90%',
              alignSelf: 'center',
              zIndex: 50,
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
                gap: 10,
              }}
            >
              <Pressable
                onPress={() => setShowAnnouncement(false)}
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

            <View>
              <Text  allowFontScaling={false} style={{ fontWeight: 'bold', fontFamily: readioRegularFont }}>
                {title}
              </Text>
              <Text>{description}</Text>
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