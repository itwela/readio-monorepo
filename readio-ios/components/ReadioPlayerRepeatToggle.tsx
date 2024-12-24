import { colors } from '@/constants/tokens'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { ComponentProps } from 'react'
import { RepeatMode } from 'react-native-track-player'
import { match } from 'ts-pattern'
import { useTrackPlayerRepeatMode } from '@/hooks/useTrackPlayerRepeatMode'
type IconProps = Omit<ComponentProps<typeof MaterialCommunityIcons>, 'name'>
type IconName = ComponentProps<typeof MaterialCommunityIcons>['name']

const repeatOrder = [RepeatMode.Queue, RepeatMode.Track, RepeatMode.Off] as const

export const PlayerRepeatToggle = ({ ...iconProps }: IconProps) => {
	const { repeatMode, changeRepeatMode } = useTrackPlayerRepeatMode() // Provide a default value
	console.log("repeatMode: ", repeatMode)

	const toggleRepeatMode = () => {
		if (repeatMode == null) return

		const currentIndex = repeatOrder.indexOf(repeatMode)
		const nextIndex = (currentIndex + 1) % repeatOrder.length

		changeRepeatMode(repeatOrder[nextIndex])
	}

	const icon = match(repeatMode)
		.returnType<IconName>()
		.with(RepeatMode.Off, () => 'repeat-off')
		.with(RepeatMode.Track, () => 'repeat-once')
		.with(RepeatMode.Queue, () => 'repeat')
		.otherwise(() => 'repeat-off')

	return (
		<MaterialCommunityIcons
			name={icon}
			onPress={toggleRepeatMode}
			color={colors.icon}
			{...iconProps}
		/>
	)
}