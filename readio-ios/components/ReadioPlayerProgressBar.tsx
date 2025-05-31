import { colors, fontSize } from '@/constants/tokens'
import { formatSecondsToMinutes } from '@/helpers/misc'
import { useLotusHaptic } from '@/helpers/providers/lotusHapticProvider'
import { defaultStyles, utilsStyles } from '@/styles'
import { StyleSheet, Text, View, ViewProps } from 'react-native'
import { Slider } from 'react-native-awesome-slider'
import { useSharedValue } from 'react-native-reanimated'
import TrackPlayer, { useProgress } from 'react-native-track-player'

interface PlayerProgressBarProps extends ViewProps {
	bookmarkPosition?: number; // Bookmark position in seconds
}

export const PlayerProgressBar = ({ style, bookmarkPosition }: PlayerProgressBarProps) => {
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
			<View style={styles.sliderContainer}>
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
				
				{/* Bookmark indicator */}
				{bookmarkPosition !== undefined && duration > 0 && (
					<View 
						style={[
							styles.bookmarkIndicator,
							{ 
								left: `${(bookmarkPosition / duration) * 100}%`,
							}
						]}
					>
						<View style={styles.bookmarkDot} />
					</View>
				)}
			</View>

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
		position: 'relative',
		paddingVertical: 8,
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
	bookmarkIndicator: {
		position: 'absolute',
		top: 6,
		bottom: 6,
		justifyContent: 'center',
		pointerEvents: 'none',
		marginLeft: -4, // Center the dot
	},
	bookmarkDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: colors.readioOrange,
		borderWidth: 2,
		borderColor: colors.readioWhite,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.3,
		shadowRadius: 2,
		elevation: 3,
	},
})