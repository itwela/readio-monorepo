import { StyleSheet, Touchable, TouchableOpacity, Modal, Button } from 'react-native';
import { ReadioTracksList } from '@/components/ReadioTrackList';
import { Text, View } from '@/components/Themed';
import { useTracks } from '@/store/library';
import { useMemo } from 'react';
import { trackTitleFilter } from '@/helpers/filter'
import { useNavigationSearch } from '@/hooks/useNavigationSearch'
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native';
import { Href, router } from 'expo-router';
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo'
import NotSignedIn from '@/constants/notSignedIn';
import { Readio } from '@/types/type';
import { fetchAPI } from '@/lib/fetch';
import { useEffect, useState } from 'react';
import { Image } from 'react-native';
import { useReadio } from '@/constants/readioContext';
import InputField from '@/components/inputField';
import { Audio, AVPlaybackStatusSuccess } from 'expo-av';
import { ElevenLabsClient, play } from "elevenlabs";
import { createWriteStream } from "fs";
import { v4 as uuid } from "uuid";
import ReactNativeBlobUtil from 'react-native-blob-util'
import s3 from '@/helpers/s3Client';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';

export default function TabTwoScreen() {
  const search = useNavigationSearch({
    searchBarOptions: {
      placeholder: 'Find in songs',
    },
  })

  const tracks = useTracks()

  const filteredTracks = useMemo(() => {
    if (!search) return tracks
    return tracks.filter(trackTitleFilter(search))
  }, [search, tracks])
  const { user } = useUser()
  const [readios, setReadios] = useState<{ data: Readio[] }>({ data: [] })
  const {readioSelectedReadioId, setReadioSelectedReadioId} = useReadio()

  const handleGoToSelectedReadio = (readioId: number) => {
    setReadioSelectedReadioId?.(readioId)
    router.push(`/(tabs)/(library)/${readioId}` as Href)
  }

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

  const [isModalVisible, setIsModalVisible] = useState(false);
  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const [form, setForm] = useState({
    title: '',
    topic: ''
  })

  const elevenlabs = new ElevenLabsClient({
    apiKey: "bc2697930732a0ba97be1d90cf641035"
  });
 
  const [status, setStatus] = useState('');
  const handleGenerateReadio = async () => {
    
    console.log("Starting Client Api Call....");
    const response = await fetchAPI(`/(api)/openAi/generateReadio`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: form.title,
        topic: form.topic,
        // voice: "hJ9aNCtXg5rLXeFF18zw",
        clerkId: user?.id as string,
        username: user?.fullName
      }),
    });

    // NOTE: this is the data from the resoponse variable
    const data = await response;
    const textToRead = data.data.newMessage
    const readioId = data.data.readioId
    const userId = data.data.userId

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
    const waitForDiJustFinishedPlaying = (sound: Audio.Sound) =>
      new Promise(resolve => {
        sound.setOnPlaybackStatusUpdate(
          (playbackStatus) => { // Keep the parameter type as is
            const status = playbackStatus as AVPlaybackStatusSuccess; // Type assertion
            if (status.didJustFinish) {
              resolve(null)
            }
          },
        )
    })
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

    // Optionally play the audio after uploading
    console.log("Playing sound....")
    const { sound } = await Audio.Sound.createAsync(
      { uri: `file://${path}`},
      { shouldPlay: true, progressUpdateIntervalMillis: 10 },
    );

  
    await waitForDiJustFinishedPlaying(sound)
    // ReactNativeBlobUtil.fs.unlink(path)
    return data;

  }


  return (
    <SafeAreaView style={{
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#fff'
    }}>

    <ScrollView style={{ 
      width: '90%', 
      minHeight: '100%' 
      }}>

      <SignedIn>

        <Text style={styles.heading}>Library</Text>
        <View style={{ 
          paddingVertical: 5
        }}>
          <Text style={styles.option} onPress={() => router.push('/(tabs)/(library)/(playlist)')}>Playlist</Text>
          <Text style={styles.option} onPress={() => router.push('/all-readios')}>All Readios</Text>
        </View>
        <View style={{marginVertical: 15}}/>
        <Text style={styles.title}>Recently Saved Readios</Text>


        <Modal
          animationType="slide" 
          transparent={true} 
          visible={isModalVisible}
          onRequestClose={toggleModal}
          style={{width: '100%', height: '100%'}}
        >
          <SafeAreaView style={{width: '100%', height: '100%'}}>

            <View style={{padding: 20, backgroundColor: '#fff', width: '100%', height: '100%', display: 'flex'}}>
              
              <View style={{width: '100%', display: 'flex', alignItems: 'flex-end'}}>
                <Button color='#fc3c44' title="Close" onPress={toggleModal} />
              </View>

              <Text style={styles.heading}>New Readio</Text>
              <View style={{marginVertical: 10}}>               
                <InputField onChangeText={(text) => setForm({...form, title: text})} placeholder="Name your Readio here" style={{width: '100%', height: 50, padding: 15}} label="Title"></InputField>
                <InputField onChangeText={(text) => setForm({...form, topic: text})} placeholder="What type of content do you want to listen to?" style={{width: '100%', height: 50, padding: 15}} label="Topic"></InputField> 
                <Text style={{color: '#fc3c44', marginTop: 10}} onPress={handleGenerateReadio}>Generate</Text>
                {/* <Text style={{color: '#fc3c44', marginTop: 10}} onPress={playReadio}>Generate</Text> */}
                {/* <Text>{text}</Text> */}
              </View>
          </View>

          </SafeAreaView>
        </Modal>


        <View style={styles.recentlySavedContainer}>
        
        {readios?.data?.length === 0 && (
          <>
           <TouchableOpacity activeOpacity={0.9} onPress={toggleModal} style={styles.recentlySavedItems}>
              <View style={styles.recentlySavedImg}>
                <Text style={styles.readioRedTitle}>+</Text>
                {/* <Image source={{uri: stations?.[0]?.imageurl}} style={styles.nowPlayingImage} resizeMode='cover'/> */}
              </View>
              <Text style={styles.readioRedTitle}>Create a Readio</Text>
            </TouchableOpacity>
          </>
        )}
        
        {readios?.data?.length > 0 && (
          <>
          {readios.data.map((readio: Readio) => (
            <TouchableOpacity activeOpacity={0.9} onPress={() => handleGoToSelectedReadio(readio?.id as number)} key={readio.id} style={styles.recentlySavedItems}>
              <View style={styles.recentlySavedImg}>
                <Image source={{uri: readio.image}} style={styles.nowPlayingImage} resizeMode='cover'/>
                {/* <Image source={{uri: stations?.[0]?.imageurl}} style={styles.nowPlayingImage} resizeMode='cover'/> */}
              </View>
              <Text style={styles.recentlySavedTItle}>{readio.title}</Text>
              <Text style={styles.recentlySavedSubheading}>{readio.topic}</Text>
            </TouchableOpacity>
          ))}
             <TouchableOpacity activeOpacity={0.9} onPress={toggleModal} style={styles.recentlySavedItems}>
              <View style={styles.recentlySavedImg}>
                <Text style={styles.readioRedTitle}>+</Text>
                {/* <Image source={{uri: stations?.[0]?.imageurl}} style={styles.nowPlayingImage} resizeMode='cover'/> */}
              </View>
              <Text style={styles.readioRedTitle}>Create a Readio</Text>
            </TouchableOpacity>
          </>

        )}

        </View>
        <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
        {/* <EditScreenInfo path="app/(tabs)/two.tsx" /> */}

      </SignedIn>

      <SignedOut>

        <NotSignedIn />

      </SignedOut>

    </ScrollView>
    
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readioRedTitle: {
    color: '#fc3c44',
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  recentlySavedContainer: {
    display: 'flex',
    gap: 10,
    flexDirection: 'row',
    width: '100%',
    height: 'auto',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 15,
  },
  recentlySavedItems: {
    display: 'flex',
    width: '48%',
    height: 'auto',
    gap: 5,
  },
  recentlySavedImg: {
    width: '100%',
    height: 150,
    backgroundColor: '#ccc',
    borderRadius: 5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentlySavedTItle: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  recentlySavedSubheading: {
    fontSize: 15,
  },
  nowPlayingImage: {
    width: '100%', 
    height: 150, 
    overflow: 'hidden', 
    position: 'absolute', 
    right: 0, 
    top: 0, 
    borderRadius: 10
  },
  heading: {
    fontSize: 60,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  option: {
    fontSize: 20,
    paddingVertical: 10
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
