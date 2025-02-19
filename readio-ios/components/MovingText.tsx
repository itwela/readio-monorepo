import { useEffect } from 'react'
import Animated, {
	Easing,
	StyleProps,
	cancelAnimation,
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withRepeat,
	withTiming,
} from 'react-native-reanimated'

import type { TextStyle } from 'react-native'

export type MovingTextProps = {
	text: string
	animationThreshold: number
	style?: TextStyle | TextStyle[]
}

export const MovingText = ({ text, animationThreshold, style }: MovingTextProps) => {
	const translateX = useSharedValue(0)
	const shouldAnimate = text.length >= animationThreshold

	// Calculate text width based on character length with more space
	const textWidth = text.length * 3.618 

	useEffect(() => {
		if (!shouldAnimate) return

		translateX.value = withDelay(
			1000,
			withRepeat(
				withTiming(-textWidth, {
					duration: 7000, // Increased duration for smoother animation
					easing: Easing.linear,
				}),
				-1,
				true,
			),
		)

		return () => {
			cancelAnimation(translateX)
			translateX.value = 0
		}
	}, [translateX, text, animationThreshold, shouldAnimate, textWidth])

	const animatedStyle = useAnimatedStyle(() => {
		return {
			transform: [{ translateX: translateX.value }],
		}
	})

	return (
		<Animated.Text
			allowFontScaling={false}
			numberOfLines={1}
			style={[
				style,
				animatedStyle,
				shouldAnimate && {
					width: 9999, // preventing the ellipsis from appearing
					paddingLeft: 1, // avoid the initial character being barely visible
					paddingRight: 20, // Add padding to the right for better visibility
				},
			]}
		>
			{text}
		</Animated.Text>
	)
}