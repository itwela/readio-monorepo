import React from 'react'
import { colors } from '@/constants/tokens'
import { defaultStyles } from '@/styles'
import { Ionicons } from '@expo/vector-icons'
import { StyleSheet, Text, View, ViewProps } from 'react-native'
import { useLotusPlayTracking } from '@/helpers/providers/lotusPlayTrackingProvider'
import { TouchableOpacity } from 'react-native'
import TrackPlayer from 'react-native-track-player'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { LotusTrack } from '@/types/type'
import { readioRegularFont, readioBoldFont } from '@/constants/tokens';
import { Track } from 'react-native-track-player'
import { useState } from 'react'
import { useIsPlaying } from 'react-native-track-player'
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated'
import { useLotusHaptic } from '@/helpers/providers/lotusHapticProvider'
import { usePlaybackState, State } from 'react-native-track-player'; // Import state hooks
import { useLastActiveTrack } from "@/hooks/useLastActiveTrack" // Import useLastActiveTrack

type QueueControlsProps = {
	tracks: LotusTrack[]
} & ViewProps

export const QueueControls = ({ tracks, style, ...viewProps }: QueueControlsProps) => {
	const { setupListeners } = useLotusPlayTracking()
	const { playing } = useIsPlaying()

	React.useEffect(() => {
		const cleanup = setupListeners()
		return cleanup
	}, [setupListeners])
	
	const { state: playbackState } = usePlaybackState(); // Get current playback state
	const {lightFeedback, mediumFeedback, playbackControl, successFeedback} = useLotusHaptic();
    const { lastActiveTrack, clearLastActiveTrack, setLastActiveTrack } = useLastActiveTrack(); // Get the last active track

	const handlePlay = async () => {
		playbackControl();
        // console.log("[QueueControls] Play pressed. Current playbackState:", playbackState);

        // Do nothing if already playing or in transition states
        if (playbackState === State.Playing || playbackState === State.Buffering || playbackState === State.Loading) {
            // console.log("[QueueControls] Player is already active (Playing/Buffering/Loading). No action taken.");
            return;
        }

        try {
            // console.log("[QueueControls] Resetting player...");
            await TrackPlayer.reset(); // Reset player state and clear queue

            // After reset, decide what to play:
            // Option 1: Prioritize the 'tracks' prop for the queue controls
            if (tracks && tracks.length > 0) {
                // console.log("[QueueControls] Adding provided tracks to queue and playing from start.");
                await TrackPlayer.add(tracks); // Add the full list of tracks for this queue
                await TrackPlayer.play();
            }
            // Option 2: Fallback to lastActiveTrack if 'tracks' prop is empty or not provided
            else if (lastActiveTrack) {
                // console.log("[QueueControls] No tracks in prop. Replaying last active track:", lastActiveTrack.title);
                // It's good practice to clear the lastActiveTrack from storage if you're now actively playing it,
                // to prevent potential stale state if the app closes unexpectedly right after.
                // However, the useLastActiveTrack hook might handle this internally based on player events.
                // For now, let's assume clearLastActiveTrack is for when it's truly "done" with.
                // If you want to ensure it's cleared from the hook's state before re-adding:
                // await clearLastActiveTrack(); 
                await TrackPlayer.add(lastActiveTrack);
                await TrackPlayer.play();
            }
            // Option 3: Nothing to play
            else {
                // console.log("[QueueControls] Player reset, but no tracks in prop and no last active track. Cannot play.");
            }
        } catch (error) {
            console.error("[QueueControls] Error handling play (after reset):", error);
        }
    }

	const handlePause = async () => {
		playbackControl();
		await TrackPlayer.pause()
	}

	const handleShufflePlay = async () => {
		playbackControl();
		const shuffledTracks = [...tracks].sort(() => Math.random() - 0.5)

		await TrackPlayer.setQueue(shuffledTracks)
		await TrackPlayer.play()
	}

	return (
		<GestureHandlerRootView>
			<View style={[{ flexDirection: 'row', columnGap: 16 }, style]} {...viewProps}>
				{/* Play button */}
				<Animated.View entering={FadeInUp.duration(800)} exiting={FadeOutDown.duration(800)} style={{ flex: 1 }}>
					<TouchableOpacity onPress={ playing ? handlePause : handlePlay} activeOpacity={0.8} style={[styles.playPauseButton, styles.button]}>
						<Ionicons name={playing  ? 'pause' : 'play'} size={22} color={colors.readioWhite} />

						<Text  allowFontScaling={false} style={styles.buttonText}>{`${playing ? 'Pause' : 'Play'}`}</Text>
					</TouchableOpacity>
				</Animated.View>

				{/* Shuffle button */}
				<Animated.View entering={FadeInUp.duration(700)} exiting={FadeOutDown.duration(700)} style={{ flex: 1 }}>
					<TouchableOpacity onPress={handleShufflePlay} activeOpacity={0.8} style={[styles.playPauseButton, styles.button]}>
						<Ionicons name={'shuffle-sharp'} size={24} color={colors.readioWhite} />

						<Text  allowFontScaling={false} style={styles.buttonText}>Shuffle</Text>
					</TouchableOpacity>
				</Animated.View>
			</View>
		</GestureHandlerRootView>
	)
}

const styles = StyleSheet.create({
	button: {
		padding: 12,
		backgroundColor: colors.readioBlack,
		borderRadius: 10,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		columnGap: 8,
	},
	buttonText: {
		...defaultStyles.text,
		color: colors.readioWhite,
		fontWeight: '600',
		fontSize: 20,
		textAlign: 'center',
		fontFamily: readioRegularFont
	},
	controlButton: {
		borderRadius: 100,
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: colors.readioWhite,
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
		elevation: 2,
		transform: [{ scale: 1 }]
	},
	playPauseButton: {
		borderRadius: 100,
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: colors.readioWhite,
		transform: [{ scale: 1 }],
        shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 4,
		elevation: 4
	},
	skipButton: {
		borderRadius: 100,
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: colors.readioWhite,
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
		elevation: 2,
		transform: [{ scale: 1 }],
		backgroundColor: 'rgba(255, 255, 255, 0.1)'
	},
})
