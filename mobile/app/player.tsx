import { View, StyleSheet, Text, SafeAreaView, ActivityIndicator } from "react-native"
import { defaultStyles } from "@/styles"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useActiveTrack } from "react-native-track-player"
import { colors } from "@/constants/tokens"
import FastImage from "react-native-fast-image"
import { unknownTrackImageUri } from "@/constants/images"
import { MovingText } from "@/components/MovingText"
import { FontAwesome } from "@expo/vector-icons"
export default function Player() {

    const activeTrack = useActiveTrack()
    const { top, bottom } = useSafeAreaInsets()
    const isFavorite = false
    const toggleFavorite = () => {
        console.log("toggle favorite")
    }
    if (!activeTrack) {
        return (
            <>
            <View style={[defaultStyles.container, {justifyContent: 'center'}]}>
                <ActivityIndicator color={colors.icon}/>
            </View>
            </>
        )
    }

    console.log("player")

    return (
        <>
        <View style={styles.overlayContainer}>
        <SafeAreaView style={{width: '100%', height: '100%'}}>
            <DismissPlayerSymbol></DismissPlayerSymbol>  

            <View style={{flex: 1, marginTop: top + 10, marginBottom: bottom}}>
                <View style={styles.artworkImageContainer}>
                    <FastImage
                        source={{
                        uri: activeTrack?.image ?? unknownTrackImageUri,
                        priority: FastImage.priority.high,
                    }} resizeMode="cover" style={styles.artworkImage}/>
                </View>
            </View> 

            <View style={{flex: 1}}>
                <View style={{marginTop: 'auto'}}>
                    <View style={{height: 60}}>
                        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                            
                            <View style={styles.trackTitleContainer}>
                                <MovingText text={activeTrack?.title ?? ""} animationThreshold={30} style={styles.trackTitle}/>
                            </View>

                            <FontAwesome name={isFavorite ? 'heart' : 'heart-o'} size={24} color={isFavorite ? colors.primary : '#fff'} style={{marginHorizontal: 14}} onPress={toggleFavorite} />
                        </View>
                    </View>
                </View>
            </View>   
        </SafeAreaView>
        </View>
        
        </>

    ) 

}


const DismissPlayerSymbol = () => {

    const { top } = useSafeAreaInsets()

    return (
        <View style={{
            position: 'absolute',
            top: top + 8,
            left: 0,
            right: 0,
            flexDirection: 'row',
            justifyContent: 'center'
        }}>
            <View accessible={false} style={{
                width: 50,
                height: 8,
                borderRadius: 8,
                backgroundColor: '#fff',
                opacity: 0.7

            }}/>
        </View>
    )
}

const styles = StyleSheet.create({
    overlayContainer: {
        // ...defaultStyles.overlayContainer,
        paddingHorizontal: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        height: '100%',
    },
    dismissPlayerSymbol: {
        position: 'absolute',
        right: 10,
        top: 10,
        zIndex: 1
    },
    artworkImageContainer: {
        shadowOffset: {
            width: 0,
            height: 8
        },
        shadowOpacity: 0.44,
        shadowRadius: 11.0,
        flexDirection: 'row',
        height: '45%',
        justifyContent: 'center',
    },
    artworkImage: {
        width: '90%',
        height: '100%',
        borderRadius: 12,
        resizeMode: 'cover'
    },
    trackTitle: {
        ...defaultStyles.text,
        fontSize: 22,
        fontWeight: '700'
    },
    trackTitleContainer: {
        flex: 1,
        overflow: 'hidden',
    }
})