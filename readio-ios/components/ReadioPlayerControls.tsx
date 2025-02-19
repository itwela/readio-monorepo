import { TouchableOpacity, View, ViewStyle, Text, StyleSheet, TextStyle } from "react-native"
import TrackPlayer, { useIsPlaying } from "react-native-track-player"
import { FontAwesome, FontAwesome6 } from "@expo/vector-icons"
import { colors } from "@/constants/tokens"

type PlayerControlsProps = {
    style?: ViewStyle
}

type PlayerButtonProps = {
    style?: ViewStyle,
    iconSize?: number,
    color?: string
}

export const PlayerControls = ({ style }: PlayerControlsProps) => {
	return (
		<View style={[styles.container, style]}>
			<View style={styles.row}>
				<SkipToPreviousButton iconSize={25}  color={colors.readioOrange} />

				<PlayPauseButton iconSize={40} color={colors.readioOrange} />

				<SkipToNextButton iconSize={25} color={colors.readioOrange} />
			</View>
		</View>
	)
}


export const PlayPauseButton = ({style, iconSize, color}: PlayerButtonProps) => {
    const {playing} = useIsPlaying()

    return (
        <View style={[style]}>
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={playing ? TrackPlayer.pause : TrackPlayer.play}
                style={{
                    // backgroundColor: colors.readioWhite,
                    borderRadius: 100,
                    width: iconSize,
                    height: iconSize,
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 4,
                    transform: [{ scale: 1 }]
                }}
            >
                <FontAwesome 
                    name={playing ? 'pause' : 'play'} 
                    size={iconSize} 
                    color={color}
                    style={{
                        marginLeft: playing ? 0 : 3
                    }}
                />
            </TouchableOpacity>
        </View>
    )
}

export const SkipToNextButton = ({iconSize, color}: PlayerButtonProps) => {


    const handleSkipToNext = () => {
        console.log("skip to next")

        TrackPlayer.skipToNext()
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

    const handleSkipToPrevious = () => {
        console.log("skip to next")
        TrackPlayer.skipToPrevious()
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