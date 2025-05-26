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
		try {
			playbackControl();

			// Validate playback state
			if (playbackState === State.Playing || 
				playbackState === State.Buffering || 
				playbackState === State.Loading) {
				// TODO Player is already active, current state:
				console.warn('Player is already active, current state:', playbackState);
				return;
			}

			// Reset player with error handling
			try {
				await TrackPlayer.reset();
			} catch (error) {
				// TODO Failed to reset player:
				console.error('Failed to reset player:', error);
				return;
			}

			// Validate and play tracks
			if (Array.isArray(tracks) && tracks.length > 0) {
				// Filter out invalid tracks
				const validTracks = tracks.filter(track => 
					track && 
					track.url && 
					typeof track.url === 'string' && 
					track.url.length > 0
				);

				// TODO Check if valid tracks are found
				if (validTracks.length === 0) {
					console.warn('No valid tracks found in queue');
					return;
				}

				try {
					await TrackPlayer.add(validTracks);
					await TrackPlayer.play();
				} catch (error) {
					// TODO Failed to add or play tracks:
					console.error('Failed to add or play tracks:', error);
				}
			}
			// Try last active track if no valid tracks
			else if (lastActiveTrack && lastActiveTrack.url) {
				try {
					await TrackPlayer.add(lastActiveTrack);
					await TrackPlayer.play();
				} catch (error) {
					// TODO Failed to play last active track:
					console.error('Failed to play last active track:', error);
				}
			}
			// No valid tracks available
			else {
				// TODO No playable tracks available
				console.warn('No playable tracks available');
			}
		} catch (error) {
			// TODO Unexpected error in handlePlay:
			console.error('Unexpected error in handlePlay:', error);
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
