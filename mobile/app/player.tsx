import { View, StyleSheet, Text, SafeAreaView, ActivityIndicator } from "react-native"
import { defaultStyles, utilsStyles } from "@/styles"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useActiveTrack } from "react-native-track-player"
import { colors, fontSize } from "@/constants/tokens"
import FastImage from "react-native-fast-image"
import { unknownTrackImageUri } from "@/constants/images"
import { MovingText } from "@/components/MovingText"
import { FontAwesome } from "@expo/vector-icons"
import { PlayerProgressBar } from "@/components/ReadioPlayerProgreeBar"
import { PlayerControls } from "@/components/ReadioPlayerControls"
import { PlayerVolumeBar } from "@/components/ReadioPlayerVolumeBar"
import { PlayerRepeatToggle } from "@/components/ReadioPlayerRepeatToggle"
import { useEffect, useState } from "react"
import { fetchAPI } from '@/lib/fetch';
import { useUser } from "@clerk/clerk-expo"
import { usePlayerBackground } from "@/hooks/usePlayerBackground"
import { LinearGradient } from "expo-linear-gradient"

export default function Player() {

    const activeTrack = useActiveTrack()
    const { top, bottom } = useSafeAreaInsets()
    const [isFavorite , setIsFavorite] = useState(false)
    const {imageColors} = usePlayerBackground(activeTrack?.image ?? unknownTrackImageUri)
    const { user } = useUser()
    const toggleFavorite = async () => {
        let wantsToBeFavorite = null

        if(isFavorite === true) {
            wantsToBeFavorite = false
        } 

        if(isFavorite === false) {
            wantsToBeFavorite = true
        }
        
// starting client api call
        console.log("wantsToBeFavorite: ", wantsToBeFavorite)
        console.log("username: ", user)
        const response = await fetchAPI(`/(api)/handleFavoriteSelection`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              id: activeTrack?.id,  
              clerkId: user?.id as string,
              selection: wantsToBeFavorite
            }),
          });
      
          // NOTE: this is the data from the resoponse variable
          const data = await response;
          console.log("data: ", data)
          setIsFavorite(!isFavorite)

    }

    useEffect(() => {
        if(activeTrack) {
            setIsFavorite(activeTrack?.favorited ?? false)
        }
    }, [activeTrack])

    if (!activeTrack) {
        return (
            <>
            <SafeAreaView>

            <View style={[defaultStyles.container, {justifyContent: 'center'}]}>
                <ActivityIndicator color={colors.icon}/>
                <Text>Readio Station</Text>
            </View>

            </SafeAreaView>
            </>
        )
    }

    console.log("player")

    return (
        <>
        <LinearGradient style={{flex: 1}} colors={imageColors ? [imageColors.background, imageColors.primary] : [colors.background] }>

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

            <View style={{flex: 1, marginHorizontal: 10}}>
                <View style={{marginTop: 'auto'}}>
                    <View style={{height: 60}}>
                        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                            
                            <View style={styles.trackTitleContainer}>
                                <MovingText text={activeTrack?.title ?? ""} animationThreshold={30} style={styles.trackTitle}/>
                            </View>

                            <FontAwesome name={isFavorite ? 'heart' : 'heart-o'} size={24} color={isFavorite ? colors.primary : '#fff'} style={{marginHorizontal: 14}} onPress={toggleFavorite} />
                        </View>

                        {activeTrack?.artist && (
                            <Text numberOfLines={1} style={[styles.trackArtistText, {marginTop: 6}]}>{activeTrack?.artist}</Text>
                        )}
                    </View>

                    <PlayerProgressBar style={{marginTop: 32}}></PlayerProgressBar>

                    <PlayerControls style={{marginTop: 40}}></PlayerControls>
                </View>

                <PlayerVolumeBar style={{marginTop: 'auto', marginBottom: 30}} />

                <View style={utilsStyles.centeredRow}>
                    <PlayerRepeatToggle size={30} style={{marginBottom: 6}}></PlayerRepeatToggle>
                </View>
            </View>   
        </SafeAreaView>
        </View>

        </LinearGradient>
        
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
        backgroundColor: 'rgba(0,0,0,0.2)',
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
        height: '85%',
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
        fontWeight: '700',
        color: "#fff"
    },
    trackTitleContainer: {
        flex: 1,
        overflow: 'hidden',
    },
    trackArtistText: {
        ...defaultStyles.text,
        fontSize: fontSize.base,
        opacity: 0.8,
        maxWidth: '90%',
        color: '#fff'
    },
})