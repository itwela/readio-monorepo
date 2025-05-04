import { filter, unknownTrackImageUri } from "@/constants/images";
import { colors } from "@/constants/tokens";
import { useLotusUtils } from "@/helpers/providers/lotusUtilsContext";
import { useLastActiveTrack } from "@/hooks/useLastActiveTrack";
import { defaultStyles } from "@/styles";
import { RootNavigationProp } from "@/types/type";
import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MovingText } from "./MovingText";
import { PlayPauseButton, SkipToNextButton } from "./ReadioPlayerControls";
import LotusImageWithLoader from "./LotusImageWithLoader";
import { useLotusHaptic } from "@/helpers/providers/lotusHapticProvider";
import { router } from "expo-router";
import { Pressable } from "react-native-gesture-handler";
import TrackPlayer, { useIsPlaying, useActiveTrack, usePlaybackState, State } from "react-native-track-player" // Import usePlaybackState and State

export default function ReadioFloatingPlayer({ style }: any) {
  const navigation = useNavigation<RootNavigationProp>();
  const activeTrack = useActiveTrack();
  const { lastActiveTrack } = useLastActiveTrack();
  const displayedTrack = activeTrack ?? lastActiveTrack;
  const {currentRouteName, setFloatingPlayerIsVisible} = useLotusUtils()
  const { lightFeedback, mediumFeedback, successFeedback } = useLotusHaptic()

  useEffect(() => {
    if (displayedTrack && currentRouteName !== "chat") {
      setFloatingPlayerIsVisible?.(true);
    } else {
      setFloatingPlayerIsVisible?.(false);
    }
  }, [displayedTrack, currentRouteName, setFloatingPlayerIsVisible]);
  

  // Early return if there's no active track
  if (!displayedTrack || lastActiveTrack === undefined) {
    return null;
  }

  // Conditionally render the entire component based on isChatRoute
  if (currentRouteName === "chat") {
    return null; // Return null if on chat route
  }

  const handlePress = () => {
    mediumFeedback();
    router.navigate('/player')
  };



  return (
    <View
      style={[styles.container, style]}
    >

      <Pressable style={{display: 'flex', flexDirection: 'row', width: '71.8%'}} onPress={handlePress}>
      
        <View style={{ position: 'relative', width: 40, height: 40, backgroundColor: "transparent" }}>
          <LotusImageWithLoader source={{ uri: filter }} style={[styles.trackArtworkImage, { zIndex: 1, opacity: 0.4, position: 'absolute' }]} resizeMode='cover' />
          <LotusImageWithLoader
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
      </Pressable>

      <View style={styles.trackControlsContainer}>
        
        <TouchableOpacity onPress={() => {console.log('pressed'); mediumFeedback();}}>
          <PlayPauseButton color={colors.readioWhite} iconSize={24} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => { mediumFeedback();}}>
          <SkipToNextButton color={colors.readioWhite} iconSize={24} />
        </TouchableOpacity>

      </View>

    </View>
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
        paddingVertical: 10,
        justifyContent: 'space-between'
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
        zIndex: 100
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