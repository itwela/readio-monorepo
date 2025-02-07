import { colors, systemPromptReadio } from "@/constants/tokens";
import { StyleSheet, KeyboardAvoidingView, Modal, Button, TouchableOpacity, ScrollView, Animated as ReactNativeAnimated, RefreshControl, Pressable, ActivityIndicator, LayoutChangeEvent, Keyboard } from "react-native";
import { readioRegularFont, readioBoldFont } from "@/constants/tokens";
import { Text, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from 'react-native-safe-area-context';
import { buttonStyle, utilStyle } from "@/constants/tokens";
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
import { bookshelfImg, filter } from '@/constants/images';
import sql from "@/helpers/neonClient";
import { geminiCategory, geminiPexals, geminiReadio, geminiTest, geminiTitle } from "@/helpers/geminiClient";
import { createClient } from "pexels";
import TrackPlayer from "react-native-track-player";
import { chatgpt } from '@/helpers/openAiClient';
import AnimatedModal from '@/components/AnimatedModal';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import { whitelogo } from "@/constants/images";
import { set } from "ts-pattern/dist/patterns";
import InputField from '@/components/inputField';
import { accessKeyId, secretAccessKey } from '@/helpers/s3Client';
import { FadeOut, FadeOutDown, FadeOutUp, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useCallback } from 'react';
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import { tokenCache } from "@/lib/auth";
import { FadeInDown, FadeInUp } from "react-native-reanimated";
import Animated from "react-native-reanimated";
import createAnimatedComponent from "react-native-reanimated";
import { useLotusAuth } from "@/constants/LotusAuthContext";
import { Asset } from 'expo-asset';
import { Buffer } from 'buffer';
import { pexelsClient } from "@/helpers/pexelsClient";
import React from "react";

export default function HomeTabOne() {

  return (
    <>
      <SignedInHomeTabOne />
    </>
  );
}

function SignedInHomeTabOne() {

  const { user, isSignedIn, needsToRefresh, setNeedsToRefresh, setLinerNoteTopic } = useReadio()
  const [stations, setStations] = useState<Station[]>([]);

  useEffect(() => {
    let isMounted = true; // Flag to track whether the component is still mounted

    setNeedsToRefresh?.(true)

    setTimeout(() => {
      setNeedsToRefresh?.(false)
    }, 500)

    return () => {
      isMounted = false; // Set the flag to false when the component unmounts
    };

  }, [isSignedIn]);

  useEffect(() => {
    let isMounted = true; // Flag to track whether the component is still mounted

    const fetchStations = async () => {
      try {
        const data = await sql`
          SELECT stations.*
          FROM stations
          INNER JOIN station_clerks ON stations.id = station_clerks.station_id
          WHERE station_clerks.clerk_id = ${user?.clerk_id};
      `;
        // console.log("stations: ", data)
        setStations(data);
      } catch (error) {
        console.error('Error fetching stations:', error);
      }
    };

    if (!user) {
      fetchStations();
    }

    return () => {
      isMounted = false; // Set the flag to false when the component unmounts
    };
  }, []);

  useEffect(() => {
    let isMounted = true; // Flag to track whether the component is still mounted

    const fetchStations = async () => {
      try {
        const data = await sql`
          SELECT stations.*
          FROM stations
          INNER JOIN station_clerks ON stations.id = station_clerks.station_id
          WHERE station_clerks.clerk_id = ${user?.clerk_id};
      `;
        // console.log("stations: ", data)
        setStations(data);
      } catch (error) {
        console.error('Error fetching stations:', error);
      }
    };

    fetchStations();

    return () => {
      isMounted = false; // Set the flag to false when the component unmounts
    }; 
  }, [user?.clerk_id]);

  useEffect(() => {
    const getFeatureArticleName = async () => {
      const articleId = 0
      const data = await sql`SELECT * FROM readios WHERE id = ${articleId} ORDER BY id DESC LIMIT 1`;
      setFeatureArticleName(data[0]?.title)
      setFeatureArticleImage(data[0]?.image)
    }

    getFeatureArticleName()
  }, [])

  const [readios, setReadios] = useState<Readio[]>([]);

  const search = useNavigationSearch({ searchBarOptions: { placeholder: 'Find in songs' }, })
  const tracks = readios

  const filteredTracks = useMemo(() => {
    if (!search) return tracks
    return tracks.filter(trackTitleFilter(search))
  }, [search, tracks])

  const navigation = useNavigation<RootNavigationProp>(); // use typed navigation  

  const [articleGenerationStatus, setArticleGenerationStatus] = useState('')
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [featureArticleName, setFeatureArticleName] = useState('')
  const [featureArticleImage, setFeatureArticleImage] = useState('')


  const handleGoToLinerNotes = async (id: any) => {
    TrackPlayer.reset()
    setLinerNoteTopic?.("Lotus Liner Notes")
    router.push('/(tabs)/(home)/linerNotes')
  }

  const [refreshing, setRefreshing] = useState(false); // For refresh control
  // const checkSignInStatus = async () => {
  //   const savedHash = await tokenCache.getToken('lotusJWTAlwaysGrowingToken');
  //   // const dbHash  = await getPasswordHashFromNeonDB(savedHash as string);
  //   const gettingUser = getUserInfo(savedHash as string);
  //   // }
  // };
  // const getUserInfo = async (hash: string) => {
  //   const userInfo = await sql`SELECT * FROM users WHERE jwt = ${hash}`
  //   setUser?.(userInfo[0]);
  //   console.log("userInfo: ", userInfo[0]);
  // };
  const onRefresh = () => {
    setRefreshing(true);
    setNeedsToRefresh?.(true)
    // checkSignInStatus()

    // Add any refresh logic here, such as resetting state or re-fetching data
    setTimeout(() => {
      setRefreshing(false);
      setNeedsToRefresh?.(false)
    }, 1000); // Simulate an async operation
  };

  const [imagesLoaded, setImagesLoaded] = useState(0)
  const [screenIsReady, setScreenIsReady] = useState(false)

  useEffect(() => {
    if (needsToRefresh) {
      setTimeout(() => {
        setScreenIsReady(true)
      }, 1000)
    }
  }, [needsToRefresh])


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
    const [form, setForm] = useState({
      query: ''
    })

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

    // { yo
    const handleGenerateReadio = async () => {

      ProgressQueue.resetQueue()
      ProgressQueue.resetQueue()
      Keyboard.dismiss();

      ProgressQueue.add(pV[0]);

      // setModalMessage("Generating Article....Please wait 😊")
      ProgressQueue.add(pV[1]);
      setGenerationStarted(true);
      setProgressMessage("We're creating your article...")

      // NOTE generate a title with ai ------------------------------------------------

      const readioTitles = await sql`
      SELECT title FROM readios WHERE clerk_id = ${user?.clerk_id}
      `;

      console.log("Starting Gemini...");

      // Using a variable instead of useState for title
      let title = "";
      console.log("Starting Gemini...title");
      const promptTitle = `Please generate me a good title for a readio. Here is the query i asked originally: ${form.query}. Also, here are the titles of the readios I already have. ${readioTitles}. Please give me something new and not in this list.`;
      const resultTItle = await geminiTitle.generateContent(promptTitle);
      const geminiTitleResponse = await resultTItle.response;
      const textTitle = geminiTitleResponse.text();
      title = textTitle; // Assigning the response to the variable title
      console.log("set title response: ", title);

      // setModalMessage(`Title - ${title}...😊`)
      ProgressQueue.add(pV[2]);


      let category = "";
      const promptCategory = `Please give me a category for this title: ${title}.`;
      const resultCategory = await geminiCategory.generateContent(promptCategory);
      const geminiCategoryResponse = await resultCategory.response;
      const textCategory = geminiCategoryResponse.text();
      category = textCategory.replace(/\s+/g, ''); // Normalize to ensure it's only 1 word
      console.log("set category response: ", category);

      // setModalMessage(`Category - ${category}...😊`)
      ProgressQueue.add(pV[3]);


      // END END END -----------------------------------------------------------------

      // Using a variable instead of useState for readioText
      let readioText = "";
      const promptReadio = `Can you make me a readio about ${form.query}. The title is: ${title}.`;
      // const promptReadio =  ` Hi, right now im just testing a feature, no matter what the user says just respond with, "Message Recieved. Thanks for the message."`;
      // const resultReadio = await geminiReadio.generateContent(promptReadio);
      // const geminiReadioResponse = await resultReadio.response;
      // const textReadio = geminiReadioResponse.text();    
      // readioText = textReadio; // Assigning the response to the variable readioText
      // console.log("set readio response: ", readioText);

      const completion = await chatgpt.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "developer", content: systemPromptReadio },
          { role: "user", content: promptReadio },
        ],
      });

      console.log(completion.choices[0].message);
      readioText = completion.choices[0].message.content as string;
      console.log("set readio response: ", readioText);

      // setModalMessage(`Thinking of insights...😊`)
      ProgressQueue.add(pV[4]);

      // END END END -----------------------------------------------------------------

      // Using a variable instead of useState for pexalQuery
      let pexalQuery = "";
      const promptPexals = `Can you make me a pexals query? The title we came up with for the readio itself is: ${title}, and the query that was asked in the first prompt was: ${form.query}.`;
      const resultPexals = await geminiPexals.generateContent(promptPexals);
      const geminiPexalsResponse = await resultPexals.response;
      const textPexals = geminiPexalsResponse.text();
      pexalQuery = textPexals;
      console.log("set pexal response: ", pexalQuery);

      // END  END END -----------------------------------------------------------------

      // NOTE Pexals ----------------------------------------------------------
      console.log("Starting Pexals....");
      const searchQuery = `${pexalQuery}`;
      let illustration = "";
      let pexalsResponse;
      pexelsClient.photos.search({
        query: `${searchQuery}`,
        per_page: 1,
      })
      .then(response => {
          if (response && "photos" in response && response.photos?.length > 0) {
              illustration = response.photos[0].src.landscape;
              setProgressMessage("Found a cool image for you...");
          } else {
              setProgressMessage("Couldn't find a cool image for you...");
          }
      })
      .catch(error => {
          console.error("Error fetching from Pexals:", error);
          setProgressMessage("Couldn't find a cool image for you...");
          // illustration = "https://companystaticimages.s3.us-east-2.amazonaws.com/ltus+final-03.png";
      });

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
          tag,
          upvotes
          )
          VALUES (
            ${illustration},
            ${readioText},
            ${category as string}, 
            ${title},
            ${user?.clerk_id},
            ${user?.fullName},
            'Lotus',
            'default',
            0
            )
            RETURNING id, image, text, topic, title, clerk_id, username, artist;
      `;

      console.log("addReadioToDB: ", addReadioToDB);

      console.log("Ending Supabase....");

      // setModalMessage(`Getting our tea ready...😊`)
      ProgressQueue.add(pV[5]);


      // NOTE elevenlabs --------------------------------------------------------
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
      console.log("path: ", path);

      console.log("Ending ElevenLabs....");
      const base64Audio = await ReactNativeBlobUtil.fs.readFile(path, 'base64');
      const audioBuffer = Buffer.from(base64Audio, 'base64');
      console.log("audioBuffer: ", audioBuffer.length);
      // setModalMessage(`Almost done...😊`)
      ProgressQueue.add(pV[6]);
      setProgressMessage("Almost done...")


      // Upload the audio file to S3
      const s3Key = `${addReadioToDB?.[0]?.id}.mp3`;  // Define the file path within the S3 bucket
      console.log("s3Key line done");

      const aki = accessKeyId
      const ski = secretAccessKey

      console.log("aki: ", aki);
      console.log("ski: ", ski);

      try {
        await s3.upload({
          Bucket: "readio-audio-files",  // Your S3 bucket name
          Key: s3Key,
          Body: audioBuffer, // Read file as Base64
          ContentEncoding: 'base64', // Specify base64 encoding
          ContentType: 'audio/mpeg', // Specify content type
        }).promise();
        console.log("s3Key uploaded: ");
      } catch (error) {
        console.error("Failed to upload audio to S3:", error);
        ProgressQueue.resetQueue()
        setProgressMessage("There was an error, please try again. ")
        // setModalMessage("Article cration unsuccessful. Please try again. 🔴");
        return;
      }

      const s3Url = `https://readio-audio-files.s3.us-east-2.amazonaws.com/${s3Key}`;
      console.log("S3 URL: ", s3Url);

      // NOTE database -------------------------------------------------------- 
      const response = await sql`
      UPDATE readios
      SET url = ${s3Url}
      WHERE id = ${addReadioToDB?.[0]?.id} AND clerk_id = ${user?.clerk_id}
      RETURNING *;
      `;

      console.log("Audio successfully uploaded to S3 and path saved to the database.");
      // setModalMessage("Article successfully created! ✅");

      ProgressQueue.resetQueue()
      setProgressMessage("Check your library to hear your article ✅.")
      
      setTimeout(() => {
        setArticleGenerationStatus('done')
      }, 1500)

    }

    // const handleGenerateReadio = async () => {

    //   setGenerationStarted(true)
      
    //   setProgressMessage("Check your library to hear your article ✅.")
    // for (let p of pV) {
    //   ProgressQueue.add(p)
    //  }

    //  setArticleGenerationStatus('done')

    // }

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

//  END  --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  



return (
    <>

      {screenIsReady === false && (
        <>
          <Animated.View exiting={FadeOut.duration(1500)} style={{ position: 'absolute', bottom: 0, zIndex: 1, width: '100%', height: '100%', justifyContent: 'center', gap: 10, backgroundColor: colors.readioBrown }}>

            <SafeAreaView style={{ position: 'absolute', top: 0, left: "6.18%"}}>

            <View style={{ display: "flex", flexDirection: "column", }}>

              <TouchableOpacity style={[styles.heading, {backgroundColor: 'transparent', }]} activeOpacity={0.99}>
                {/* <Text style={{color: colors.readioWhite, textAlign: 'center'}}>Demo</Text> */}
                <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center',  justifyContent: 'flex-start'}}>
                  {/* <FastImage source={Asset.fromModule(require('@/assets/images/cropwhitelogo.png'))} style={{ width: 50, height: 50, position: "absolute",  zIndex: 2,   left: -10, top: '-50%', }} resizeMode="cover" /> */}
                  <Animated.Text entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(100)} allowFontScaling={false} style={{ fontSize: 20, color: colors.readioWhite, textAlign: "center", fontWeight: "bold" }}>Lotus</Animated.Text>
                </View>
              </TouchableOpacity>

              <Animated.Text entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(100)} allowFontScaling={false} style={{ color: colors.readioWhite, opacity: 0.61, textAlign: "center", fontWeight: "bold" }}>Smart Audio for Students of Life.</Animated.Text>

            </View>
            </SafeAreaView>

            <Animated.Text exiting={FadeOutUp.duration(100)} style={{ alignSelf: 'center', color: colors.readioWhite, fontFamily: readioRegularFont, fontSize: 13 }}>Were loading your experience...</Animated.Text>
            <ActivityIndicator size="large" color={colors.readioWhite} />
          </Animated.View>
        </>
      )}

      <SafeAreaView style={[utilStyle.safeAreaContainer, { width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }]}>

        <FastImage onLoadEnd={() => setImagesLoaded(imagesLoaded + 1)} source={Asset.fromModule(require('@/assets/images/bookshelfImg.png'))} style={[{ zIndex: -2, opacity: 1, position: 'absolute', width: '100%', height: '40%' }]} resizeMode='cover' />
        <LinearGradient
          colors={[colors.readioBrown, 'transparent']}
          style={{
            zIndex: -1,
            bottom: '70%',
            position: 'absolute',
            width: '150%',
            height: 450,
            transform: [{ rotate: '-180deg' }]
          }}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
        <View style={{ width: "100%", minHeight: "600%", zIndex: -3, position: "absolute", backgroundColor: colors.readioBrown }} />


        {/* NOTE HEADER */}
        <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, width: "100%", alignItems: "center", alignContent: "center", marginBottom: 20 }}>
          {/*                   
                  <TouchableOpacity onPress={() => navigation.navigate("home")} style={{backgroundColor: 'transparent', borderRadius: 100, padding: 6, width: 80, display: "flex", justifyContent: "center", alignItems: "center"}} activeOpacity={0.9}>
                    <FastImage source={{uri: whitelogo}} style={{width: 60, height: 60, alignSelf: "flex-start", backgroundColor: "transparent"}} resizeMode="cover" />
                  </TouchableOpacity> */}

          <View style={{ display: "flex", flexDirection: "column", }}>

            <TouchableOpacity style={[styles.heading, {backgroundColor: 'transparent', }]} activeOpacity={0.99}>
              {/* <Text style={{color: colors.readioWhite, textAlign: 'center'}}>Demo</Text> */}
              <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center',  justifyContent: 'flex-start'}}>
                <FastImage source={Asset.fromModule(require('@/assets/images/cropwhitelogo.png'))} style={{ width: 50, height: 50, position: "absolute",  zIndex: 2,   left: -10, top: '-50%', }} resizeMode="cover" />
                <Animated.Text entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(100)} allowFontScaling={false} style={{ paddingLeft: 35, fontSize: 20, color: colors.readioWhite, textAlign: "center", fontWeight: "bold" }}>Lotus</Animated.Text>
              </View>
            </TouchableOpacity>

            <Animated.Text entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(100)} allowFontScaling={false} style={{ color: colors.readioWhite, opacity: 0.61, textAlign: "center", fontWeight: "bold" }}>Smart Audio for Students of Life.</Animated.Text>

          </View>
          
          <TouchableOpacity onPress={() => setIsModalVisible(true)} style={{ backgroundColor: colors.readioOrange, borderRadius: 60, width: 50, height: 50, display: "flex", justifyContent: "center", alignItems: "center" }} activeOpacity={0.9}>
            <Animated.View entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(100)} >
              <FontAwesome allowFontScaling={false} name="plus" style={{ color: colors.readioWhite, fontWeight: "bold", fontSize: 20 }} />
            </Animated.View>
          </TouchableOpacity>


        </View>

        <ScrollView refreshControl={<RefreshControl tintColor={colors.readioWhite} refreshing={refreshing} onRefresh={onRefresh} />} style={{ height: "100%", width: "100%" }} showsVerticalScrollIndicator={false}>

          <View style={{ width: "100%" }}>


            {/* NOTE AD CAROUSEL */}
            <Animated.ScrollView entering={FadeInUp.duration(200)} exiting={FadeOutDown.duration(200)} showsHorizontalScrollIndicator={false} horizontal style={{ width: "100%", backgroundColor: "transparent", paddingHorizontal: 20, marginVertical: 20, overflow: "hidden" }}>
              
            {/* <View style={{ width: 300, height: 300, alignItems: "center", justifyContent: "center", marginRight: 10, backgroundColor: colors.readioBlack, borderRadius: 10, }}>
              <FastImage source={Asset.fromModule(require('@/assets/images/cropwhitelogo.png'))} style={{ width: 60, height: 60, position: 'absolute', zIndex: 2, backgroundColor: "transparent", alignSelf: "flex-end", top: 0 }} resizeMode="cover" />
              <LinearGradient
                colors={[colors.readioBrown, 'transparent']}
                style={{
                  zIndex: 1,
                  position: 'absolute',
                  width: '100%',
                  height: "100%",
                  transform: [{ rotate: '-180deg' }]
                }}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
              />
              
              <View style={{width: '85%', zIndex: 4 }}>

              <Text allowFontScaling={false} style={[{color: colors.readioWhite, fontFamily: readioBoldFont,  textAlign: "center", fontSize: 23 }]}>
                SMART AUDIO FOR
              </Text>
              <Text allowFontScaling={false} style={[{color: colors.readioOrange, fontFamily: readioBoldFont,  textAlign: "center", fontSize: 23 }]}>
                STUDENTS OF LIFE.
              </Text>

              <View style={{width: '100%', marginTop: 10, opacity: 0.61}}>
                <Text allowFontScaling={false} style={[styles.announcmentSmallText, { paddingHorizontal: 10, textAlign: "center", fontSize: 13 }]}>
                  Listen. Learn. Move. Grow.
                </Text>
                <Text allowFontScaling={false} style={[styles.announcmentSmallText, { paddingHorizontal: 10, textAlign: "center", fontSize: 13 }]}>
                  A holistic habitat for
                </Text>
                <Text allowFontScaling={false} style={[styles.announcmentSmallText, { paddingHorizontal: 10, textAlign: "center", fontSize: 13 }]}>
                  active listeners.
                </Text>

              </View>

              </View>


            </View> */}
              
              {[1, 2, 3].map((item, index) => (
                <View key={index} style={{ width: 300, height: 300, marginRight: 10, backgroundColor: colors.readioBlack, borderRadius: 10, }}>
                  <FastImage source={Asset.fromModule(require('@/assets/images/cropwhitelogo.png'))} style={{ width: 60, height: 60, position: 'absolute', zIndex: 2, backgroundColor: "transparent", alignSelf: "flex-end" }} resizeMode="cover" />
                  <LinearGradient
                    colors={[colors.readioBrown, 'transparent']}
                    style={{
                      zIndex: 1,
                      position: 'absolute',
                      width: '100%',
                      height: "100%",
                      transform: [{ rotate: '-180deg' }]
                    }}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                  />
                  {/* <FastImage source={Asset.fromModule(require('@/assets/images/giantsteps-1.png'))}  style={{ width: '100%', height: '120%', borderRadius: 10, backgroundColor: 'transparent'}} resizeMode="cover" /> */}
                </View>
              ))}
              <View style={{ width: 30, height: 300 }}></View>
            </Animated.ScrollView>

            {/* NOTE ANNOUNCEMENT */}

            <View>

              <View style={{ width: "90%", alignSelf: "center", marginTop: 10 }}>
                <Text allowFontScaling={false} style={[styles.announcmentSmallText, { opacity: 0.5 }]}>Featured Lotus Liner Note</Text>
                <Text allowFontScaling={false} style={[styles.announcmentBigText, { fontSize: 20 }]}>{featureArticleName.trim()}</Text>
                <Text allowFontScaling={false} style={[styles.announcmentSmallText, { opacity: 0.5, fontSize: 20 }]}>Check out this article and more!</Text>
              </View>

              <Animated.View entering={FadeInDown.duration(200)} exiting={FadeOutDown.duration(200)} style={{ width: "90%", alignSelf: "center", paddingVertical: 20, borderRadius: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.35, shadowRadius: 18.84, elevation: 5 }}>

                <Pressable onPress={handleGoToLinerNotes} style={{ display: "flex", height: 200, width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <FastImage onLoadEnd={() => setImagesLoaded(imagesLoaded + 1)} source={{ uri: featureArticleImage }} resizeMode='cover' style={{ position: 'absolute', zIndex: -2, borderRadius: 10, width: "100%", height: "100%" }} />
                  <FastImage onLoadEnd={() => setImagesLoaded(imagesLoaded + 1)} source={{ uri: filter }} resizeMode='center' style={{ position: 'absolute', borderRadius: 10, zIndex: -2, width: "100%", height: "100%", opacity: 0.4 }} />
                  <LinearGradient
                    colors={[colors.readioBrown, 'transparent']}
                    style={{
                      zIndex: -1,
                      bottom: 0,
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      transform: [{ rotate: '-180deg' }]
                    }}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                  />
                  <View style={{ display: "flex", padding: 10, alignSelf: 'flex-end', width: "95%", opacity: 0.61, flexDirection: "column" }}>
                    <Text allowFontScaling={false} style={styles.announcmentSmallText}>Lotus Liner Notes is our featured smart audio article series rubricated by Stic of dead prez for instant insights and inspiration.</Text>
                  </View>
                  <Pressable style={{ top: 10, position: "absolute", right: 10, display: 'flex', alignItems: 'flex-end', flexDirection: 'row', gap: 10 }}>
                    <Text allowFontScaling={false} style={[styles.announcmentSmallText, { color: colors.readioWhite, fontSize: 18 }]}>Listen</Text>
                    <FontAwesome name="chevron-right" style={{ color: colors.readioWhite, fontWeight: "bold", fontSize: 18 }} />
                  </Pressable>
                  {/* 
                          <TouchableOpacity activeOpacity={0.90} onPress={handleLotusStationPress}>
                            <View style={{backgroundColor: colors.readioOrange, display: "flex", alignItems: "center", justifyContent: "center", width: 50, height: 50, borderRadius: 600}}>
                                <FontAwesome size={20} color={colors.readioWhite} name="play"/>
                            </View>          
                          </TouchableOpacity> */}

                </Pressable>

              </Animated.View>

            </View>

            <View style={{ height: 10 }} />

            {/* NOTE CREATE A ARTICLE */}

            <Pressable onPress={() => setIsModalVisible(true)} style={{ width: "90%", alignSelf: "center", marginVertical: 30, display: 'flex', flexDirection: "row", alignItems: "center", gap: 15 }}>
              <Text allowFontScaling={false} style={[styles.announcmentBigText, {}]}>Create your own article</Text>
              <FontAwesome name="chevron-right" style={{ color: colors.readioWhite, fontWeight: "bold", fontSize: 20 }} />
            </Pressable>

          </View>

          <View style={{ height: 100 }}>

          </View>

        </ScrollView>
      </SafeAreaView>

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
                  onPress={() => (articleGenerationStatus === 'done' ? handleReset() : handleGenerateReadio())} 
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

        <View style={{ width: '100%', height: '6%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity onPress={() => router.push('/(auth)/welcome')} style={{ display: 'flex', flexDirection: 'row' }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.readioOrange }}>L</Text>
          </TouchableOpacity>
        </View>

        <NotSignedIn />

      </ScrollView>

    </>

  )

}

const styles = StyleSheet.create({
  pagerView: {
    flex: 1,
  },
  page: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
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
    minHeight: '100%',
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
  title: {
    fontSize: 20,
    // fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: colors.readioWhite,
    fontFamily: readioRegularFont
  },
  announcmentBigText: {
    fontSize: 18,
    color: colors.readioWhite,
    fontFamily: readioBoldFont
  },
  announcmentSmallText: {
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
    // height: 410,
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
    // marginVertical: 5,
    // width: '80%',
    color: colors.readioWhite,
    paddingHorizontal: 10,
    // position: 'absolute',
    // zIndex: 1,
    // bottom: 0,
    // left: 0,
    // transform: [{ translateX: 10 }, { translateY: 10 }],
    fontFamily: readioRegularFont,
    fontSize: 20
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
  },
});