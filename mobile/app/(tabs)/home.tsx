import { StyleSheet, TouchableOpacity, TouchableOpacityBase, Image } from 'react-native';
import { Text } from '@/components/Themed';
import { ScrollView, SafeAreaView, View } from 'react-native';
import { useTracks } from '@/store/library';
import { useMemo } from 'react';
import { trackTitleFilter } from '@/helpers/filter'
import { useNavigationSearch } from '@/hooks/useNavigationSearch'
import { router } from 'expo-router';
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo'
import { Link } from 'expo-router'
import { buttonStyle } from "@/constants/tokens";
import NotSignedIn from '@/constants/notSignedIn';
import { useFetch } from "@/lib/fetch";
import { Readio, Station } from '@/types/type';
import { useNavigation } from "@react-navigation/native";
import { RootNavigationProp } from "@/types/type";
import { fetchAPI } from '@/lib/fetch';
import TrackPlayer, { Track } from 'react-native-track-player'
import { TracksListProps } from '@/components/ReadioTrackList';
import { useRef, useState, useEffect } from 'react'
import { useQueue } from '@/store/queue'
import ReactNativeBlobUtil from 'react-native-blob-util'
import s3 from '@/helpers/s3Client';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';
import { Audio, AVPlaybackStatusSuccess } from 'expo-av';
import { generateTracksListId } from '@/helpers/misc'
import FastImage from 'react-native-fast-image';


export default function TabOneScreen() {

  const { user } = useUser()
  const { data: stations, loading, error } = useFetch<Station[]>(`/(api)/${user?.id}`);   
  const [readios, setReadios] = useState<{ data: Readio[] }>({ data: [] })


  const search = useNavigationSearch({
    searchBarOptions: {
      placeholder: 'Find in songs',
    },
  })

  const tracks = readios.data
  useEffect(() => {
    const getReadios = async () => {
      const response = await fetchAPI(`/(api)/getReadios`, {
        method: "POST",
        body: JSON.stringify({
          clerkId: user?.id as string,
        }),
      });

      setReadios(response)

    }

    getReadios()
  }, [readios.data, user?.id])
  const filteredTracks = useMemo(() => {
    if (!search) return tracks
    return tracks.filter(trackTitleFilter(search))
  }, [search, tracks])

  const navigation = useNavigation<RootNavigationProp>(); // use typed navigation
     
  const queueOffset = useRef(0)
  const { activeQueueId, setActiveQueueId } = useQueue() 
  const handleStationPress = async (topic: string) => {

    // creat a radio with the topic given
    console.log("topic: ", topic)


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

    console.log("the title: ", theTitle)

    console.log("strting to generate readio")
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
        username: user?.fullName
      }),
    });

    // NOTE: this is the data from the resoponse variable
    const data = await response;
    console.log("data: ", data)
    const textToRead = data?.data?.newMessage
    const readioId = data?.data?.readioId
    const userId = data?.data?.userId
    const newReadio = readios.data.find((readio) => readio?.id === readioId)


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
    console.log("path: ", path);

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
  
    const handleTrackSelect = async (selectedTrack: Track, id: string) => {
      const theSelectedTrack = readios.data.find((readio) => readio?.url === selectedTrack.url)
      const trackIndex = tracks.findIndex((track) => track.url === theSelectedTrack?.url)
      console.log('selectedTrack', selectedTrack)
      
      if (trackIndex === -1) return
  
      const isChangingQueue = id !== activeQueueId
  
      if (isChangingQueue) {
        const beforeTracks = tracks.slice(0, trackIndex)
        const afterTracks = tracks.slice(trackIndex + 1)
  
        await TrackPlayer.reset()
  

        // we construct the new queue
        await TrackPlayer.add(selectedTrack)
        await TrackPlayer.add(afterTracks)
        await TrackPlayer.add(beforeTracks)
  
        await TrackPlayer.play()
  
        queueOffset.current = trackIndex
        setActiveQueueId(id)
      } else {
        const nextTrackIndex =
          trackIndex - queueOffset.current < 0
            ? tracks.length + trackIndex - queueOffset.current
            : trackIndex - queueOffset.current
  
        await TrackPlayer.skip(nextTrackIndex)
        await TrackPlayer.play()
      }
    }

    handleTrackSelect(newReadio!, generateTracksListId('songs', readios?.data?.filter(readio => readio.id === readioId).map((readio: Readio) => readio.title).filter(Boolean).join(',')))

    navigation.navigate("player"); // <-- Using 'player' as screen name
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>

        <SignedIn>

          <Text style={styles.heading}>Home</Text>
          <View style={styles.gap}/>
          <Text style={styles.title}>Readio Stations</Text>
          <View style={styles.stationContainer}>
            {stations?.map((station) => (
              <View key={station.id} style={styles.readioRadioContainer}>
                <TouchableOpacity onPress={() => handleStationPress(station?.name as string)} activeOpacity={0.9} style={styles.station}>
                  {/* <Image source={{uri: station.imageurl}} style={styles.stationImage} resizeMode='cover'/> */}
                  <FastImage source={{uri: station.imageurl}} style={styles.stationImage} resizeMode='cover'/>
                  <Text style={styles.stationName}>{station.name}</Text>
                </TouchableOpacity>
              </View>
            ))}
              {/* <View style={styles.station}></View> */}
              {/* <View style={styles.station}></View> */}
              {/* <View style={styles.station}></View> */}
          </View>
          <View style={styles.gap}/>
          <Text style={styles.title}>Listen now</Text>
          <View style={styles.nowPlaying}>
            <View style={styles.nowPlayingOverlay}>
              <Text style={styles.nowPlayingText}>{stations?.[0]?.name}</Text>
            </View>
            {/* <Image source={{uri: stations?.[0]?.imageurl}} style={styles.nowPlayingImage} resizeMode='cover'/> */}
            <FastImage source={{uri: stations?.[0]?.imageurl}} style={styles.nowPlayingImage} resizeMode='cover'/>
         </View>

        </SignedIn>


        <SignedOut>

          <NotSignedIn/>

        </SignedOut>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  scrollView: { 
    width: '90%',
    minHeight: '100%' ,
  },
  readioRadioContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: 50,
    alignItems: 'center',
  },
  heading: {
    fontSize: 60,
    fontWeight: 'bold',
  },
  option: {
    fontSize: 20,
    paddingVertical: 10
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  gap: {
    marginVertical: 20,
  },
  stationContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: 20,
  },
  station: {
    borderRadius: 100,
    width: 80,
    height: 80,
    marginVertical: 10,
  },
  stationImage: {
    width: 80, 
    height: 80, 
    borderRadius: 100, 
    overflow: 'hidden'
  },
  stationName: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
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
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  nowPlayingText: {
    color: 'white', 
    zIndex: 1, 
    fontWeight: 'bold', 
    fontSize: 20, 
    padding: 10
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
