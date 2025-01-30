import { filter, unknownTrackImageUri } from "@/constants/images";
import { defaultStyles } from "@/styles";
import { TouchableOpacity, StyleSheet, View, Text, Image } from "react-native";
import { Track, useActiveTrack } from "react-native-track-player";
import { PlayPauseButton, SkipToNextButton } from "./ReadioPlayerControls";
import { useLastActiveTrack } from "@/hooks/useLastActiveTrack";
import { MovingText } from "./MovingText";
import { useRouter } from "expo-router";
import { useNavigation, useRoute } from "@react-navigation/native";
import { RootNavigationProp } from "@/types/type";
import { colors } from "@/constants/tokens";
import { useState, useEffect } from "react";
import { getFocusedRouteNameFromRoute } from '@react-navigation/native'; // Import this
import { useReadio } from "@/constants/readioContext";

export default function ReadioFloatingPlayer({ style }: any) {
  const navigation = useNavigation<RootNavigationProp>();
  const activeTrack = useActiveTrack();
  const lastActiveTrack = useLastActiveTrack();
  const displayedTrack = activeTrack ?? lastActiveTrack;
  const {currentRouteName, setCurrentRouteName, needsToRefresh, setNeedsToRefresh} = useReadio()

  


  // useEffect(() => {
  //   let isMounted = true; // Flag to track whether the component is still mounted

  //   const unsubscribe = navigation.addListener('state', () => {
  //     const routeName = getFocusedRouteNameFromRoute(route) ?? 'Home';
  //     setCurrentRouteName?.(routeName);
  //     console.log("Current Route:", routeName);
  //   });


  //   return () => {
  //     isMounted = false; // Set the flag to false when the component unmounts
  //     // unsubscribe
  //   };
  // }, [navigation, route]); 

  // Early return if there's no active track
  if (!displayedTrack) {
    return null;
  }

  // Conditionally render the entire component based on isChatRoute
  if (currentRouteName === "chat") {
    return null; // Return null if on chat route
  }

  const handlePress = () => {
    navigation.navigate("player");
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.9}
      style={[styles.container, style]}
    >
      <View style={{ position: 'relative', width: 40, height: 40, backgroundColor: "transparent" }}>
        <Image source={{ uri: filter }} style={[styles.trackArtworkImage, { zIndex: 1, opacity: 0.4, position: 'absolute' }]} resizeMode='cover' />
        <Image
          source={{ uri: displayedTrack?.image ?? unknownTrackImageUri }}
          style={styles.trackArtworkImage}
        />
      </View>

      <View style={styles.trackTitleContainer}>
        <MovingText
          style={styles.trackTitle}
          text={displayedTrack?.title ?? ''}
          animationThreshold={25}
        />
        <Text style={styles.trackArtistText}>{displayedTrack?.artist}</Text>
      </View>

      <View style={styles.trackControlsContainer}>
        <PlayPauseButton color={colors.readioWhite} iconSize={24} />
        <SkipToNextButton color={colors.readioWhite} iconSize={24} />
      </View>
    </TouchableOpacity>
  );
}

// ... styles

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.readioBrown,
        padding: 8,
        borderRadius: 12,
        paddingVertical: 10
    },
    trackTitleContainer: {
        flex: 1,
        overflow: 'hidden',
        marginLeft: 10,
        height: 40,
        justifyContent: 'flex-start',
    },
    trackControlsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 20,
        marginRight: 16,
        paddingLeft: 16,
    },
    trackArtworkImage: {
        width: 40,
        height: 40,
        borderRadius: 8,
    },
    trackTitle: {
        // ...defaultStyles.text,
        fontSize: 18,
        fontWeight: '600',
        color: colors.readioWhite,
    },
    trackArtistText: {
		...defaultStyles.text,
		fontSize: 14,
        color: colors.readioWhite,
	},
})