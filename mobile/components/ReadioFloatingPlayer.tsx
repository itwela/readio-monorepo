import { filter, unknownTrackImageUri } from "@/constants/images";
import { defaultStyles } from "@/styles";
import { TouchableOpacity, StyleSheet, View, Text } from "react-native";
import FastImage from "react-native-fast-image";
import { Track, useActiveTrack } from "react-native-track-player";
import { PlayPauseButton, SkipToNextButton } from "./ReadioPlayerControls";
import { ViewProps } from "./Themed";
import { useLastActiveTrack } from "@/hooks/useLastActiveTrack";
import { MovingText } from "./MovingText";
import { useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import { RootNavigationProp } from "@/types/type";
import { colors } from "@/constants/tokens";

export default function ReadioFloatingPlayer ({ style }: ViewProps) {
    
    const router = useRouter()
    const navigation = useNavigation<RootNavigationProp>(); // use typed navigation

    const activeTrack = useActiveTrack()
    const lastActiveTrack = useLastActiveTrack()

    const displayedTrack = activeTrack ?? lastActiveTrack

    
    if (!activeTrack) return null

    const handlePress = () => {
        navigation.navigate("player"); // <-- Using 'player' as screen name
    }

    return (
        <TouchableOpacity onPress={handlePress} activeOpacity={0.9} style={[
            styles.container, style
        ]}>
            <>
                <View style={{position: 'relative', width: 40, height: 40, backgroundColor: "transparent"}}>
                    <FastImage source={{uri: filter}} style={[styles.trackArtworkImage, {zIndex: 1, opacity: 0.4, position: 'absolute'}]} resizeMode='cover'/>
                    <FastImage source={{
                        uri: displayedTrack?.image ?? unknownTrackImageUri
                    }}
                    style={styles.trackArtworkImage}
                    />
                </View>

                {/* <View style={styles.trackTitleContainer}>
                    <Text style={styles.trackTitle}>{displayedTrack?.title}</Text>
                </View> */}
                <View style={styles.trackTitleContainer}>
					<MovingText
						style={styles.trackTitle}
						text={displayedTrack?.title ?? ''}
						animationThreshold={25}
					/>
                    <Text style={styles.trackArtistText}>{displayedTrack?.artist}</Text>
				</View>

                <View style={styles.trackControlsContainer}>
                    <PlayPauseButton color={colors.readioWhite} iconSize={24} />
                    <SkipToNextButton color={colors.readioWhite} iconSize={24} />
                </View>
            </>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.readioBrown,
        padding: 8,
        borderRadius: 12,
        paddingVertical: 10
    },
    trackTitleContainer: {
        flex: 1,
        overflow: 'hidden',
        marginLeft: 10,
        height: 40,
        justifyContent: 'flex-start',
    },
    trackControlsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 20,
        marginRight: 16,
        paddingLeft: 16,
    },
    trackArtworkImage: {
        width: 40,
        height: 40,
        borderRadius: 8,
    },
    trackTitle: {
        // ...defaultStyles.text,
        fontSize: 18,
        fontWeight: '600',
        color: colors.readioWhite,
    },
    trackArtistText: {
		...defaultStyles.text,
		fontSize: 14,
        color: colors.readioWhite,
	},
})