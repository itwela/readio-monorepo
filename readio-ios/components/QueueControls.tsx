import { colors } from '@/constants/tokens'
import { defaultStyles } from '@/styles'
import { Ionicons } from '@expo/vector-icons'
import { StyleSheet, Text, View, ViewProps } from 'react-native'
import { TouchableOpacity } from 'react-native'
import TrackPlayer from 'react-native-track-player'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { LotusArticle } from '@/types/type'
import { readioRegularFont, readioBoldFont } from '@/constants/tokens';
import { Track } from 'react-native-track-player'
import { useState } from 'react'
import { useIsPlaying } from 'react-native-track-player'
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated'
import { useLotusHaptic } from '@/helpers/providers/lotusHapticProvider'
import { usePlaybackState, State } from 'react-native-track-player'; // Import state hooks
import { useLastActiveTrack } from "@/hooks/useLastActiveTrack" // Import useLastActiveTrack

type QueueControlsProps = {
	tracks: LotusArticle[]
} & ViewProps

export const QueueControls = ({ tracks, style, ...viewProps }: QueueControlsProps) => {
	
	const { playing } = useIsPlaying()
	const { state: playbackState } = usePlaybackState(); // Get current playback state
	const {lightFeedback, mediumFeedback, successFeedback} = useLotusHaptic();
    const { lastActiveTrack } = useLastActiveTrack(); // Get the last active track

	const handlePlay = async () => {
        console.log("play pressed, state:", playbackState);

        // Do nothing if already playing or in transition states
        if (playbackState === State.Playing || playbackState === State.Buffering || playbackState === State.Loading) {
            console.log("Player is already active or transitioning. No action taken.");
            return;
        }

        const isEnded = playbackState === State.Ended;
        const isStopped = playbackState === State.Stopped;
        const isPaused = playbackState === State.Paused;
        const isReady = playbackState === State.Ready; // Added Ready state check

        try {
            const queue = await TrackPlayer.getQueue();
            const currentTrackIndex = await TrackPlayer.getActiveTrackIndex();

            // 1. Resume if Paused
            if (isPaused) {
                console.log("Resuming playback.");
                await TrackPlayer.play();
            }
            // 2. Handle Ended or Stopped states
            else if (isEnded || isStopped) {
                // 2a. Queue has tracks -> Restart queue
                if (queue.length > 0) {
                    console.log("Restarting queue from beginning.");
                    await TrackPlayer.skip(0);
                    await TrackPlayer.play();
                // 2b. Queue empty, but lastActiveTrack exists -> Replay last track
                } else if (lastActiveTrack) {
                    console.log("Queue empty, replaying last active track:", lastActiveTrack.title);
                    await TrackPlayer.reset(); // Clear end-of-queue state
                    await TrackPlayer.add(lastActiveTrack);
                    await TrackPlayer.play();
                // 2c. Queue empty, no last track -> Do nothing
                } else {
                    console.log("Player stopped/ended, queue empty, no last track. Cannot play.");
                }
            }
            // 3. Handle Ready state (or potentially others like Idle)
            else if (isReady || playbackState === State.None || playbackState === undefined) {
                 // 3a. Queue has tracks -> Start playing queue
                 if (queue.length > 0) {
                    console.log("Player ready, starting queue.");
                    // If there's a valid index, play might resume from there, otherwise skipTo(0) ensures start.
                    if (currentTrackIndex == null) {
                        await TrackPlayer.skip(0);
                    }
                    await TrackPlayer.play();
                 // 3b. No queue, but lastActiveTrack exists -> Play last track
                 } else if (lastActiveTrack) {
                    console.log("Player ready, no queue, playing last active track:", lastActiveTrack.title);
                    await TrackPlayer.reset();
                    await TrackPlayer.add(lastActiveTrack);
                    await TrackPlayer.play();
                 // 3c. No queue, no last track -> Do nothing
                 } else {
                    console.log("Player ready, but no queue or last track. Cannot play.");
                 }
            }
             else {
                // Fallback for any other unexpected state - try to play
                console.log(`Unexpected state (${playbackState}), attempting TrackPlayer.play()`);
                await TrackPlayer.play();
            }
        } catch (error) {
            console.error("Error handling play:", error);
            // Fallback or error handling if needed
            // Consider if attempting play() again is wise or if error feedback is better
        }
    }

	const handlePause = async () => {
		mediumFeedback();
		await TrackPlayer.pause()
	}

	const handleShufflePlay = async () => {
		lightFeedback();
		const shuffledTracks = [...tracks].sort(() => Math.random() - 0.5)

		await TrackPlayer.setQueue(shuffledTracks as any)
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