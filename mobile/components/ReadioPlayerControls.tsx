import { TouchableOpacity, View, ViewStyle, Text, StyleSheet } from "react-native"
import TrackPlayer, { useIsPlaying } from "react-native-track-player"
import { FontAwesome, FontAwesome6 } from "@expo/vector-icons"
import { colors } from "@/constants/tokens"

type PlayerControlsProps = {
    style?: ViewStyle
}

type PlayerButtonProps = {
    style?: ViewStyle,
    iconSize?: number
}

export const PlayerControls = ({ style }: PlayerControlsProps) => {
	return (
		<View style={[styles.container, style]}>
			<View style={styles.row}>
				<SkipToPreviousButton />

				<PlayPauseButton />

				<SkipToNextButton />
			</View>
		</View>
	)
}


export const PlayPauseButton = ({style, iconSize}: PlayerButtonProps) => {
    const {playing} = useIsPlaying()

    return (
        <View style={[{ height: iconSize }, style]}>
            <TouchableOpacity
                activeOpacity={0.85}
                onPress={playing ? TrackPlayer.pause : TrackPlayer.play }
            >
                <FontAwesome name={playing ? 'pause' : 'play'} size={iconSize}/>
            </TouchableOpacity>
        </View>
    )
}

export const SkipToNextButton = ({iconSize = 30}: PlayerButtonProps) => {


    const handleSkipToNext = () => {
        console.log("skip to next")

        TrackPlayer.skipToNext()
    }

    return (
        <View>
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleSkipToNext}
            >
                <FontAwesome6 name='forward' size={iconSize} color={colors.text}/>
            </TouchableOpacity>
        </View>
    )
}

export const SkipToPreviousButton = ({iconSize = 30}: PlayerButtonProps) => {

    return (
        <View>
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => TrackPlayer.skipToPrevious}
            >
                <FontAwesome6 name='backward' size={iconSize} color={colors.text}/>
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
})