import { SafeAreaView } from 'react-native-safe-area-context'; 
import { buttonStyle, utilStyle } from "@/constants/tokens";
import { colors } from "@/constants/tokens";
import { StyleSheet, Text, View, ScrollView, KeyboardAvoidingView, TouchableOpacity, Modal, Button, Pressable, LayoutChangeEvent, Keyboard } from "react-native";
import { readioRegularFont, readioBoldFont } from "@/constants/tokens";
import { useTracks } from '@/store/library';
import { useMemo } from 'react';
import { trackTitleFilter } from '@/helpers/filter'
import { useNavigationSearch } from '@/hooks/useNavigationSearch'
import { Href, router } from 'expo-router';
import { SignedIn, SignedOut } from '@clerk/clerk-expo'
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
import  { s3, accessKeyId, secretAccessKey, helloS3 } from '@/helpers/s3Client';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';
import FastImage from 'react-native-fast-image';
import { retryWithBackoff } from "@/helpers/retryWithBackoff";
import { useNavigation } from "@react-navigation/native";
import { RootNavigationProp } from "@/types/type";
import AnimatedModal from '@/components/AnimatedModal';
import { filter, unknownTrackImageUri } from '@/constants/images';
import { FontAwesome } from '@expo/vector-icons';
import sql from "@/helpers/neonClient";
import { systemPromptReadio, systemPromptPexalQuery, systemPromptReadioTitle } from '@/constants/tokens';
import { geminiTitle, geminiPexals, geminiReadio, geminiCategory, geminiTest } from '@/helpers/geminiClient';
import { generateText } from "ai";
import { Message } from '@/constants/tokens';
import { createClient } from "pexels";
// import { S3 } from 'aws-sdk';
import AWS from 'aws-sdk';
import { chatgpt } from '@/helpers/openAiClient';
import Animated, { FadeInUp, FadeOut, FadeOutDown, FadeOutUp, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Asset } from 'expo-asset';
import { LinearGradient } from 'expo-linear-gradient';
import { pexelsClient } from '@/helpers/pexelsClient';
import React from 'react';


export default function LibTabTwo() {
  return (
    <>
      <SafeAreaView style={[utilStyle.safeAreaContainer, {backgroundColor: colors.readioBrown, width: '100%', padding: utilStyle.padding.padding}]}>
      
      {/* <SignedIn> */}
        <SignedInLib/>
      {/* </SignedIn> */}

      {/* <SignedOut>
        <SignedOutLib/>        
      </SignedOut> */}

    </SafeAreaView>
    </>
  )
}

function SignedInLib () {
  const { user } = useReadio()
  const [articleUpdate, setArticleUpdate] = useState(false);
  const navigation = useNavigation<RootNavigationProp>(); // use typed navigation
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
  
  const [theUserStuff, setTheUserStuff] = useState<any>()
  const {readioSelectedReadioId, setReadioSelectedReadioId} = useReadio()
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [progressModalVisible, setProgressModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("")
  const [articleGenerationStatus, setArticleGenerationStatus] = useState('')
  const {needsToRefresh, setNeedsToRefresh} = useReadio()

  const handleGoToSelectedReadio = (readioId: number, name: string) => {
    setReadioSelectedReadioId?.(readioId)
    console.log('handleGoToSelectedReadio', readioId)
    console.log('handleGoToSelectedReadio', name)
    router.push(`/(tabs)/(library)/${readioId}` as Href)
  }

  // get readios
  const [readios, setReadios] = useState<Readio[]>([]);
  useEffect(() => {
    
    let isMounted = true; // Flag to track whether the component is still mounted

    const fetchReadios = async () => {
  
    const data = await sql`
        SELECT * FROM readios WHERE clerk_id = ${user?.clerk_id}
    `;
  
      setReadios(data)
      // retryWithBackoff(async () => {
  
      // }, 1, 1000)
  
    }
  
    const fetchUserStuff = async () => {
  
      const response = await sql`
      SELECT * FROM users WHERE clerk_id = ${user?.clerk_id}           
      `;
  
      setTheUserStuff(response)
    }
  
    fetchReadios()
    fetchUserStuff()

    return () => {
      isMounted = false; // Set the flag to false when the component unmounts
    };
  
  }, [])

  useEffect(() => {
    
    let isMounted = true; // Flag to track whether the component is still mounted

    const fetchReadios = async () => {
  
    const data = await sql`
        SELECT * FROM readios WHERE clerk_id = ${user?.clerk_id}
    `;
  
      setReadios(data)
      // retryWithBackoff(async () => {
  
      // }, 1, 1000)
  
    }
  
    const fetchUserStuff = async () => {
  
      const response = await sql`
      SELECT * FROM users WHERE clerk_id = ${user?.clerk_id}           
      `;
  
      setTheUserStuff(response)
    }
  
    if (articleUpdate === true || needsToRefresh === true) {
      fetchReadios()
      fetchUserStuff()
    }

    return () => {
      isMounted = false; // Set the flag to false when the component unmounts
    };
  
  }, [articleUpdate, needsToRefresh])
  



  // SECTION --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    // NOTE This is the progress bar stuff:
    const [width, setWidth] = useState<number>(0);
    const pV = [0, 5, 15, 35, 50, 60, 80, 100]
    const [progress, setProgress] = useState<any>();
    const [generationStarted, setGenerationStarted] = useState(false);
    const [progressMessage, setProgressMessage] = useState("")
    const handleProgressContainerLayout = (event: LayoutChangeEvent) => {
      const { width } = event.nativeEvent.layout;
      setWidth(width);
      console.log('Element width:', width);
    };

    const offset = useSharedValue<number>(0); // Initialize with 0
    const animatedStyles = useAnimatedStyle(() => ({
        transform: [{ translateX: offset.value }],
    }));

    // Progress queue handler
    const ProgressQueue = {
    
      isProcessing: false, 
      queue: [] as number[],
      
      async process() {
        if (this.isProcessing || this.queue.length === 0) return;
        
        this.isProcessing = true;
        const progress = this.queue.shift()!;
        
        const progressValue = (progress / 100) * width;
        setProgress(progressValue);
        offset.value = withSpring(progressValue);
        
        await new Promise(resolve => setTimeout(resolve, 200));
        
        this.isProcessing = false;
        this.process(); // Process next item if any
      },
      
      add(progress: number) {
        this.queue.push(progress);
        if (!this.isProcessing) {
          this.process();
        }
      },

      resetQueue() {
        this.queue = [];
        this.isProcessing = false;
        setProgress(0);
        offset.value = withSpring(0);
      }

  };

// END  --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------




  // SECTION --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    // NOTE This is the create modal stuff
    
    
    
    const toggleModal = () => {
      setIsModalVisible(!isModalVisible);
    };
    
    const [form, setForm] = useState({
      query: ''
    })
    
    const elevenlabs = new ElevenLabsClient({
      apiKey: "bc2697930732a0ba97be1d90cf641035"
    });



  // SECTION ------------------------------------------------------------------------------------------------------------
    // NOTE 
    const [wantsToMakeAnArticle, setWantsToMakeAnArticle] = useState<any>(null)

    const testGemini = async () => {
      console.log("Gemini Test started...");
      try {
        // Step 1: Gemini Title Test
        console.log("Generating title...");
        const titleResponse = await geminiTest.generateContent(
          `Hello Gemini`
        );
        const generatedTest = titleResponse.response.text().trim() ? true : false;
        console.log("Generated Test Gemini:", generatedTest);
        return generatedTest;
      } catch (error) {
        console.error("Error during Gemini Test:", error);
        return false; // Continue even if there's an error
      }
    };

    const testPexels = async (title: any) => {
      try {
        // Step 2: Pexels Test
        console.log("Fetching image from Pexels...");
        const pexelsData = await pexelsClient.photos.search({
          query: `${title}`,
          per_page: 1,
        });
        const pexelsImage = pexelsData ? true : false;
        console.log("Fetched Image:", pexelsImage);

        return pexelsImage;
      } catch (error) {
        console.error("Error during Pexels Test:", error);
        return false; // Continue even if there's an error
      }
    };

    useEffect(() => {
      const runTests = async () => {
       
        if (wantsToMakeAnArticle === true) {
          
          setArticleGenerationStatus('generating...')
          setGenerationStarted(true);
          setProgressMessage("Were generating your article...")  
          ProgressQueue.add(pV[1]);

          console.log('running tests...')
          const geminiTestResult = await testGemini();
          const pexelsTestResult = await testPexels(geminiTestResult);

          if (geminiTestResult && pexelsTestResult) {
            console.log('success')
            await handleGenerateReadio();
          }  else {

            ProgressQueue.add(pV[7]);
            setProgressMessage("Service outage...Please try again 🔴");
            
            setTimeout(() => {
              ProgressQueue.resetQueue()
              setArticleGenerationStatus('done')
              setWantsToMakeAnArticle(false)
            }, 1000)
  
          }
        }

      };

      runTests();
    }, [wantsToMakeAnArticle]);

    
    // const handleGenerateReadio = async () => {

    //   // setModalMessage("Generating Article....Please wait 😊")
    //   ProgressQueue.add(pV[1]);
    //   setGenerationStarted(true);
    //   setProgressMessage("We're creating your article...")

    //   // NOTE generate a title with ai ------------------------------------------------

    //   const readioTitles = await sql`
    //   SELECT title FROM readios WHERE clerk_id = ${user?.clerk_id}
    //   `;

    //   console.log("Starting Gemini...");

    //   // Using a variable instead of useState for title
    //   let title = "";
    //   console.log("Starting Gemini...title");
    //   const promptTitle = `Please generate me a good title for a readio. Here is the query i asked originally: ${form.query}. Also, here are the titles of the readios I already have. ${readioTitles}. Please give me something new and not in this list.`;
    //   const resultTItle = await geminiTitle.generateContent(promptTitle);
    //   const geminiTitleResponse = await resultTItle.response;
    //   const textTitle = geminiTitleResponse.text();
    //   title = textTitle; // Assigning the response to the variable title
    //   console.log("set title response: ", title);

    //   // setModalMessage(`Title - ${title}...😊`)
    //   ProgressQueue.add(pV[2]);


    //   let category = "";
    //   const promptCategory = `Please give me a category for this title: ${title}.`;
    //   const resultCategory = await geminiCategory.generateContent(promptCategory);
    //   const geminiCategoryResponse = await resultCategory.response;
    //   const textCategory = geminiCategoryResponse.text();
    //   category = textCategory.replace(/\s+/g, ''); // Normalize to ensure it's only 1 word
    //   console.log("set category response: ", category);

    //   // setModalMessage(`Category - ${category}...😊`)
    //   ProgressQueue.add(pV[3]);


    //   // END END END -----------------------------------------------------------------

    //   // Using a variable instead of useState for readioText
    //   let readioText = "";
    //   const promptReadio = `Can you make me a readio about ${form.query}. The title is: ${title}.`;
    //   // const promptReadio =  ` Hi, right now im just testing a feature, no matter what the user says just respond with, "Message Recieved. Thanks for the message."`;
    //   // const resultReadio = await geminiReadio.generateContent(promptReadio);
    //   // const geminiReadioResponse = await resultReadio.response;
    //   // const textReadio = geminiReadioResponse.text();    
    //   // readioText = textReadio; // Assigning the response to the variable readioText
    //   // console.log("set readio response: ", readioText);

    //   const completion = await chatgpt.chat.completions.create({
    //     model: "gpt-4o",
    //     messages: [
    //       { role: "developer", content: systemPromptReadio },
    //       { role: "user", content: promptReadio },
    //     ],
    //   });

    //   console.log(completion.choices[0].message);
    //   readioText = completion.choices[0].message.content as string;
    //   console.log("set readio response: ", readioText);

    //   // setModalMessage(`Thinking of insights...😊`)
    //   ProgressQueue.add(pV[4]);

    //   // END END END -----------------------------------------------------------------

    //   // Using a variable instead of useState for pexalQuery
    //   let pexalQuery = "";
    //   const promptPexals = `Can you make me a pexals query? The title we came up with for the readio itself is: ${title}, and the query that was asked in the first prompt was: ${form.query}.`;
    //   const resultPexals = await geminiPexals.generateContent(promptPexals);
    //   const geminiPexalsResponse = await resultPexals.response;
    //   const textPexals = geminiPexalsResponse.text();
    //   pexalQuery = textPexals;
    //   console.log("set pexal response: ", pexalQuery);

    //   // END  END END -----------------------------------------------------------------

    //   // NOTE Pexals ----------------------------------------------------------
    //   console.log("Starting Pexals....");
    //   const searchQuery = `${pexalQuery}`;
    //   let illustration = "";
    //   let pexalsResponse;
    //   pexelsClient.photos.search({
    //     query: `${searchQuery}`,
    //     per_page: 1,
    //   })
    //   .then(response => {
    //       if (response && "photos" in response && response.photos?.length > 0) {
    //           illustration = response.photos[0].src.landscape;
    //           setProgressMessage("Found a cool image for you...");
    //       } else {
    //           setProgressMessage("Couldn't find a cool image for you...");
    //       }
    //   })
    //   .catch(error => {
    //       console.error("Error fetching from Pexals:", error);
    //       setProgressMessage("Couldn't find a cool image for you...");
    //       // illustration = "https://companystaticimages.s3.us-east-2.amazonaws.com/ltus+final-03.png";
    //   });

    //   // NOTE database --------------------------------------------------------
    //   console.log("Starting Supabase....");

    //   // default
    //   const addReadioToDB: any = await sql`
    //     INSERT INTO readios (
    //       image,
    //       text, 
    //       topic,
    //       title,
    //       clerk_id,
    //       username,
    //       artist,
    //       tag,
    //       upvotes
    //       )
    //       VALUES (
    //         ${illustration},
    //         ${readioText},
    //         ${category as string}, 
    //         ${title},
    //         ${user?.clerk_id},
    //         ${user?.fullName},
    //         'Lotus',
    //         'default',
    //         0
    //         )
    //         RETURNING id, image, text, topic, title, clerk_id, username, artist;
    //   `;

    //   console.log("addReadioToDB: ", addReadioToDB);

    //   console.log("Ending Supabase....");

    //   // setModalMessage(`Getting our tea ready...😊`)
    //   ProgressQueue.add(pV[5]);


    //   // NOTE elevenlabs --------------------------------------------------------
    //   console.log("Starting ElevenLabs....");

    //   async function fetchAudioFromElevenLabsAndReturnFilePath(
    //     text: string,
    //     apiKey: string,
    //     voiceId: string,
    //   ): Promise<string> {
    //     const baseUrl = 'https://api.elevenlabs.io/v1/text-to-speech'
    //     const headers = {
    //       'Content-Type': 'application/json',
    //       'xi-api-key': apiKey,
    //     }

    //     const requestBody = {
    //       text,
    //       voice_settings: { similarity_boost: 0.5, stability: 0.5 },
    //     }

    //     const response = await ReactNativeBlobUtil.config({
    //       // add this option that makes response data to be stored as a file,
    //       // this is much more performant.
    //       fileCache: true,
    //       appendExt: 'mp3',
    //     }).fetch(
    //       'POST',
    //       `${baseUrl}/${voiceId}`,
    //       headers,
    //       JSON.stringify(requestBody),
    //     )
    //     const { status } = response.respInfo

    //     if (status !== 200) {
    //       throw new Error(`HTTP error! status: ${status}`)
    //     }

    //     return response.path()
    //   }

    //   const path = await fetchAudioFromElevenLabsAndReturnFilePath(
    //     readioText,
    //     'bc2697930732a0ba97be1d90cf641035',
    //     "ri3Bh626mOazCBOSTIae",
    //   )
    //   console.log("path: ", path);

    //   console.log("Ending ElevenLabs....");
    //   const base64Audio = await ReactNativeBlobUtil.fs.readFile(path, 'base64');
    //   const audioBuffer = Buffer.from(base64Audio, 'base64');
    //   console.log("audioBuffer: ", audioBuffer.length);
    //   // setModalMessage(`Almost done...😊`)
    //   ProgressQueue.add(pV[6]);
    //   setProgressMessage("Almost done...")


    //   // Upload the audio file to S3
    //   const s3Key = `${addReadioToDB?.[0]?.id}.mp3`;  // Define the file path within the S3 bucket
    //   console.log("s3Key line done");

    //   const aki = accessKeyId
    //   const ski = secretAccessKey

    //   console.log("aki: ", aki);
    //   console.log("ski: ", ski);

    //   try {
    //     await s3.upload({
    //       Bucket: "readio-audio-files",  // Your S3 bucket name
    //       Key: s3Key,
    //       Body: audioBuffer, // Read file as Base64
    //       ContentEncoding: 'base64', // Specify base64 encoding
    //       ContentType: 'audio/mpeg', // Specify content type
    //     }).promise();
    //     console.log("s3Key uploaded: ");
    //   } catch (error) {
    //     console.error("Failed to upload audio to S3:", error);
    //     ProgressQueue.resetQueue()
    //     setProgressMessage("There was an error, please try again. ")
    //     // setModalMessage("Article cration unsuccessful. Please try again. 🔴");
    //     return;
    //   }

    //   const s3Url = `https://readio-audio-files.s3.us-east-2.amazonaws.com/${s3Key}`;
    //   console.log("S3 URL: ", s3Url);

    //   // NOTE database -------------------------------------------------------- 
    //   const response = await sql`
    //   UPDATE readios
    //   SET url = ${s3Url}
    //   WHERE id = ${addReadioToDB?.[0]?.id} AND clerk_id = ${user?.clerk_id}
    //   RETURNING *;
    //   `;

    //   console.log("Audio successfully uploaded to S3 and path saved to the database.");
    //   // setModalMessage("Article successfully created! ✅");

    //   ProgressQueue.resetQueue()
    //   setProgressMessage("Check your library to hear your article ✅.")
      
    //   setTimeout(() => {
    //     setArticleGenerationStatus('done')
    //   }, 1500)

    // }

    const handleGenerateReadio = async () => {

      ProgressQueue.resetQueue()
      ProgressQueue.resetQueue()
      Keyboard.dismiss();

      ProgressQueue.add(pV[0]);

      setGenerationStarted(true)

      setProgressMessage("Check your library to hear your article ✅.")
    for (let p of pV) {
      ProgressQueue.add(p)
     }

     setArticleGenerationStatus('done')

    }

    const handleArticleCloseModal = () => {
      try {
        setArticleGenerationStatus('');
        setForm({ query: '' });
        setIsModalVisible(false);
        setGenerationStarted(false)
        setWantsToMakeAnArticle(false)
        ProgressQueue.resetQueue();
        ProgressQueue.resetQueue();
        console.log('ran function -------------------------------- ');
        setNeedsToRefresh?.(true);
      } catch (error) {
        console.error('Error in handleArticleCloseModal:', error);
      } finally {
        setTimeout(() => {
          setNeedsToRefresh?.(false);
        }, 200);
      }
    }

    const handleReset = () => {
      try {

        setArticleGenerationStatus('')
        ProgressQueue.resetQueue()
        setProgressMessage('')
        setForm({...form, query: ''})
        setForm({...form, query: ''})
        setWantsToMakeAnArticle(false)
        setGenerationStarted(false)
        setNeedsToRefresh?.(true);
        setTimeout(() => {
          setNeedsToRefresh?.(false);
        }, 200);

      } catch (error) {

        console.error('Error in handleArticleCloseModal:', error);
      
      } finally {
        
        setTimeout(() => {
          setNeedsToRefresh?.(false);
        }, 200);
      
      }
    }

// END  --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  const awsTest = async () => {
    
    // const aki = accessKeyId
    // const ski = secretAccessKey

    // console.log("aki: ", aki);
    // console.log("ski: ", ski);

    // try {

    //   const response = await s3.listBuckets().promise();

    //   console.log("Buckets: ", response);
    // } catch (error) {
    //   console.error("Error listing buckets:", error);
    // }
  }
  
  
  const handleGoHome = () => {
    navigation.navigate("home"); // <-- Using 'player' as screen name
  }

  const handleCloseModal = () => {
    setModalMessage("");
    setArticleGenerationStatus('')
    setForm({ query: '' });
    setProgressModalVisible(false);
    setIsModalVisible(false);
  }

  
  const [modeSelected, setModeSelected] = useState('simple');
  // const [modalVisible, setModalVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  
  const [imagesLoaded, setImagesLoaded] = useState(0)
  const [screenIsReady, setScreenIsReady] = useState(false)

  useEffect(() => {
    if (imagesLoaded > -1 && readios?.length > 0) {
        setTimeout(()=> {
            setScreenIsReady(true)
        }, 1000)
    }

  }, [imagesLoaded, screenIsReady, setScreenIsReady])

  const modalStyles = StyleSheet.create({
  subtext: {
    fontSize: 15,
    opacity: 0.5,
    textAlign: 'center',
    fontFamily: readioRegularFont,
    color: colors.readioWhite
  },
  heading: {
    fontSize: 40,
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
  });

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

        {/* <View style={styles.gap}></View> */}
        <Animated.Text  entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(100)} allowFontScaling={false} style={styles.bettertittle}>Library</Animated.Text>
        <View style={{ 
          paddingVertical: 5,
          backgroundColor: "transparent",
        }}>
        <Animated.Text  entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(100)} allowFontScaling={false} style={styles.option} onPress={() => router.push('/(tabs)/(library)/(playlist)')}>Playlist</Animated.Text>
        <Animated.Text  entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(100)} allowFontScaling={false} style={styles.option} onPress={() => router.push('/(tabs)/(library)/(playlist)/interests')}>Interests</Animated.Text>
        <Animated.Text  entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(100)} allowFontScaling={false} style={styles.option} onPress={() => router.push('/all-readios')}>All Articles</Animated.Text>
        </View>
        <View style={{marginVertical: 15}}/>
        <Animated.Text  entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(100)}  allowFontScaling={false} style={styles.title}>Recently Saved Articles</Animated.Text>


        <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        // onRequestClose={toggleModal}
        style={{ width: '100%', height: '100%' }}
      >
        <LinearGradient
          colors={[colors.readioBrown, 'transparent']}
          style={{
            zIndex: 1,
            bottom: '60%',
            position: 'absolute',
            width: '150%',
            height: 450,
            transform: [{ rotate: '-180deg' }],
          }}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
        <View style={{ width: "100%", minHeight: "600%", zIndex: -3, position: "absolute", backgroundColor: colors.readioBrown }} />
        <SafeAreaView style={{ width: '100%', zIndex: 2, height: '100%', backgroundColor: 'transparent', }}>

          <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={60} style={{ padding: 20, backgroundColor: 'transparent', width: '100%', height: '100%', display: 'flex', justifyContent: "space-between", paddingVertical: "10%" }}>

            <View style={{ width: '100%', display: 'flex', alignItems: 'flex-end', backgroundColor: "transparent" }}>
              <TouchableOpacity style={{ padding: 5 }} onPress={handleArticleCloseModal}>
                <FontAwesome name="close" size={30} color={colors.readioWhite} />
              </TouchableOpacity>
            </View>

            {generationStarted === true && (
              <>
              <View onLayout={handleProgressContainerLayout} style={{width: '90%', marginTop: 10, overflow: "hidden", height: 10, backgroundColor: colors.readioOrange, alignSelf: "center", borderRadius: 10}}>                                   
                  <Animated.View style={[animatedStyles, {width: `100%`, zIndex: 20, alignSelf: "flex-start", height: 10, backgroundColor: colors.readioBlack, borderRadius: 0}]}/>                             
              </View>
              <Text style={{color: colors.readioWhite, position: 'absolute', right: 40, top: '25%', zIndex: 200, fontFamily: readioRegularFont, alignSelf: 'flex-end'}}>{progressMessage}</Text>
              </>
            )}

            <View style={{ display: 'flex', zIndex: 2, width: '100%', alignSelf: 'center', alignItems: 'center', backgroundColor: "transparent", flexDirection: "column" }}>
              <Animated.View entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(300)} style={{ marginTop: 10, zIndex: 2, width: 110, justifyContent: 'center', alignSelf: 'center', height: 110, backgroundColor: 'transparent', borderRadius: 500 }}>
                <FastImage source={Asset.fromModule(require('@/assets/images/cropwhitelogo.png'))} style={{ width: 200, height: 200, zIndex: 2, alignSelf: "center", marginTop: 10, backgroundColor: "transparent" }} resizeMode="cover" />
              </Animated.View>
              <View style={{ width: '90%', zIndex: 2 }}>
                <Text allowFontScaling={false} style={styles.heading}>Create</Text>
                <Text allowFontScaling={false} style={styles.subtext}>From simple ideas to detailed instructions, craft the perfect article in moments.</Text>
              </View>
              <View style={{ marginVertical: 10 }}>
                {/* <Text allowFontScaling={false} style={{ color: colors.readioWhite, opacity: 0.6, textAlign: 'center' }}>Using your wildest imagination,</Text> */}
                <Text allowFontScaling={false} style={{ color: colors.readioWhite, opacity: 0.6, textAlign: 'center' }}>What do you want to hear?</Text>
              </View>
              <View style={{ justifyContent: 'center', backgroundColor: colors.readioBlack, borderRadius: 10, width: '100%', alignItems: 'flex-start' }}>
                <InputField 
                onChangeText={(text) => setForm({ ...form, query: text })} value={form.query} 
                placeholder={articleGenerationStatus === 'done' ? 'Article created! Check your library!' : "Type your query here..." }
                style={{ width: '90%', height: 45, padding: 15, color: colors.readioWhite, fontSize: 15, fontFamily: readioRegularFont }} label="">
                </InputField>

                <Pressable
                  disabled={form?.query?.length === 0} 
                  onPress={() => (articleGenerationStatus === 'done' ? handleReset() : setWantsToMakeAnArticle(true))} 
                  style={{ 
                  position: 'absolute', 
                  backgroundColor: form?.query?.length > 0 ? colors.readioOrange : colors.readioBlack, 
                  opacity: form?.query?.length > 0 ? 1 : 0.2, 
                  width: 40, height: 40, right: 10, padding: 10, marginVertical: 10, borderRadius: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
                  >
                  <FontAwesome name={articleGenerationStatus === 'done'  ? 'refresh' : 'chevron-right'} allowFontScaling={false} style={{ color: colors.readioWhite, fontWeight: 'bold', fontSize: 20 }} ></FontAwesome>
                </Pressable>

              </View>
            </View>

            <View style={{ height: 150 }} />

          </KeyboardAvoidingView>

        </SafeAreaView>
      </Modal>


        <View style={styles.recentlySavedContainer}>
        
        {readios?.length === 0 && (
          <>
           <TouchableOpacity activeOpacity={0.9} onPress={toggleModal} style={styles.recentlySavedItems}>
              <Animated.View entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(100)} >                
              
              <View style={styles.recentlySavedImg}>
              <Text  allowFontScaling={false} style={[styles.readioRedTitle, {fontSize: 40}]}>+</Text>
              {/* <Image source={{uri: stations?.[0]?.imageurl}} style={styles.nowPlayingImage} resizeMode='cover'/> */}
              </View>
              <Text  allowFontScaling={false} style={styles.readioRedTitle}>Create an Article</Text>
              </Animated.View>
            </TouchableOpacity>
          </>
        )}
        
        {readios?.length > 0 && (
          <>
          {readios?.map((readio: Readio, index) => (
            <TouchableOpacity activeOpacity={0.9} onPress={() => handleGoToSelectedReadio(readio?.id as number, readio?.title as string)} key={readio.id} style={styles.recentlySavedItems}>
              <Animated.View  entering={FadeInUp.duration(300 + (index * 100))} exiting={FadeOutDown.duration(100)} >                
              <View style={styles.recentlySavedImg}>
                {/* <Image source={{uri: readio.image}} style={styles.nowPlayingImage} resizeMode='cover'/> */}
                <FastImage source={{uri: filter}} style={[styles.nowPlayingImage, {zIndex: 1, opacity: 0.4}]} resizeMode='cover'/>
                <FastImage onLoadEnd={() => setImagesLoaded(imagesLoaded + 1)} source={{uri: readio.image ? readio.image : unknownTrackImageUri}} style={styles.nowPlayingImage} resizeMode='cover'/>
                {/* <Image source={{uri: stations?.[0]?.imageurl}} style={styles.nowPlayingImage} resizeMode='cover'/> */}
              </View>
              <Text  allowFontScaling={false} numberOfLines={2} style={styles.recentlySavedTItle}>{readio.title}</Text>
              <Text  allowFontScaling={false} numberOfLines={1} style={styles.recentlySavedSubheading}>{readio.topic}</Text>
              </Animated.View>
            </TouchableOpacity>
          ))}
             <TouchableOpacity activeOpacity={0.9} onPress={toggleModal} style={styles.recentlySavedItems}>
             <Animated.View  entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(100)} >                

              <View style={styles.recentlySavedImg}>
              <Text  allowFontScaling={false} style={[styles.readioRedTitle, {fontSize: 40}]}>+</Text>
                {/* <Image source={{uri: stations?.[0]?.imageurl}} style={styles.nowPlayingImage} resizeMode='cover'/> */}
              </View>
              <Text  allowFontScaling={false} style={styles.readioRedTitle}>Create an Article</Text>
              </Animated.View>
            </TouchableOpacity>
          </>

        )}

        <View style={[styles.gap, {paddingBottom: 60}]}></View>

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
      showsVerticalScrollIndicator={false}
      >

    <View style={{ width:'100%', height: '6%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>  
        <TouchableOpacity onPress={() => router.push('/(auth)/welcome')} style={{display: 'flex', flexDirection: 'row'}}>
            <Text  allowFontScaling={false} style={{fontSize: 20, fontWeight: 'bold', color: colors.readioOrange}}>L</Text>
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
      fontSize: 40,
      fontWeight: 'bold',
      textAlign: 'center',
      color: colors.readioWhite,
      zIndex: 1,
      fontFamily: readioBoldFont
      },
    subtext: {
      fontSize: 15,
      opacity: 0.5,
      textAlign: 'center',
      fontFamily: readioRegularFont,
      color: colors.readioWhite
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.readioWhite,
      fontFamily: readioBoldFont
    },
    bettertittle: {
      fontSize: 45,
      fontWeight: 'bold',
      fontFamily: readioBoldFont,
      color: colors.readioWhite,
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
      borderRadius: 10,
    },
    recentlySavedImg: {
      width: '100%',
      height: 150,
      backgroundColor: colors.readioWhite,
      borderRadius: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    recentlySavedTItle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.readioWhite,
      fontFamily: readioBoldFont
    },
    recentlySavedSubheading: {
      fontSize: 15,
      color: colors.readioDustyWhite,
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