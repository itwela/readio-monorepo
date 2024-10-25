import { unknownTrackImageUri } from "@/constants/images";
import { defaultStyles } from "@/styles";
import { TouchableOpacity, StyleSheet, View, Text } from "react-native";
import FastImage from "react-native-fast-image";
import { Track, useActiveTrack } from "react-native-track-player";
import { PlayPauseButton, SkipToNextButton } from "./ReadioPlayerControls";
import { ViewProps } from "./Themed";
import { useLastActiveTrack } from "@/hooks/useLastActiveTrack";

export default function ReadioFloatingPlayer ({ style }: ViewProps) {
    const activeTrack = useActiveTrack()
    const lastActiveTrack = useLastActiveTrack()

    const displayedTrack = activeTrack ?? lastActiveTrack

    if (!activeTrack) return null


    return (
        <TouchableOpacity activeOpacity={0.9} style={[
            styles.container, style
        ]}>
            <>
                <FastImage source={{
                    uri: displayedTrack?.image ?? unknownTrackImageUri
                }}
                style={styles.trackArtworkImage}
                />

                <View style={styles.trackTitleContainer}>
                    <Text style={styles.trackTitle}>{displayedTrack?.title}</Text>
                </View>

                <View style={styles.trackControlsContainer}>
                    <PlayPauseButton iconSize={24} />
                    <SkipToNextButton iconSize={24} />
                </View>
            </>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 8,
        borderRadius: 12,
        paddingVertical: 10
    },
    trackTitleContainer: {
        flex: 1,
        overflow: 'hidden',
        marginLeft: 10,
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
        ...defaultStyles.text,
        fontSize: 18,
        fontWeight: '600',
        paddingLeft: 10,
    }
})