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
		await TrackPlayer.setQueue(tracks)
		await TrackPlayer.play()
	}

	const handlePause = async () => {
		await TrackPlayer.pause()
	}

	const handleShufflePlay = async () => {
		const shuffledTracks = [...tracks].sort(() => Math.random() - 0.5)

		await TrackPlayer.setQueue(shuffledTracks)
		await TrackPlayer.play()
	}

	return (
		<GestureHandlerRootView>
			<View style={[{ flexDirection: 'row', columnGap: 16 }, style]} {...viewProps}>
				{/* Play button */}
				<Animated.View entering={FadeInUp.duration(800)} exiting={FadeOutDown.duration(800)} style={{ flex: 1 }}>
					<TouchableOpacity onPress={ playing ? handlePause : handlePlay} activeOpacity={0.8} style={styles.button}>
						<Ionicons name={playing  ? 'pause' : 'play'} size={22} color={colors.readioWhite} />

						<Text  allowFontScaling={false} style={styles.buttonText}>{`${playing ? 'Pause' : 'Play'}`}</Text>
					</TouchableOpacity>
				</Animated.View>

				{/* Shuffle button */}
				<Animated.View entering={FadeInUp.duration(700)} exiting={FadeOutDown.duration(700)} style={{ flex: 1 }}>
					<TouchableOpacity onPress={handleShufflePlay} activeOpacity={0.8} style={styles.button}>
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
		backgroundColor: colors.readioOrange,
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
})