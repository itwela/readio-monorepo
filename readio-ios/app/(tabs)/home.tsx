import { colors } from "@/constants/tokens";
import { StyleSheet, TouchableOpacity, ScrollView, Animated } from "react-native";
import { readioRegularFont, readioBoldFont } from "@/constants/tokens";
import { Text, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { buttonStyle, utilStyle } from "@/constants/tokens";
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo'
import { Readio, Station } from '@/types/type';
import { useRef, useState, useEffect } from 'react'
import { useReadio } from '@/constants/readioContext';
import NotSignedIn from '@/constants/notSignedIn';
import { useNavigationSearch } from '@/hooks/useNavigationSearch'
import { fetchAPI } from '@/lib/fetch';
import { useMemo } from 'react';
import { useNavigation } from "@react-navigation/native";
import { RootNavigationProp } from "@/types/type";
import { trackTitleFilter } from '@/helpers/filter'
import { useQueue } from '@/store/queue'
import ReactNativeBlobUtil from 'react-native-blob-util'
import s3 from '@/helpers/s3Client';
import FastImage from "react-native-fast-image";
import circ from "../../assets/images/fadedOrangeCircle.png"
import { useFetch } from "@/lib/fetch";
import { filter } from '@/constants/images';

export default function HomeTabOne() {
  
  return (
    <>
      <SafeAreaView style={[utilStyle.safeAreaContainer, {backgroundColor: colors.readioBrown, width: '100%', padding: utilStyle.padding.padding}]}>
      
        <SignedIn>
          <SignedInHomeTabOne/>
        </SignedIn>

        <SignedOut>
          <SignedOutHomeTabOne/>        
        </SignedOut>

      </SafeAreaView>
    </>
  );
}

function SignedInHomeTabOne() {

  const { user } = useUser()

  // console.log("user: ", user?.id)

  const url = user?.id ? `/(api)/${user.id}` : ''; // Default to an empty string if user.id is null
  // console.log("url: ", url)
  const { data: stations, loading, error } = useFetch<Station[]>(url);
  // console.log("data: ", stations)
  // const { data: stations, loading, error } = useFetch<Station[]>(`/(api)/${user?.id}`,); 
  
  // const stations: Station[] = []

  const [readios, setReadios] = useState<{ data: Readio[] }>({ data: [] })
  const [generatedReadios, setGeneratedReadios] = useState<Readio | undefined>()
  const [selectedReadio, setSelectedReadio] = useState<{ data: Readio[] }>({ data: [] })
  const { readioIsGeneratingRadio, setReadioIsGeneratingRadio } = useReadio()
  const [ selectedTopic, setSelectedTopic ] = useState("")
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial value for opacity: 0
  const {activeStationName, setActiveStationName} = useReadio()

  const search = useNavigationSearch({ searchBarOptions: { placeholder: 'Find in songs' },})
  const tracks = readios.data
  
  useEffect(() => {
    const getReadios = async () => {
      const response = await fetchAPI(`/(api)/getReadios`, {
        method: "POST",
        body: JSON.stringify({
          clerkId: user?.id as string,
          topic: selectedTopic,
          tag: "public",
        }),
      });
      setReadios(response)

      console.log("readios: ", readios)
    }
    // NOTE
    // getReadios()
  }, [readios.data, selectedTopic])

  useEffect(() => {

    const sayHello = async () => {
    
      const response = await fetchAPI(`/(api)/hello`, {
        method: "POST",
      }); 
    }
    // sayHello()

  }, [])
  
  const filteredTracks = useMemo(() => {
    if (!search) return tracks
    return tracks.filter(trackTitleFilter(search))
  }, [search, tracks])
  
  const navigation = useNavigation<RootNavigationProp>(); // use typed navigation  
  const queueOffset = useRef(0)
  const { activeQueueId, setActiveQueueId } = useQueue() 
  const [sToast, setSToast] = useState(false)
  const [toastMessege, setToastMessege] = useState("")
  
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

  const handleStationPress = async (topic: string) => {

    // creat a radio with the topic given
    console.log("topic: ", topic)
    setSelectedTopic(topic)
    setReadioIsGeneratingRadio?.(true)
    setActiveStationName?.(topic)

    navigation.navigate("radioLoading"); // <-- Using 'player' as screen name
    // showToast("Please wait while we generate your radio")

    if (readioIsGeneratingRadio === true) {
      showToast("Please wait while we generate your radio")
    }



    console.log("strting to generate title")
    const getTitle = await fetchAPI(`/(api)/openAi/generateTitle`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        top: topic,
      }),
    });
    const titleData = await getTitle
    const theTitle = titleData?.data?.newMessage


    const response = await fetchAPI(`/(api)/openAi/generateReadio`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: theTitle,
        topic: topic,
        // voice: "hJ9aNCtXg5rLXeFF18zw",
        clerkId: user?.id as string,
        username: user?.fullName,
        tag: 'public'
      }),
    });

    // NOTE: this is the data from the resoponse variable
    const data = await response;
    const textToRead = data?.data?.newMessage
    const readioId = data?.data?.readioId
    const userId = data?.data?.userId

    console.log("Starting ElevenLabs....");

    async function fetchAudioFromElevenLabsAndReturnFilePath(
      text: string,
      apiKey: string,
      voiceId: string,
    ): Promise<string> {
      const baseUrl = 'https://api.elevenlabs.io/v1/text-to-speech'
      const headers = {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      }
    
      const requestBody = {
        text,
        voice_settings: { similarity_boost: 0.5, stability: 0.5 },
      }
    
      const response = await ReactNativeBlobUtil.config({
        // add this option that makes response data to be stored as a file,
        // this is much more performant.
        fileCache: true,
        appendExt: 'mp3',
      }).fetch(
        'POST',
        `${baseUrl}/${voiceId}`,
        headers,
        JSON.stringify(requestBody),
      )
      const { status } = response.respInfo
    
      if (status !== 200) {
        throw new Error(`HTTP error! status: ${status}`)
      }
    
      return response.path()
    }

    const path = await fetchAudioFromElevenLabsAndReturnFilePath(
      textToRead,
      'bc2697930732a0ba97be1d90cf641035',
      "hJ9aNCtXg5rLXeFF18zw",
    )

    const base64Audio = await ReactNativeBlobUtil.fs.readFile(path, 'base64');
    const audioBuffer = Buffer.from(base64Audio, 'base64');

    // Upload the audio file to S3
    const s3Key = `${readioId}.mp3`;  // Define the file path within the S3 bucket
    await s3.upload({
      Bucket: "readio-audio-files",  // Your S3 bucket name
      Key: s3Key,
      Body: audioBuffer, // Read file as Base64
      ContentEncoding: 'base64', // Specify base64 encoding
      ContentType: 'audio/mpeg', // Specify content type
    }).promise();

    const s3Url = `https://readio-audio-files.s3.us-east-2.amazonaws.com/${s3Key}`;
    console.log("S3 URL: ", s3Url);

    // Save S3 URL to the Neon database
    async function addPathToDB(s3Url: string, readioId: any, userId: any) {
      await fetchAPI(`/(api)/addReadioPathToDb`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: s3Url,
          readioId: readioId,
          userId: userId
        }),
      });


    }

    await addPathToDB(s3Url, readioId, userId);

    console.log("Audio successfully uploaded to S3 and path saved to the database.");
   
    const getReadios = async () => {
      console.log("getting new readio....")

      const response = await fetchAPI(`/(api)/getNewReadio`, {
        method: "POST",
        body: JSON.stringify({
          clerkId: user?.id as string,
          id: readioId as number
        }),
      });



      return response;
    }

    const unPackingNewReadio = await getReadios()
    console.log("unPackingNewReadio: ", unPackingNewReadio)
    setSelectedReadio(unPackingNewReadio)

    setReadioIsGeneratingRadio?.(false)

    showToast("All done! 👍")

    hideToast()

    navigation.navigate("player"); // <-- Using 'player' as screen name

  }

  const showPLayer = () => {
    navigation.navigate("player"); // <-- Using 'player' as screen name
  }

  return (
    <>
      <SafeAreaView style={[utilStyle.safeAreaContainer, {backgroundColor: colors.readioBrown, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: "flex-start", height: "100%"}]}>
      
        <View style={{ width:'100%', position: "absolute",
           display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>  
                    <TouchableOpacity activeOpacity={0.9} onPress={() => router.push('/(tabs)/home')} style={{display: 'flex', flexDirection: 'row'}}>
                        <Text style={{fontSize: 20, fontWeight: 'bold', color: colors.readioOrange, fontFamily: readioBoldFont}}>R</Text>
                    </TouchableOpacity>
        </View>

        <ScrollView style={{ 
          width: '100%', 
          height: '100%',
          }}>


          <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate("radioLoading")}>
            <Text style={styles.heading}>Lotus</Text>
          </TouchableOpacity>
          <View style={{position: "relative", width: "100%"}}>
            <FastImage source={circ} style={[{zIndex: -1, width: 250, height: 300, position: "absolute", alignSelf: "center", top: -70, opacity: 0.7}]} resizeMode='contain'/>
          </View>
          {/* <View style={styles.gap}/> */}

          <Text style={styles.title}>Stations</Text>
          <Text style={styles.option}>Dive into some of your favorite interests!</Text>

          {sToast === true && (
                  <>
                    <Animated.View style={styles.toast}>
                      <Text>{toastMessege}</Text>
                    </Animated.View>
                  </>
          )}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stationContainer}>
            <View style={{ display: 'flex', flexDirection: 'column', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 10, width: '100%', backgroundColor: "transparent"}}>
            {stations?.map((station) => (
              <View key={station.id} style={[styles.readioRadioContainer, { marginRight: 12 }]}>
                <TouchableOpacity onPress={() => handleStationPress(station?.name as string)} activeOpacity={0.9} style={styles.station}>
                  <FastImage source={{uri: filter}} style={[styles.stationImage, {zIndex: 1, opacity: 0.4, position: 'absolute'}]} resizeMode='cover'/>
                  <FastImage source={{uri: station.imageurl}} style={styles.stationImage} resizeMode='cover'/>
                  <Text style={styles.stationName} numberOfLines={2}>{station.name}</Text>
                </TouchableOpacity>
              </View>
            ))}
            </View>
          </ScrollView>
          <View style={styles.gap}/>
          <Text style={styles.title}>Listen now</Text>
          <Text style={styles.option}>Don’t know where to start? Try our very own, curated Readio station!</Text>
          <TouchableOpacity activeOpacity={0.95} onPress={() => handleStationPress(stations?.[0]?.name as string)} style={styles.nowPlaying}>
            <View style={[styles.nowPlayingOverlay, {zIndex: 2}]}>
              <Text style={[styles.nowPlayingText]} numberOfLines={1}>{stations?.[0]?.name}</Text>
            </View>
            {/* <Image source={{uri: stations?.[0]?.imageurl}} style={styles.nowPlayingImage} resizeMode='cover'/> */}
            <FastImage source={{uri: filter}} style={[styles.nowPlayingImage, {zIndex: 1, opacity: 0.4}]} resizeMode='cover'/>
            <FastImage source={{uri: stations?.[0]?.imageurl}} style={styles.nowPlayingImage} resizeMode='cover'/>
         </TouchableOpacity>
         <Text onPress={showPLayer} style={{marginHorizontal: 10, marginTop: 5, color: colors.readioWhite}}>Show Player</Text>

        </ScrollView>

        </SafeAreaView>
    </>
  );

}

function SignedOutHomeTabOne() {

    return (
      <>

      <ScrollView style={{ 
        width: '100%', 
        minHeight: '100%',
        display: 'flex',
      }}
      contentContainerStyle={{
        alignItems: 'center',  
      }}
      >

    <View style={{ width:'100%', height: '6%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>  
        <TouchableOpacity onPress={() => router.push('/(auth)/welcome')} style={{display: 'flex', flexDirection: 'row'}}>
            <Text style={{fontSize: 20, fontWeight: 'bold', color: colors.readioOrange}}>L</Text>
        </TouchableOpacity>
    </View>

    <NotSignedIn/>

      </ScrollView>

      </>

    )

}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
  },
  text: {
      fontSize: 60,
      fontWeight: 'bold',
      fontFamily: readioBoldFont,
      color: colors.readioWhite
  },
  subtext: {
    fontSize: 15,
    opacity: 0.5,
    textAlign: 'center',
    fontFamily: readioRegularFont,
    color: colors.readioWhite
},
animatedBorder: {
  // position: 'absolute',
  // top: 0,
  // left: 0,
  // right: 0,
  // bottom: 0,
  borderWidth: 2,
  borderRadius: 10,
  borderStyle: 'solid',
  zIndex: 5,
  borderColor: colors.readioOrange
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
scrollView: { 
  width: '90%',
  minHeight: '100%' ,
},
heading: {
  fontSize: 90,
  fontWeight: 'bold',
  textAlign: 'center',
  color: colors.readioWhite,
  zIndex: 1,
  fontFamily: readioBoldFont
},
option: {
  fontSize: 12,
  paddingBottom: 10,
  color: colors.readioWhite,
  width: "80%",
  alignSelf: 'center',
  textAlign: 'center',
  fontFamily: readioRegularFont
},
title: {
  fontSize: 30,
  // fontWeight: 'bold',
  textAlign: 'center',
  marginBottom: 10,
  color: colors.readioWhite,
  fontFamily: readioRegularFont
},
gap: {
  marginVertical: 20,
},
readioRadioContainer: {
  // display: 'flex',
  // flexDirection: 'row',
  // flexWrap: 'wrap',
  // gap: 50,
  // alignItems: 'center',
  // justifyContent: 'space-between',
  width: 160,
  // backgroundColor: colors.readioOrange
},
stationContainer: {
  width: '100%',
  height: 410,
  // flexWrap: 'wrap',
  // gap: 10,
},
station: {
  width: 140,
  height: 140,
  marginVertical: 15,
},
stationImage: {
  width: 170,
  height: 160, 
  overflow: 'hidden',
  borderRadius: 10, 
  position: 'relative',
  // borderWidth: 5,
  // borderStyle: 'solid',
  // borderColor: colors.readioOrange,
},
stationName: {
  fontWeight: 'bold',
  textAlign: 'left',
  marginVertical: 5,
  width: '80%',
  color: colors.readioWhite,
  position: 'absolute',
  zIndex: 1,
  bottom: 0,
  left: 0,
  transform: [{ translateX: 10 }, { translateY: 10 }],
  fontFamily: readioRegularFont
},
nowPlaying: {
  borderRadius: 10,
  width: '95%',
  height: 300,
  marginVertical: 10,
  alignSelf: 'center',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
},
nowPlayingOverlay: {
  position: 'absolute', 
  zIndex: 1, 
  top: 0, 
  left: 0, 
  width: '100%', 
  height: 300, 
  borderRadius: 10, 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  backgroundColor: 'transparent'
},
nowPlayingText: {
  color: colors.readioWhite, 
  zIndex: 1, 
  fontWeight: 'bold', 
  fontSize: 20, 
  padding: 10,
  fontFamily: readioRegularFont
},
nowPlayingImage: {
  width: '100%', 
  height: 300, 
  overflow: 'hidden', 
  position: 'absolute', 
  right: 0, 
  top: 0, 
  borderRadius: 10
}
});