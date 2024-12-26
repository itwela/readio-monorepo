import { View, StyleSheet, Text, SafeAreaView, ActivityIndicator, Animated } from "react-native"
import { defaultStyles, utilsStyles } from "@/styles"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useActiveTrack } from "react-native-track-player"
import { colors, fontSize, utilStyle } from "@/constants/tokens"
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
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';
import { generateTracksListId } from '@/helpers/misc'
import { Readio, Station } from '@/types/type';
import { useFetch } from "@/lib/fetch";
import { useNavigation } from "@react-navigation/native";
import { RootNavigationProp } from "@/types/type";
import TrackPlayer, { RepeatMode, Track } from 'react-native-track-player'
import { useQueue } from '@/store/queue'
import { geminiReadio, geminiTitle } from "@/helpers/geminiClient"
import sql from "@/helpers/neonClient"

export default function Player() {

    const activeTrack = useActiveTrack()
    const { top, bottom } = useSafeAreaInsets()
    const [isFavorite , setIsFavorite] = useState(false)
    const {imageColors} = usePlayerBackground(activeTrack?.image ?? unknownTrackImageUri)
    const { user } = useUser()
    const { playerMode, setPlayerMode } = useReadio()
    const { activeStationName, setActiveStationName } = useReadio()
    const [sToast, setSToast] = useState(false)
    const {selectedReadios, setSelectedReadios} = useReadio()
    const navigation = useNavigation<RootNavigationProp>(); // use typed navigation  
    const [readios, setReadios] = useState<Readio[]>([]);
    const tracks = readios
    const { activeQueueId, setActiveQueueId } = useQueue() 
    const queueOffset = useRef(0)

    useEffect(() => {
        if(activeTrack) {
            setIsFavorite(activeTrack?.favorited ?? false)
        }
    }, [activeTrack])

    if (!selectedReadios) {
        return (
            <>
            <SafeAreaView style={[utilStyle.safeAreaContainer, {backgroundColor: colors.readioBrown, width: '100%', padding: utilStyle.padding.padding}]}>
                <View style={[defaultStyles.container, {justifyContent: 'center', gap: 15, alignItems: 'center'}]}>
                    <ActivityIndicator color={colors.readioOrange}/>
                    <View></View>
                    <Text style={{color: colors.readioWhite}}>Something went wrong.</Text>
                    <Text style={{color: colors.readioWhite}}>Try clicking a station again.</Text>
                </View>
            </SafeAreaView>
            </>
        )
    }

    // const handleStationPress = async () => {

    //     // creat a radio with the topic given
    //     const topic = activeStationName
    //     const id = activeStationId

    //     console.log("topic: ", topic)
    
    //     setReadioIsGeneratingRadio?.(true)
    
    
    //     if (readioIsGeneratingRadio === true) {
    //     showToast("Please wait while we generate your readio")
    //     }
    
    
    
    //     console.log("strting to generate title")
    //     console.log("Starting Gemini...");

    //     // Using a variable instead of useState for title
    //     let title = "";
    //     console.log("Starting Gemini...title");
    //     const promptTitle = `Please generate me a good title for a readio. Here is the query i asked originally: ${form.query}.`;
    //     const resultTItle = await geminiTitle.generateContent(promptTitle);
    //     const geminiTitleResponse = await resultTItle.response;
    //     const textTitle = geminiTitleResponse.text();
    //     title = textTitle; // Assigning the response to the variable title
    //     console.log("set title response: ", title);
    

    //     // Using a variable instead of useState for readioText
    //     let readioText = "";
    //     // const promptReadio =  `Can you make me a readio about ${form.query}. The title is: ${title}.`;
    //     const promptReadio =  ` Hi, right now im just testing a feature, no matter what the user says just respond with, "Message Recieved. Thanks for the message."`;
    //     const resultReadio = await geminiReadio.generateContent(promptReadio);
    //     const geminiReadioResponse = await resultReadio.response;
    //     const textReadio = geminiReadioResponse.text();    
    //     readioText = textReadio; // Assigning the response to the variable readioText
    //     console.log("set readio response: ", readioText);

    //     // NOTE database --------------------------------------------------------
    //     console.log("Starting Supabase....");
        
    //     // default
    //     const addReadioToDB: any = await sql`
    //     INSERT INTO readios (
    //         image,
    //         text, 
    //         topic,
    //         title,
    //         clerk_id,
    //         username,
    //         artist,
    //         tag
    //         )
    //         VALUES (
    //         ${illustration},
    //         ${readioText},
    //         ${form.query}, 
    //         ${title},
    //         ${user?.id},
    //         ${user?.fullName},
    //         'Readio',
    //         'default'
    //         )
    //         RETURNING id, image, text, topic, title, clerk_id, username, artist;
    //     `;
        
    //     console.log("Starting ElevenLabs....");
        
    //     async function fetchAudioFromElevenLabsAndReturnFilePath(
    //         text: string,
    //         apiKey: string,
    //         voiceId: string,
    //     ): Promise<string> {
    //         const baseUrl = 'https://api.elevenlabs.io/v1/text-to-speech'
    //         const headers = {
    //         'Content-Type': 'application/json',
    //         'xi-api-key': apiKey,
    //         }
        
    //         const requestBody = {
    //         text,
    //         voice_settings: { similarity_boost: 0.5, stability: 0.5 },
    //         }
        
    //         const response = await ReactNativeBlobUtil.config({
    //         // add this option that makes response data to be stored as a file,
    //         // this is much more performant.
    //         fileCache: true,
    //         appendExt: 'mp3',
    //         }).fetch(
    //         'POST',
    //         `${baseUrl}/${voiceId}`,
    //         headers,
    //         JSON.stringify(requestBody),
    //         )
    //         const { status } = response.respInfo
        
    //         if (status !== 200) {
    //         throw new Error(`HTTP error! status: ${status}`)
    //         }
        
    //         return response.path()
    //     }
        
    //     const path = await fetchAudioFromElevenLabsAndReturnFilePath(
    //         readioText,
    //         'bc2697930732a0ba97be1d90cf641035',
    //         "hJ9aNCtXg5rLXeFF18zw",
    //     )
        
    //     const base64Audio = await ReactNativeBlobUtil.fs.readFile(path, 'base64');
    //     const audioBuffer = Buffer.from(base64Audio, 'base64');
        
    //     // Upload the audio file to S3
    //     const s3Key = `${addReadioToDB?.[0]?.id}.mp3`;  // Define the file path within the S3 bucket
    //     await s3.upload({
    //         Bucket: "readio-audio-files",  // Your S3 bucket name
    //         Key: s3Key,
    //         Body: audioBuffer, // Read file as Base64
    //         ContentEncoding: 'base64', // Specify base64 encoding
    //         ContentType: 'audio/mpeg', // Specify content type
    //     }).promise();
        
    //     const s3Url = `https://readio-audio-files.s3.us-east-2.amazonaws.com/${s3Key}`;
    //     console.log("S3 URL: ", s3Url);
        
    //     // Save S3 URL to the Neon database
    //     async function addPathToDB(s3Url: string, readioId: any, userId: any) {
    //         await fetchAPI(`/(api)/addReadioPathToDb`, {
    //         method: "POST",
    //         headers: { "Content-Type": "application/json" },
    //         body: JSON.stringify({
    //             path: s3Url,
    //             readioId: readioId,
    //             userId: userId
    //         }),
    //         });
        
        
    //     }
        
    //     await addPathToDB(s3Url, readioId, userId);
        
    //     console.log("Audio successfully uploaded to S3 and path saved to the database.");
        
    //     navigation.navigate("index"); // <-- Using 'player' as screen name

    //     const getReadios = async () => {
    //         console.log("getting new readio....")
        
    //         const response = await fetchAPI(`/(api)/getNewReadio`, {
    //         method: "POST",
    //         body: JSON.stringify({
    //             clerkId: user?.id as string,
    //             id: readioId as number
    //         }),
    //         });
        
        
        
    //         return response;
    //     }
        
    //     const unPackingNewReadio = await getReadios()
    //     console.log("unPackingNewReadio: ", unPackingNewReadio)
    //     setSelectedReadio(unPackingNewReadio)
        
    //     setReadioIsGeneratingRadio?.(false)
        
    //     showToast("All done! 👍")
        
    //     hideToast()

    //     setActiveStationName?.(stations?.find((station) => station.id === id)?.name as string)
  
    //     setActiveStationId?.(id as number)
  
    //     navigation.navigate("player"); // <-- Using 'player' as screen name
          
    
    // }

    const handleTrackSelect = async (selectedTrack: Track, songId: string) => {
        console.log("id: ", songId);
        setPlayerMode?.("radio");
    
        // Find the track that matches the selected track URL
        const theSelectedTrack = readios?.find((readio) => readio?.url === selectedTrack.url);
        if (!theSelectedTrack) return; // If the track isn't found, exit the function
    
        console.log('selectedTrack', selectedTrack);
    
        // Reset the TrackPlayer to clear any existing tracks
        await TrackPlayer.reset();
    
        // Add only the selected track to the queue
        await TrackPlayer.add(selectedTrack);
    
        // Play the single track
        await TrackPlayer.play();
    
        // Update queue and state for the radio function
        setActiveQueueId(songId); // Optionally update the active queue ID
        queueOffset.current = 0;  // Reset queue offset since we only have one track
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

        useEffect(() => {
            console.log("Updated selectedReadio");
            if (Array.isArray(selectedReadios) && selectedReadios.length > 0) {
              const track = selectedReadios[0]; // Assuming we want to handle the first track in the array
              handleTrackSelect(track, generateTracksListId('songs', track.title));
            }
        }, [selectedReadios]);
    
        return (
            <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 5, width: '100%', justifyContent: 'space-between', paddingHorizontal:25}}>
                
                <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 5}}>
                    
                    <Animated.View style={{ opacity: blinkAnim}}>
                        <FontAwesome name="dot-circle-o" size={14} color="#ff0000" />
                    </Animated.View>
                    <Text style={{color: '#fff', fontSize: 14}}>{activeStationName} Station</Text>
                
                </View>
                <View>
                    {/* <FontAwesome onPress={handleStationPress} name="refresh" size={18} color="#fff" /> */}
                </View>
            </View>
        );
    };


    return (
        <>
        {/* <LinearGradient style={{flex: 1}} colors={imageColors ? [imageColors.background, imageColors.primary] : [colors.background] }> */}

        <View style={styles.overlayContainer}>
       
            <SafeAreaView style={{width: '100%', height: '100%'}}>

                <DismissPlayerSymbol></DismissPlayerSymbol>  


                <View style={{flex: 1, marginTop: top + 10, marginBottom: bottom}}>
                    <View style={styles.artworkImageContainer}>

                        <Text style={{fontSize: 24, textAlign: 'center'}}>The {activeStationName} station is loading..</Text>
                        <Text>Thank you for being patient!</Text>
                        <Text>Powered by Readio</Text>
                    </View>
                </View> 

                <View style={{flex: 1, marginHorizontal: 10}}>
                    <View style={{marginTop: 'auto'}}>
                        <View style={{height: 40}}>
                            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
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
        backgroundColor: 'rgba(0,0,0,0.2)',
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