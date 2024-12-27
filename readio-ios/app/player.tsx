import { View, StyleSheet, Text, SafeAreaView, ActivityIndicator, Animated } from "react-native"
import { defaultStyles, utilsStyles } from "@/styles"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useActiveTrack } from "react-native-track-player"
import { colors, fontSize } from "@/constants/tokens"
import FastImage from "react-native-fast-image"
import { unknownTrackImageUri } from "@/constants/images"
import { MovingText } from "@/components/MovingText"
import { FontAwesome } from "@expo/vector-icons"
import { PlayerProgressBar } from "@/components/ReadioPlayerProgressBar"
import { PlayerControls, PlayPauseButton } from "@/components/ReadioPlayerControls"
import { PlayerVolumeBar } from "@/components/ReadioPlayerVolumeBar"
import { PlayerRepeatToggle } from "@/components/ReadioPlayerRepeatToggle"
import { useEffect, useState, useRef } from "react"
import { fetchAPI } from '@/lib/fetch';
import { useUser } from "@clerk/clerk-expo"
import { usePlayerBackground } from "@/hooks/usePlayerBackground"
import { LinearGradient } from "expo-linear-gradient"
import { useReadio } from "@/constants/readioContext"
import { retryWithBackoff } from '@/helpers/retryWithBackoff';
import ReactNativeBlobUtil from 'react-native-blob-util'
import { s3 } from '@/helpers/s3Client';
import { Buffer } from 'buffer';
import { generateTracksListId } from '@/helpers/misc'
import { Readio, Station } from '@/types/type';
import { useFetch } from "@/lib/fetch";
import { useNavigation } from "@react-navigation/native";
import { RootNavigationProp } from "@/types/type";
import TrackPlayer, { RepeatMode, Track } from 'react-native-track-player'
import { useQueue } from '@/store/queue'
import sql from "@/helpers/neonClient"

export default function Player() {

    const activeTrack = useActiveTrack()
    const { top, bottom } = useSafeAreaInsets()
    const [isFavorite , setIsFavorite] = useState(false)
    const {imageColors} = usePlayerBackground(activeTrack?.image ?? unknownTrackImageUri)
    const { user } = useUser()
    const { readioIsGeneratingRadio, setReadioIsGeneratingRadio } = useReadio()
    const { playerMode, setPlayerMode } = useReadio()
    const { activeStationName, setActiveStationName } = useReadio()
    const [sToast, setSToast] = useState(false)
    const [toastMessege, setToastMessege] = useState("")
    const {selectedReadios, setSelectedReadios} = useReadio()
    const {selectedLotusReadios, setSelectedLotusReadios} = useReadio()
  
    // const stations = await sql`
    //     SELECT stations.*
    //     FROM stations
    //     INNER JOIN station_clerks ON stations.id = station_clerks.station_id
    //     WHERE station_clerks.clerk_id = ${user?.id};
    // `;

    const navigation = useNavigation<RootNavigationProp>(); // use typed navigation  
    const { activeStationId, setActiveStationId } = useReadio()
    const [readios, setReadios] = useState<Readio[]>([]);
    const [tracks, setTracks] = useState<any>();
    const { activeQueueId, setActiveQueueId } = useQueue() 
    const queueOffset = useRef(0)

    const showToast = (message: string) => {
        setSToast(true)
        setToastMessege(message)
        // setInterval(() => {
        //   setSToast(false)
        // }, 5000)
    };
    
    const hideToast = () => {
        setSToast(false)
        setToastMessege('')
    }

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

        retryWithBackoff(async () => {

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
            setIsFavorite(!isFavorite)

        }, 3, 1000)
      

    }

    useEffect(() => {
        if(activeTrack) {
            setIsFavorite(activeTrack?.favorited ?? false)
        }
    }, [activeTrack])


    if (!selectedReadios) {
        return (
            <>
            <SafeAreaView>

            <View style={[defaultStyles.container, {justifyContent: 'center'}]}>
                <ActivityIndicator color={colors.icon}/>
                <Text>Station</Text>
            </View>

            </SafeAreaView>
            </>
        )
    }

    useEffect(() => {
        const handleTracks = async () => {
          console.log("Updated selectedReadio ✅✅✅✅✅✅ ");
      
          // Handle tracks from selectedReadios
          if (Array.isArray(selectedReadios) && selectedReadios.length > 0) {
            for (const track of selectedReadios) {
              await handleTrackSelect(track, generateTracksListId('songs', track.title));
            }
            console.log ("updated no lutus 🟥🟥🟥🟥🟥🟥")
            setPlayerMode?.("radio");
            // Play the track
            await TrackPlayer.play();
          }
      
          // Handle tracks from selectedLotusReadios
          if (Array.isArray(selectedLotusReadios) && selectedLotusReadios.length > 0) {
            for (const track of selectedLotusReadios) {
              await handleTrackSelect(track, generateTracksListId('songs', track.title));
            }
            console.log ("updated lotus 💛💛💛💛💛💛")
            setPlayerMode?.("radio");
            // Play the track
            await TrackPlayer.play();
          }

        };
      
        handleTracks();
      }, [selectedReadios, selectedLotusReadios]);
      
    const handleTrackSelect = async (selectedTracks: Track, songId: string) => {
        console.log("id: ", songId);
        
        // Add the selected track to the queue
        await TrackPlayer.add(selectedTracks);
            
        // Update queue and state for the radio function
        setActiveQueueId(songId); // Optionally update the active queue ID
        queueOffset.current = 0;  // Reset queue offset since we only have one track
        await TrackPlayer.setRepeatMode(RepeatMode.Off);
    };

    const BlinkingRadioSymbol = () => {
        const blinkAnim = useRef(new Animated.Value(0)).current;
        const fadeAnim = useRef(new Animated.Value(0)).current; // Initial value for opacity: 0

        useEffect(() => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(blinkAnim, {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(blinkAnim, {
                        toValue: 0,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }, [blinkAnim]);

        useEffect(() => {
            if (sToast === true) {
              Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
              }).start();
        
              const timer = setTimeout(() => {
                Animated.timing(fadeAnim, {
                  toValue: 0,
                  duration: 300,
                  useNativeDriver: true,
                }).start();
              }, 2000); // Toast will be visible for 2 seconds
        
              return () => clearTimeout(timer); // Cleanup timer on unmount
            }
        
        }, [sToast, setSToast, fadeAnim]);


    
        return (
            <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 5, width: '100%', justifyContent: 'space-between', paddingHorizontal:25}}>
                
                <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 5}}>
                    
                    <Animated.View style={{ opacity: blinkAnim}}>
                        <FontAwesome name="dot-circle-o" size={14} color="#ff0000" />
                    </Animated.View>
                    <Text style={{color: colors.readioBlack, fontSize: 14}}>{activeStationName} Station</Text>
                
                </View>
                <View>
                    {/* <FontAwesome onPress={handleStationPress} name="refresh" size={18} color="#fff" /> */}
                </View>
            </View>
        );
    };



    return (
        <>
        <LinearGradient style={{flex: 1}} colors={imageColors ? [imageColors.background, imageColors.primary] : [colors.readioWhite, colors.readioWhite]}>

        <View style={styles.overlayContainer}>
       
            <SafeAreaView style={{width: '100%', height: '100%'}}>
            {sToast === true && (
                  <>
                    <Animated.View style={styles.toast}>
                      <Text>{toastMessege}</Text>
                    </Animated.View>
                  </>
          )}
                <DismissPlayerSymbol></DismissPlayerSymbol>  


                <View style={{flex: 1, marginTop: top + 10, marginBottom: bottom}}>
                    <View style={styles.artworkImageContainer}>
                        {playerMode === 'radio' && (
                            <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingTop: 30}}>
                                <Text style={{color: '#fff', fontSize: 14}}><BlinkingRadioSymbol /></Text>
                            </View>
                        )}
                        {activeTrack?.image === "" && (
                            <FastImage
                                source={{
                                uri: unknownTrackImageUri,
                                priority: FastImage.priority.high,
                            }} resizeMode="cover" style={styles.artworkImage}/>                            
                        )}
                        
                        {activeTrack?.image != "" && (
                        <FastImage
                            source={{
                            uri: activeTrack?.image ?? unknownTrackImageUri,
                            priority: FastImage.priority.high,
                        }} resizeMode="cover" style={styles.artworkImage}/>
                        )}

                    </View>
                </View> 

                <View style={{flex: 1, marginHorizontal: 10}}>
                    <View style={{marginTop: 'auto'}}>
                        <View style={{height: 40}}>
                            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                                
                                <View style={styles.trackTitleContainer}>
                                    <MovingText text={activeTrack?.title ?? "Loading..."} animationThreshold={30} style={styles.trackTitle}/>
                                </View>

                                <FontAwesome name={isFavorite ? 'heart' : 'heart-o'} size={24} color={isFavorite ? colors.readioOrange : colors.readioOrange} style={{marginHorizontal: 14}} onPress={toggleFavorite} />
                            </View>

                                <Text numberOfLines={1} style={[styles.trackArtistText, {marginTop: 6}]}>{activeTrack?.artist ?? "Loading..."}</Text>
                        </View>

                        <PlayerProgressBar style={{marginTop: 32}}></PlayerProgressBar>

                        {playerMode === 'radio' && (
                            <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 40}}>
                                <PlayPauseButton iconSize={35} color={colors.readioBlack} />
                            </View>
                        )}

                        {playerMode != 'radio' && (
                            <PlayerControls style={{}}></PlayerControls>
                        )}
                    </View>

                    <PlayerVolumeBar style={{marginTop: 'auto', marginBottom: 30}} />

                    <View style={utilsStyles.centeredRow}>
                        <PlayerRepeatToggle  size={30} style={{marginBottom: 6}}></PlayerRepeatToggle>
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
                backgroundColor: colors.readioBlack,
                opacity: 0.7

            }}/>
        </View>
    )
}

const styles = StyleSheet.create({
    overlayContainer: {
        // ...defaultStyles.overlayContainer,
        paddingHorizontal: 10,
        backgroundColor: colors.readioWhite,
        height: '100%',
    },
    toast: {
        position: 'absolute',
        top: 20,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 16,
        zIndex: 10,
        backgroundColor: '#fff',
        maxWidth: '100%',
        height: 50,
        display: 'flex'
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
        flexDirection: 'column',
        height: '85%',
        justifyContent: 'center',
        width: '100%',
        alignItems: 'center',
        gap: 20
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
        color: colors.readioBlack
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
        color: colors.readioBlack,
    },
})