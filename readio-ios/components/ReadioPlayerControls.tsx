import { TouchableOpacity, View, ViewStyle, Text, StyleSheet, TextStyle, ActivityIndicator, Pressable } from "react-native"
import TrackPlayer, { useIsPlaying, usePlaybackState, State } from "react-native-track-player" // Import usePlaybackState and State
import { FontAwesome, FontAwesome6 } from "@expo/vector-icons"
import { colors } from "@/constants/tokens"
import { useLotusHaptic } from "@/helpers/providers/lotusHapticProvider"
import React from "react"
import { useLastActiveTrack } from "@/hooks/useLastActiveTrack" // Import useLastActiveTrack

type PlayerControlsProps = {
    style?: ViewStyle
}

type PlayerButtonProps = {
    style?: ViewStyle,
    iconSize?: number,
    color?: string,
    backgroundColor?: string,
}


export const PlayerControls = ({ style }: PlayerControlsProps) => {
	
    
    
    return (
		<View style={[styles.container, style]}>
			<View style={styles.row}>
				<SkipToPreviousButton iconSize={25}  color={colors.readioOrange} />

				<PlayPauseButton iconSize={35} backgroundColor={colors.readioOrange} color={colors.readioWhite} />

				<SkipToNextButton iconSize={25} color={colors.readioOrange} />
			</View>
		</View>
	)
}


export const PlayPauseButton = ({style, iconSize, color, backgroundColor}: PlayerButtonProps) => {
    const {playing} = useIsPlaying()
    const { state: playbackState } = usePlaybackState(); // Get the detailed playback state
    const { lastActiveTrack } = useLastActiveTrack(); // Get the last active track

    const { lightFeedback, mediumFeedback, successFeedback, errorFeedback, playbackControl } = useLotusHaptic()

    // Determine if the player is in a loading/buffering state
    const isLoading = playbackState === State.Buffering;

    const handlePlay = async () => {
        playbackControl();
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
        playbackControl();
        console.log("pause")
        await TrackPlayer.pause()
    }

    return (
        <>
        <Pressable onPress={() => {playing ? handlePause() : handlePlay()} }>
            <View
                style={{
                    backgroundColor: backgroundColor || 'transparent',
                    borderRadius: 100,
                    width: backgroundColor ? (iconSize || 0) + 20 : iconSize, // Ensure iconSize is treated as number
                    // height: iconSize,
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 4,
                    transform: [{ scale: 1 }],
                }}
            >
              {isLoading ? (
                    // Show ActivityIndicator when loading
                    <ActivityIndicator size={iconSize || "small"} color={color || colors.readioWhite} style={{ padding: backgroundColor ? 10 : 0 }} />
                ) : (
                    // Show Play/Pause icon when not loading
                    <FontAwesome
                        name={playing ? 'pause' : 'play'}
                        size={iconSize}
                        color={color}
                        style={{
                            marginLeft: playing ? 0 : 3,
                            padding: backgroundColor ? 10 : 0
                        }}
                    />
                )}
            </View>
        </Pressable>
        </>
        // <View style={[style]}>
        // </View>
    )
}

export const SkipToNextButton = ({iconSize, color}: PlayerButtonProps) => {

    const { playbackControl, lightFeedback, mediumFeedback, successFeedback, errorFeedback } = useLotusHaptic()

    const handleSkipToNext = async () => {
            playbackControl();
            console.log("skip to next pressed");

            try {
                const currentTrackIndex = await TrackPlayer.getActiveTrackIndex();
                const queue = await TrackPlayer.getQueue();
                const repeatMode = await TrackPlayer.getRepeatMode();

                // Check if skipping is possible (index exists and queue exists)
                if (currentTrackIndex == null || queue.length === 0) {
                    console.log("Cannot skip next: No active track or queue is empty.");
                    return;
                }

                const isLastTrack = currentTrackIndex === queue.length - 1;

                // If it's the last track and repeat mode is OFF, maybe stop or do nothing?
                // For now, let's allow skipToNext to handle the end-of-queue behavior.
                // If repeat mode is QUEUE and it's the last track, skipToNext should wrap around.
                // If repeat mode is TRACK, skipToNext should still go to the next logical track.

                await TrackPlayer.skipToNext();
                console.log("Skipped to next track.");

            } catch (error) {
                console.error("Error skipping to next track:", error);
                // Handle specific errors if needed, e.g., queue ended error
            }
        }

    return (
        <View>
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleSkipToNext}
                style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 100,
                    width: iconSize || 25 * 1.5,
                    height: iconSize || 25 * 1.5,
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    elevation: 2,
                    transform: [{ scale: 1 }]
                }}
            >
                <FontAwesome6 
                    name='forward' 
                    size={iconSize} 
                    color={color}
                    style={{ opacity: 0.9 }}
                />
                </TouchableOpacity>
        </View>
    )
}

export const SkipToPreviousButton = ({iconSize, color}: PlayerButtonProps) => {
    
    const { playbackControl, lightFeedback, mediumFeedback, successFeedback, errorFeedback } = useLotusHaptic()

    const handleSkipToPrevious = async () => {
        playbackControl();
        console.log("skip to previous pressed");

        const RESTART_THRESHOLD_SECONDS = 3; // Restart current track if position > this

        try {
            const position = await TrackPlayer.getProgress().then(p => p.position);
            const currentTrackIndex = await TrackPlayer.getActiveTrackIndex();

            // If playback position is past the threshold, or if it's the first track, restart current track
            if (position > RESTART_THRESHOLD_SECONDS || currentTrackIndex === 0) {
                console.log("Restarting current track.");
                await TrackPlayer.seekTo(0);
            }
            // Otherwise, skip to the actual previous track
            else {
                 // Check if skipping is possible (index exists and is not the first track)
                if (currentTrackIndex == null || currentTrackIndex <= 0) {
                    console.log("Cannot skip previous: At the beginning or no active track.");
                    await TrackPlayer.seekTo(0); // Seek to 0 as a fallback
                    return;
                }
                console.log("Skipping to previous track.");
                await TrackPlayer.skipToPrevious();
            }
        } catch (error) {
            console.error("Error skipping to previous track:", error);
        }
    }

    return (
        <View>
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleSkipToPrevious}
                style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 100,
                    width: iconSize || 25 * 1.5,
                    height: iconSize || 25 * 1.5,
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    elevation: 2,
                    transform: [{ scale: 1 }]
                }}
            >
                <FontAwesome6 
                    name='backward' 
                    size={iconSize} 
                    color={color}
                    style={{ opacity: 0.9 }}
                />
                </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
	container: {
		width: '100%',
	},
	row: {
		flexDirection: 'row',
		justifyContent: 'space-evenly',
		alignItems: 'center',
	},
	playerControlPlayButton: {
		color: '#fff',
	},
	controlButton: {
		borderRadius: 100,
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: '#000',
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
		shadowColor: '#000',
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
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
		elevation: 2,
		transform: [{ scale: 1 }],
		backgroundColor: 'rgba(255, 255, 255, 0.1)'
	}
})