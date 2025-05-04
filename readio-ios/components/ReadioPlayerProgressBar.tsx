import { colors, fontSize } from '@/constants/tokens'
import { formatSecondsToMinutes } from '@/helpers/misc'
import { useLotusHaptic } from '@/helpers/providers/lotusHapticProvider'
import { defaultStyles, utilsStyles } from '@/styles'
import { StyleSheet, Text, View, ViewProps } from 'react-native'
import { Slider } from 'react-native-awesome-slider'
import { useSharedValue } from 'react-native-reanimated'
import TrackPlayer, { useProgress } from 'react-native-track-player'

export const PlayerProgressBar = ({ style }: ViewProps) => {
	const { duration, position } = useProgress(250)

	const isSliding = useSharedValue(false)
	const progress = useSharedValue(0)
	const min = useSharedValue(0)
	const max = useSharedValue(1)

	const trackElapsedTime = formatSecondsToMinutes(position)
	const trackRemainingTime = formatSecondsToMinutes(duration - position)

	const { lightFeedback, mediumFeedback, successFeedback, errorFeedback } = useLotusHaptic()

	if (!isSliding.value) {
		progress.value = duration > 0 ? position / duration : 0
	}

	return (
		<View style={style}>
			<Slider
				progress={progress}
				minimumValue={min}
				maximumValue={max}
				containerStyle={utilsStyles.slider}
				thumbWidth={0}
				renderBubble={() => null}
				theme={{
					minimumTrackTintColor: colors.minimumTrackTintColor,
					maximumTrackTintColor: colors.maximumTrackTintColor,
				}}
				onSlidingStart={() => (isSliding.value = true)}
				onValueChange={async (value) => {
					await TrackPlayer.seekTo(value * duration)
				}}
				onSlidingComplete={async (value) => {
					// if the user is not sliding, we should not update the position
					if (!isSliding.value) return;

					isSliding.value = false;

					await TrackPlayer.seekTo(value * duration);

					lightFeedback();

				}}
			/>

			<View style={styles.timeRow}>
				<Text allowFontScaling={false} style={styles.timeText}>{trackElapsedTime}</Text>

				<Text allowFontScaling={false} style={styles.timeText}>
					{'-'} {trackRemainingTime}
				</Text>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	timeRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'baseline',
		marginTop: 20,
		paddingHorizontal: 4,
	},
	timeText: {
		...defaultStyles.text,
		color: colors.readioBlack,
		opacity: 0.6,
		fontSize: fontSize.xs,
		letterSpacing: 0.7,
		fontWeight: '600',
		textTransform: 'uppercase',
	},
	sliderContainer: {
		paddingVertical: 8,
		backgroundColor: 'rgba(255, 255, 255, 0.1)',
		borderRadius: 12,
	},
	sliderTrack: {
		height: 4,
		borderRadius: 2,
		backgroundColor: colors.maximumTrackTintColor,
	},
	sliderThumb: {
		width: 12,
		height: 12,
		borderRadius: 6,
		backgroundColor: colors.minimumTrackTintColor,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 3,
		elevation: 2,
	},
})