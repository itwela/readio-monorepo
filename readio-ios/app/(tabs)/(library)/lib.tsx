import { SafeAreaView } from 'react-native-safe-area-context'; 
import { buttonStyle, utilStyle } from "@/constants/tokens";
import { colors } from "@/constants/tokens";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal, Button } from "react-native";
import { readioRegularFont, readioBoldFont } from "@/constants/tokens";
import { useTracks } from '@/store/library';
import { useMemo } from 'react';
import { trackTitleFilter } from '@/helpers/filter'
import { useNavigationSearch } from '@/hooks/useNavigationSearch'
import { Href, router } from 'expo-router';
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo'
import NotSignedIn from '@/constants/notSignedIn';
import { Readio, UserStuff } from '@/types/type';
import { fetchAPI } from '@/lib/fetch';
import { useEffect, useState } from 'react';
import { Image } from 'react-native';
import { useReadio } from '@/constants/readioContext';
import InputField from '@/components/inputField';
// import { Audio, AVPlaybackStatusSuccess } from 'expo-av';
import { ElevenLabsClient, play } from "elevenlabs";
import { createWriteStream } from "fs";
import ReactNativeBlobUtil from 'react-native-blob-util'
import s3 from '@/helpers/s3Client';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';
import FastImage from 'react-native-fast-image';
import { retryWithBackoff } from "@/helpers/retryWithBackoff";
import { useNavigation } from "@react-navigation/native";
import { RootNavigationProp } from "@/types/type";
import AnimatedModal from '@/components/AnimatedModal';
import { filter } from '@/constants/images';
import { FontAwesome } from '@expo/vector-icons';

export default function LibTabTwo() {
  return (
    <>
      <SafeAreaView style={[utilStyle.safeAreaContainer, {backgroundColor: colors.readioBrown, width: '100%', padding: utilStyle.padding.padding}]}>
      
      <SignedIn>
        <SignedInLib/>
      </SignedIn>

      <SignedOut>
        <SignedOutLib/>        
      </SignedOut>

    </SafeAreaView>
    </>
  )
}

function SignedInLib () {
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
  const [theUserStuff, setTheUserStuff] = useState<{ data: UserStuff[] }>({ data: [] })
  const {readioSelectedReadioId, setReadioSelectedReadioId} = useReadio()
  const [modalMessage, setModalMessage] = useState("")
  
  const handleGoToSelectedReadio = (readioId: number, name: string) => {
    setReadioSelectedReadioId?.(readioId)
    console.log('handleGoToSelectedReadio', readioId)
    console.log('handleGoToSelectedReadio', name)
    router.push(`/(tabs)/(library)/${readioId}` as Href)
  }
  
  useEffect(() => {
    const getReadios = async () => {
  
      const response = await fetchAPI(`/(api)/getReadios`, {
        method: "POST",
        body: JSON.stringify({
          clerkId: user?.id as string,
          topic: "",
          tag: "default",
        }),
      });
  
      setReadios(response)
      // retryWithBackoff(async () => {
  
      // }, 1, 1000)
  
    }
  
    const getTheUserStuff = async () => {
  
      const response = await fetchAPI(`/(api)/getUserStuff`, {
        method: "POST",
        body: JSON.stringify({
          clerkId: user?.id as string,
        }),
      });
  
      setTheUserStuff(response)
      // retryWithBackoff(async () => {
  
      // }, 1, 1000)
    }
  
    getReadios()
    getTheUserStuff()
  
  }, [readios.data])
  
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
    
    setModalMessage("Generating Readio....Please wait.")
  
    setModalVisible(true);
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
        username: user?.fullName,
        tag: "default",
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
    // const waitForDiJustFinishedPlaying = (sound: Audio.Sound) =>
    //   new Promise(resolve => {
    //     sound.setOnPlaybackStatusUpdate(
    //       (playbackStatus) => { // Keep the parameter type as is
    //         const status = playbackStatus as AVPlaybackStatusSuccess; // Type assertion
    //         if (status.didJustFinish) {
    //           resolve(null)
    //         }
    //       },
    //     )
    // })
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
  
    await addPathToDB(s3Url, readioId, userId);
  
    // console.log("Audio successfully uploaded to S3 and path saved to the database.");
    setModalMessage("Readio successfully created ✅");
  
    setModalVisible(false);
    return data;
  
   
  
  
  
  
  
  
    // Optionally play the audio after uploading
    // console.log("Playing sound....")
    // const { sound } = await Audio.Sound.createAsync(
    //   { uri: `file://${path}`},
    //   { shouldPlay: true, progressUpdateIntervalMillis: 10 },
    // );
  
  
    // await waitForDiJustFinishedPlaying(sound)
    // ReactNativeBlobUtil.fs.unlink(path)
  
  }
  
  const navigation = useNavigation<RootNavigationProp>(); // use typed navigation
  
  const handleGoHome = () => {
    navigation.navigate("home"); // <-- Using 'player' as screen name
  }
  
  const handleTopicSelect = (topic: string) => {
    setForm({...form, topic: topic})
    setSelectedOption(topic)
  }
  
  const handleClearSelectedOption = () => {
    setForm({...form, topic: ''})
    setSelectedOption('');
  }
  
  
  const [modeSelected, setModeSelected] = useState('simple');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  
  
  return (
        <>
   <ScrollView style={{ 
      width: '100%', 
      minHeight: '100%',
      }}
      showsVerticalScrollIndicator={false}  // Hides vertical scroll bar
      >
         {/* header
         <View style={{ width:'100%', position: 'absolute', backgroundColor: "transparent", height: '6%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>  
                      <TouchableOpacity onPress={handleGoHome} style={{display: 'flex', flexDirection: 'row'}}>
                          <Text style={{fontSize: 20, fontWeight: 'bold', color: colors.readioOrange, fontFamily: readioBoldFont}}>L</Text>
                      </TouchableOpacity>
          </View> */}

        <View style={styles.gap}></View>
        <Text style={styles.heading}>Library</Text>
        <View style={{ 
          paddingVertical: 5,
          backgroundColor: "transparent",
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
          style={{width: '100%', height: '100%' }}
        >
          <SafeAreaView style={{width: '100%', height: '100%', backgroundColor: colors.readioBrown, }}>

            <View style={{padding: 20, backgroundColor: colors.readioBrown,  width: '100%', height: '100%', display: 'flex', justifyContent: "space-between", paddingVertical: "10%"}}>
              
              <View style={{width: '100%', display: 'flex', alignItems: 'flex-end', backgroundColor: "transparent"}}>
                <Button color={colors.readioOrange} title="Close" onPress={toggleModal} />
              </View>

            <View style={{display: 'flex', alignItems: 'center', backgroundColor: "transparent", flexDirection: "column"}}>
              <Text style={styles.heading}>Create</Text>
              <View style={{display: 'flex', flexDirection: 'row', gap: 10, backgroundColor: "transparent"}}>
                <Text style={{color: modeSelected === 'simple' ? colors.readioOrange : colors.readioWhite, marginTop: 10}} onPress={() => setModeSelected('simple')}>Simple Mode</Text>
                <Text style={{marginTop: 10, color: colors.readioWhite}}>|</Text>
                <Text style={{color: modeSelected === 'advanced' ? colors.readioOrange : '#ccc', marginTop: 10}} onPress={() => setModeSelected('advanced')}>Advanced Mode</Text>
              </View>
            </View>

              <View style={{marginVertical: 10, backgroundColor: "transparent"}}>               
                {/* <InputField onChangeText={(text) => setForm({...form, title: text})} placeholder="Name your Readio here" style={{width: '100%', height: 50, padding: 15, color: colors.readioWhite}} label="Title"></InputField> */}
                
                {modeSelected === 'simple' && (
                  <>
                  {/* <ScrollView horizontal >
                    <TouchableOpacity activeOpacity={0.99} onPress={handleClearSelectedOption} style={{borderColor: "#ccc", borderWidth: 1, marginTop: 10, marginRight: 10, marginBottom: 10, paddingVertical: 5, paddingHorizontal: 10, borderRadius: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: "transparent"}}>
                      <FontAwesome color={'#ccc'} name="close"/>
                    </TouchableOpacity>
                    {theUserStuff?.data?.[0]?.topics?.map((topic: string) => (
                      <TouchableOpacity onPress={() => handleTopicSelect(topic)} activeOpacity={0.99} key={topic}  style={{borderColor: selectedOption === topic ? "transparent" : "#ccc", backgroundColor: selectedOption === topic ? colors.readioOrange : "transparent", borderWidth: 1, marginTop: 10, marginRight: 10, marginBottom: 10, paddingVertical: 5, paddingHorizontal: 10, borderRadius: 5}}>
                        <Text style={{color: selectedOption === topic ? colors.readioWhite : '#ccc'}}>{topic}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView> */}
                  <Text style={{color: colors.readioWhite, marginTop: 10, opacity: 0.6, textAlign: 'center'}}>What type of content do you want to listen to?</Text>
                  <InputField onChangeText={(text) => setForm({...form, topic: text})} value={form.topic} placeholder="Enter your Query here..." style={{width: '100%', height: 50, padding: 15, color: colors.readioWhite}} label=""></InputField> 
                  </>
                )}
                {modeSelected === 'advanced' && (
                  <>
                  <Text style={{color: colors.readioWhite, marginTop: 10, opacity: 0.6, textAlign: 'center'}}>Try your own content!</Text>
                  <InputField onChangeText={(text) => setForm({...form, topic: text})} placeholder="Enter your own content to be read back to you here..." style={{width: '100%', minHeight: 150, maxHeight: 250, padding: 15, color: colors.readioWhite}} label="" numberOfLines={10} multiline></InputField>
                  </>
                )}
                <TouchableOpacity style={{backgroundColor: colors.readioOrange, padding: 10, marginVertical: 10, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center'}} activeOpacity={0.9} onPress={handleGenerateReadio}>
                  <Text style={{color: colors.readioWhite, fontWeight: 'bold', fontSize: 20}} >Generate</Text>
                </TouchableOpacity>
                {/* <Text style={{color: '#fc3c44', marginTop: 10}} onPress={playReadio}>Generate</Text> */}
                {/* <Text>{text}</Text> */}
              </View>

            </View>

            <AnimatedModal
              visible={modalVisible}
              onClose={() => setModalVisible(false)}
              text={modalMessage}
            />

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
            <TouchableOpacity activeOpacity={0.9} onPress={() => handleGoToSelectedReadio(readio?.id as number, readio?.title as string)} key={readio.id} style={styles.recentlySavedItems}>
              <View style={styles.recentlySavedImg}>
                {/* <Image source={{uri: readio.image}} style={styles.nowPlayingImage} resizeMode='cover'/> */}
                <FastImage source={{uri: filter}} style={[styles.nowPlayingImage, {zIndex: 1, opacity: 0.4}]} resizeMode='cover'/>
                <FastImage source={{uri: readio.image}} style={styles.nowPlayingImage} resizeMode='cover'/>
                {/* <Image source={{uri: stations?.[0]?.imageurl}} style={styles.nowPlayingImage} resizeMode='cover'/> */}
              </View>
              <Text numberOfLines={1} style={styles.recentlySavedTItle}>{readio.title}</Text>
              <Text numberOfLines={1} style={styles.recentlySavedSubheading}>{readio.topic}</Text>
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

    </ScrollView>
        </>
    );

}

function SignedOutLib () {  
  
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
    );

}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    gap: {
      marginVertical: 20,
    },
    text: {
      fontSize: 60,
      fontWeight: 'bold',
      fontFamily: readioBoldFont,
      color: colors.readioWhite
    },
    heading: {
      fontSize: 60,
      fontWeight: 'bold',
      color: colors.readioWhite,
      fontFamily: readioBoldFont,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.readioWhite,
      fontFamily: readioBoldFont
    },
    option: {
      fontSize: 20,
      paddingVertical: 10,
      color: colors.readioWhite,
      fontFamily: readioRegularFont,
    },
    separator: {
      marginVertical: 30,
      height: 1,
      width: '80%',
    },
    readioRedTitle: {
      color: colors.readioOrange,
      fontSize: 20,
      fontWeight: 'bold',
      marginVertical: 5,
      fontFamily: readioBoldFont
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
      backgroundColor: "transparent"
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
      backgroundColor: colors.readioWhite,
      borderRadius: 5,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    recentlySavedTItle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.readioWhite,
      fontFamily: readioBoldFont
    },
    recentlySavedSubheading: {
      fontSize: 15,
      color: colors.readioWhite,
      fontFamily: readioRegularFont
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
  });