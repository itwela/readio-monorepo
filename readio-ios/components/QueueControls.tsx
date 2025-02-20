import { colors } from '@/constants/tokens'
import { defaultStyles } from '@/styles'
import { Ionicons } from '@expo/vector-icons'
import { StyleSheet, Text, View, ViewProps } from 'react-native'
import { TouchableOpacity } from 'react-native'
import TrackPlayer from 'react-native-track-player'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Readio } from '@/types/type'
import { readioRegularFont, readioBoldFont } from '@/constants/tokens';
import { Track } from 'react-native-track-player'
import { useState } from 'react'
import { useIsPlaying } from 'react-native-track-player'
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated'

type QueueControlsProps = {
	tracks: Readio[]
} & ViewProps

export const QueueControls = ({ tracks, style, ...viewProps }: QueueControlsProps) => {
	
	const { playing } = useIsPlaying()

	const handlePlay = async () => {
		await TrackPlayer.setQueue(tracks as any)
		await TrackPlayer.play()
	}

	const handlePause = async () => {
		await TrackPlayer.pause()
	}

	const handleShufflePlay = async () => {
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