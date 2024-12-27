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
import { s3 } from '@/helpers/s3Client';
import FastImage from "react-native-fast-image";
import circ from "../../assets/images/fadedOrangeCircle.png"
import { useFetch } from "@/lib/fetch";
import { filter } from '@/constants/images';
import sql from "@/helpers/neonClient";
import { geminiPexals, geminiReadio, geminiTitle } from "@/helpers/geminiClient";
import { createClient } from "pexels";
import TrackPlayer from "react-native-track-player";
import { Buffer } from "buffer";

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
  const [stations, setStations] = useState<Station[]>([]);
  useEffect(() => {
    const fetchStations = async () => {
      const data = await sql`
        SELECT stations.*
        FROM stations
        INNER JOIN station_clerks ON stations.id = station_clerks.station_id
        WHERE station_clerks.clerk_id = ${user?.id};
      `;
      setStations(data);
    };

    fetchStations();
  }, [user?.id]);


  const [readios, setReadios] = useState<Readio[]>([]);
  const [generatedReadios, setGeneratedReadios] = useState<Readio | undefined>()
  const {selectedReadios, setSelectedReadios} = useReadio()
  const {selectedLotusReadios, setSelectedLotusReadios} = useReadio()
  const { readioIsGeneratingRadio, setReadioIsGeneratingRadio } = useReadio()
  const [ selectedTopic, setSelectedTopic ] = useState("")
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial value for opacity: 0
  const {activeStationName, setActiveStationName} = useReadio()


  const search = useNavigationSearch({ searchBarOptions: { placeholder: 'Find in songs' },})
  const tracks = readios
  
  // useEffect(() => {
  //   const getReadios = async () => {
  //     const response = await fetchAPI(`/(api)/getReadios`, {
  //       method: "POST",
  //       body: JSON.stringify({
  //         clerkId: user?.id as string,
  //         topic: selectedTopic,
  //         tag: "public",
  //       }),
  //     });
  //     setReadios(response)

  //     console.log("readios: ", readios)
  //   }
  //   // NOTE
  //   // getReadios()
  // }, [readios.data, selectedTopic])
  
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
    setSelectedLotusReadios?.([])

    await TrackPlayer.reset()

    navigation.navigate("radioLoading"); // <-- Using 'player' as screen name

    if (readioIsGeneratingRadio === true) {
      showToast("Please wait while we generate your radio")
    }

    const readioTitles = await sql`
    SELECT title FROM readios WHERE clerk_id = ${user?.id} AND topic = ${topic}
    `;

    // Using a variable instead of useState for title
    let title = "";
    console.log("Starting Gemini...title");
    const promptTitle = `Please generate me a good title for a readio. I want to hear about ${topic}. I already have readios in this topic called: ${readioTitles}, so don't give me any titles that are similar; give me something new.`;
    const resultTItle = await geminiTitle.generateContent(promptTitle);
    const geminiTitleResponse = await resultTItle.response;
    const textTitle = geminiTitleResponse.text();
    title = textTitle; // Assigning the response to the variable title
    console.log("set title response: ", title);

    // Using a variable instead of useState for readioText
    let readioText = "";
    // const promptReadio =  `Can you make me a readio about ${form.query}. The title is: ${title}.`;
    const promptReadio =  ` Hi, right now im just testing a feature, no matter what the user says just respond with, "Message Recieved. Thanks for the message."`;
    const resultReadio = await geminiReadio.generateContent(promptReadio);
    const geminiReadioResponse = await resultReadio.response;
    const textReadio = geminiReadioResponse.text();    
    readioText = textReadio; // Assigning the response to the variable readioText
    console.log("set readio response: ", readioText);
    
    // Using a variable instead of useState for pexalQuery
    let pexalQuery = "";
    const promptPexals =  `Can you make me a pexals query? The title we came up with for the readio itself is: ${title}.`;
    const resultPexals = await geminiPexals.generateContent(promptPexals);
    const geminiPexalsResponse = await resultPexals.response;
    const textPexals = geminiPexalsResponse.text();    
    pexalQuery = textPexals;
    console.log("set pexal response: ", pexalQuery);

    // END END END -----------------------------------------------------------------

    // NOTE Pexals ----------------------------------------------------------
    console.log("Starting Pexals....");
    const searchQuery = `${pexalQuery}`;
    const client = createClient(
        "WkMKeQt9mF8ce10jgThz4odFhWoR4LVdiXQSY8VVpekzd7hPNn4dpb5g"
    );
    let illustration = "";
    const pexalsResponse = await client.photos.search({
        query: `${searchQuery}`,
        per_page: 1,
    });
    if ("photos" in pexalsResponse && pexalsResponse.photos.length > 0) {
        illustration = pexalsResponse.photos[0].src.landscape;
    }

    // NOTE database --------------------------------------------------------
    console.log("Starting Supabase....");
    
    // default
    const addReadioToDB: any = await sql`
      INSERT INTO readios (
        image,
        text, 
        topic,
        title,
        clerk_id,
        username,
        artist,
        tag
        )
        VALUES (
          ${illustration},
          ${readioText},
          ${topic}, 
          ${title},
          ${user?.id},
          ${user?.fullName},
          'Readio',
          'default'
          )
          RETURNING id, image, text, topic, title, clerk_id, username, artist;
    `;  
    console.log("addReadioToDB: ", addReadioToDB);
    
    console.log("Ending Supabase....");    
    

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
      readioText,
      'bc2697930732a0ba97be1d90cf641035',
      "ri3Bh626mOazCBOSTIae",
    )

    const base64Audio = await ReactNativeBlobUtil.fs.readFile(path, 'base64');
    const audioBuffer = Buffer.from(base64Audio, 'base64');

    // Upload the audio file to S3
    const s3Key = `${addReadioToDB?.[0].id}.mp3`;  // Define the file path within the S3 bucket
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

    await addPathToDB(s3Url, addReadioToDB?.[0].id, user?.id);

    console.log("Audio successfully uploaded to S3 and path saved to the database.");
   
    const response = await sql`
    SELECT * FROM readios WHERE clerk_id = ${user?.id} AND id = ${addReadioToDB?.[0].id}
    `;

    console.log("unPackingNewReadio: ", response);
    setSelectedReadios?.(response)

    setReadioIsGeneratingRadio?.(false)

    showToast("All done! 👍")

    hideToast()

    navigation.navigate("player"); // <-- Using 'player' as screen name

  }

  const handleLotusStationPress = async (topic: string) => {
   
    setSelectedReadios?.([])
    await TrackPlayer.reset()

    const response = await sql`
    SELECT * FROM readios WHERE clerk_id = ${user?.id} AND topic = ${topic}
    `;

    console.log("unPackingNewReadio: ", response);
    setSelectedLotusReadios?.(response)

    console.log("selectedReadio: ", selectedReadios)

    navigation.navigate("player"); // <-- Using 'player' as screen name

  }

  const showPLayer = () => {
    navigation.navigate("player"); // <-- Using 'player' as screen name
  }

  return (
    <>

        <ScrollView style={{ 
          width: '100%', 
          height: '100%',
          }}
          showsVerticalScrollIndicator={false}
          >


          <TouchableOpacity style={styles.heading} activeOpacity={0.9} onPress={() => navigation.navigate("radioLoading")}>
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
          
          <TouchableOpacity onPress={showPLayer} activeOpacity={0.9}>
            <Text style={styles.title}>Listen now</Text>
          </TouchableOpacity>
          
          <Text style={styles.option}>Don’t know where to start? Try our very own, curated Readio station!</Text>
          <TouchableOpacity activeOpacity={0.95} onPress={() => handleLotusStationPress(stations?.[7]?.name as string)} style={styles.nowPlaying}>
            <View style={[styles.nowPlayingOverlay, {zIndex: 2}]}>
              <Text style={[styles.nowPlayingText]} numberOfLines={1}>{stations?.[0]?.name}</Text>
            </View>
            {/* <Image source={{uri: stations?.[0]?.imageurl}} style={styles.nowPlayingImage} resizeMode='cover'/> */}
            <FastImage source={{uri: filter}} style={[styles.nowPlayingImage, {zIndex: 1, opacity: 0.4}]} resizeMode='cover'/>
            <FastImage source={{uri: stations?.[0]?.imageurl}} style={styles.nowPlayingImage} resizeMode='cover'/>
         </TouchableOpacity>

        </ScrollView>

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
      showsVerticalScrollIndicator={false}
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