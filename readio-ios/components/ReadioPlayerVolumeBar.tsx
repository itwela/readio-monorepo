import { colors } from '@/constants/tokens'
import { utilsStyles } from '@/styles'
import { Ionicons } from '@expo/vector-icons'
import { View, ViewProps } from 'react-native'
import { Slider } from 'react-native-awesome-slider'
import { useSharedValue } from 'react-native-reanimated'
import { useTrackPlayerVolume } from '@/hooks/useTrackPlayerVolume'
import TrackPlayer from 'react-native-track-player'
import { useEffect, useState } from 'react'
import { useLotusHaptic } from '@/helpers/providers/lotusHapticProvider'
export const PlayerVolumeBar = ({ style, customScrollerColor, customScorllerBackground }: {style?: ViewProps, customScrollerColor?: string, customScorllerBackground? : string}) => {
	const { volume, updateVolume } = useTrackPlayerVolume()
	const [fetchedVolume, setFetchedVolume] = useState<number | undefined>(undefined)

	const progress = useSharedValue(0)
	const min = useSharedValue(0)
	const max = useSharedValue(1)
    const { lightFeedback, mediumFeedback, successFeedback, errorFeedback } = useLotusHaptic()

	useEffect(() => {
		const handleGetCurrentVolume = async () => {
			const currentVolume = await TrackPlayer.getVolume()
			setFetchedVolume(currentVolume)
		}
		handleGetCurrentVolume()
	}), [volume]

	progress.value = fetchedVolume ?? 0

	return (
		<View style={style}>
			<View style={{ flexDirection: 'row', alignItems: 'center' }}>
				<Ionicons name="volume-low" size={20} color={customScrollerColor || colors.icon} style={{ opacity: 0.8 }} />

				<View style={{ flex: 1, flexDirection: 'row', paddingHorizontal: 10 }}>
					<Slider
						progress={progress}
						minimumValue={min}
						containerStyle={utilsStyles.slider}
						onValueChange={(value) => {
							updateVolume(value);
							lightFeedback();
						}}
						renderBubble={() => null}
						theme={{
							maximumTrackTintColor: customScorllerBackground || colors.maximumTrackTintColor,
							minimumTrackTintColor: customScrollerColor || colors.minimumTrackTintColor,
						}}
						thumbWidth={0}
						maximumValue={max}
					/>
				</View>

				<Ionicons name="volume-high" size={20} color={customScrollerColor || colors.icon} style={{ opacity: 0.8 }} />
			</View>
		</View>
	)
}