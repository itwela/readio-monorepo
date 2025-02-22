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
import { bookshelfImg, croplogowhite, filter } from '@/constants/images';
import sql from "@/helpers/neonClient";
import { geminiCategory, geminiPexals, geminiReadio, geminiTest, geminiTitle } from "@/helpers/geminiClient";
import { createClient } from "pexels";
import TrackPlayer from "react-native-track-player";
import { chatgpt } from '@/helpers/openAiClient';
import AnimatedModal from '@/components/AnimatedModal';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
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
import { replicate } from "@/helpers/replicateClient";
import { useProgressQueue } from "../../../handleArticleGenerations/processingQueue";
import { handleGenerateArticleCompletelyFree, handleGenerateArticleCompletelyFreeProps } from "../../../handleArticleGenerations/handleGenerateArticle";
import { getLocalImageUri, preloadImages } from "@/constants/imageAssets";
import { useLastActiveTrack } from "@/hooks/useLastActiveTrack";
import { setActiveTrack } from "@/hooks/useActiveTrack";

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
  const { ProgressQueue, animatedStyles, setGenerationStarted, setProgressMessage, generationStarted, progressMessage, handleProgressContainerLayout } = useProgressQueue()
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const { clearLastActiveTrack  } = useLastActiveTrack()


  const resetAudio = () => {
    TrackPlayer.pause();
    console.log("Tp is paused ,")
    TrackPlayer.reset();
    console.log("Tp is reset ,")
    clearLastActiveTrack();
  }

  useEffect(() => {
    const loadAssets = async () => {
      const loaded = await preloadImages();
      setAssetsLoaded(loaded);
      if (loaded) {
        setScreenIsReady(true);
      }
    };
    loadAssets();
    resetAudio();
  }, []);

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

  // REVIEW GET FEATURED ARTICLE NAME
  const getFeaaturedArticle = async () => {
    const data = await sql`SELECT * FROM readios WHERE featured = true`;
    console.log("data")
    setFeatureArticleName?.(data?.[0]?.title)
    setFeatureArticleImage?.(data?.[0]?.image)
  }


  useEffect(() => {
    
    getFeaaturedArticle()
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
  const {featureArticleName, featureArticleImage, setFeatureArticleName, setFeatureArticleImage } = useReadio()
  const [numberNeededToStart, setNumberNeededToStart] = useState(-2)

  // REVIEW GOES TO LINER NOTES PAGE
  const handleGoToLinerNotes = async () => {
    TrackPlayer.reset()
    setLinerNoteTopic?.("Lotus Liner Notes")
    router.push('/(tabs)/(home)/linerNotes')
  }

  const [refreshing, setRefreshing] = useState(false); // For refresh control

  const onRefresh = () => {
    setRefreshing(true);
    setNeedsToRefresh?.(true)
    resetAudio();
    // checkSignInStatus()

    // Add any refresh logic here, such as resetting state or re-fetching data
    setTimeout(() => {
      setRefreshing(false);
      setNeedsToRefresh?.(false)
    }, 1000); // Simulate an async operation
  };

  // const [imagesLoaded, setImagesLoaded] = useState(0)
  const [screenIsReady, setScreenIsReady] = useState(false)

  useEffect(() => {
    if (needsToRefresh) {
      getFeaaturedArticle()
    }
  }, [needsToRefresh])


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
      console.log("Fetched Image");

      return pexelsImage;
    } catch (error) {
      console.error("Error during Pexels Test:", error);
      return false; // Continue even if there's an error
    }
  };


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
      setForm({ ...form, query: '' })
      setForm({ ...form, query: '' })
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

  useEffect(() => {
    
    const runTests = async () => {

      // ensure the que works
      setTimeout(() => {
        setGenerationStarted(true);
        console.log('running--------------------------------')
        console.log('generation started: ', generationStarted)
        ProgressQueue.resetQueue();
        ProgressQueue.resetQueue();
      }, 100)

        setArticleGenerationStatus('generating...')
        setProgressMessage("Were generating your article...")
        ProgressQueue.updateProgress("START_ONE");

        console.log('running tests...')
        const geminiTestResult = await testGemini();
        const pexelsTestResult = await testPexels(geminiTestResult);
        console.log('success')

        // NOTE  ---- if both test are Test are good ✅, we can make the article now with free service
        return geminiTestResult === true && pexelsTestResult === true;

        // other wise ^ returns false
    }

    const makeArticleNow = async () => {
      await handleGenerateArticleCompletelyFree({
        form: form,
        user: user,
        setGenerationStarted: setGenerationStarted,
        setArticleGenerationStatus: setArticleGenerationStatus,
        setProgressMessage: setProgressMessage,
        setWantsToMakeAnArticle: setWantsToMakeAnArticle,
        progress: ProgressQueue
      } as handleGenerateArticleCompletelyFreeProps);
    };

    const executeArticleGeneration = async () => {
      const testsSucceeded = await runTests();
      if (testsSucceeded) {
        await makeArticleNow();
      } else {
        setProgressMessage("Service outage...Please try again 🔴");
      }
    };


    if (wantsToMakeAnArticle) {

      Keyboard.dismiss();

      executeArticleGeneration();
      ProgressQueue.updateProgress("COMPLETE_SEVEN");
      setTimeout(() => {
        ProgressQueue.resetQueue()
        setArticleGenerationStatus('done')
        setWantsToMakeAnArticle(false)
      }, 1000)
    }


  }, [wantsToMakeAnArticle]);


  //  END  --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  const testReplicate = async () => {
    try {
      const input = {
        prompt: "Tell me 1 interesting fact about cherries",
        max_new_tokens: 1000,
        prompt_template: "<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n{system_prompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n{prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n"
      };

      const output = await replicate.run("meta/meta-llama-3-8b-instruct", { input });

      if (Array.isArray(output)) {
        const formattedOutput = output
          .join('')
          .trim()
          // Keep only letters, numbers, spaces, and basic punctuation
          .replace(/[^a-zA-Z0-9\s.,!?]/g, '')
          // Normalize spaces
          .replace(/\s+/g, ' ')
          // Ensure proper spacing after punctuation
          .replace(/([.,!?])(\w)/g, '$1 $2');

        console.log("replicate works!", formattedOutput);
      } else {
        const cleanOutput = String(output)
          .replace(/[^a-zA-Z0-9\s.,!?]/g, '')
          .replace(/\s+/g, ' ')
          .replace(/([.,!?])(\w)/g, '$1 $2');

        console.log("replicate works!", cleanOutput);
      }
    } catch (error) {
      console.error("Error in testReplicate:", error);
    }
  };

  return (
    <>
{/* 
      {screenIsReady === false && (
        <>
          <Animated.View exiting={FadeOut.duration(1500)} style={{ position: 'absolute', bottom: 0, zIndex: 1, width: '100%', height: '100%', justifyContent: 'center', gap: 10, backgroundColor: colors.readioBrown }}>

            <SafeAreaView style={{ position: 'absolute', top: 0, left: "6.18%" }}>

              <View style={{ display: "flex", flexDirection: "column", }}>

                <TouchableOpacity style={[styles.heading, { backgroundColor: 'transparent', }]} activeOpacity={0.99}>
                  <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
                    <Animated.Text entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(100)} allowFontScaling={false} style={{ fontSize: 20, color: colors.readioWhite, textAlign: "center", fontWeight: "bold" }}>Lotus</Animated.Text>
                  </View>
                </TouchableOpacity>

                <Animated.Text entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(100)} allowFontScaling={false} style={{ color: colors.readioWhite, opacity: 0.61, textAlign: "center", fontWeight: "bold" }}>Always Growing</Animated.Text>

              </View>
            </SafeAreaView>

            <Animated.Text exiting={FadeOutUp.duration(100)} style={{ alignSelf: 'center', color: colors.readioWhite, fontFamily: readioRegularFont, fontSize: 13 }}>Were loading your experience...</Animated.Text>
            <ActivityIndicator size="large" color={colors.readioWhite} />
          </Animated.View>
        </>
      )} */}

      <SafeAreaView style={[utilStyle.safeAreaContainer, { width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }]}>

        <FastImage 
          source={{ uri: getLocalImageUri('bookshelf') }} 
          style={[{ zIndex: -2, opacity: 1, position: 'absolute', width: '100%', height: '40%' }]} 
          resizeMode='cover' 
        />
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

          <View style={{ display: "flex", flexDirection: "column", }}>

            <TouchableOpacity style={[styles.heading, { backgroundColor: 'transparent', }]} activeOpacity={0.99}>
              {/* <Text style={{color: colors.readioWhite, textAlign: 'center'}}>Demo</Text> */}
              <View style={{ display: 'flex', flexDirection: 'row', gap: 5, alignItems: 'center', justifyContent: 'flex-start' }}>
                
              <FastImage 
                  source={{ uri: getLocalImageUri('whiteLogo') }} 
                  style={[{ width: 30, height: 30, }]} 
                  resizeMode='contain' 
                />
                
                <Animated.Text entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(100)} allowFontScaling={false} style={{ fontSize: 20, color: colors.readioWhite, textAlign: "center", fontWeight: "bold" }}>Lotus</Animated.Text>
              
              </View>
            </TouchableOpacity>

            <Animated.Text entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(100)} allowFontScaling={false} style={{ color: colors.readioWhite, opacity: 0.61, textAlign: "center", fontWeight: "bold" }}>Always Growing</Animated.Text>

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


              {[1, 2, 3].map((item, index) => (
                <View key={index} style={{ width: 300, height: 300, marginRight: 10, backgroundColor: colors.readioBlack, borderRadius: 10, }}>
                 
                 <FastImage 
                  source={{ uri: getLocalImageUri('whiteLogo') }} 
                  style={[{ width: 30, height: 30, alignSelf: 'flex-end', position: 'absolute', right: 20, top: 5 }]} 
                  resizeMode='contain' 
                />

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
                <Text allowFontScaling={false} style={[styles.announcmentBigText, { fontSize: 20 }]}>{featureArticleName?.trim()}</Text>
                <Text allowFontScaling={false} style={[styles.announcmentSmallText, { opacity: 0.5, fontSize: 20 }]}>Check out this article and more!</Text>
              </View>

              <Animated.View entering={FadeInDown.duration(200)} exiting={FadeOutDown.duration(200)} style={{ width: "90%", alignSelf: "center", paddingVertical: 20, borderRadius: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.35, shadowRadius: 18.84, elevation: 5 }}>

                <Pressable onPress={handleGoToLinerNotes} style={{ display: "flex", height: 200, width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  
                  <FastImage source={{ uri: featureArticleImage }} resizeMode='cover' style={{ position: 'absolute', zIndex: -2, borderRadius: 10, width: "100%", height: "100%" }} />
                    <FastImage 
                    source={{ uri: getLocalImageUri('filter') }} 
                    resizeMode='center' style={{ position: 'absolute', borderRadius: 10, zIndex: -2, width: "100%", height: "100%", opacity: 0.4 }}
                  />

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

          <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={10} style={{ paddingHorizontal: 20, backgroundColor: 'transparent', width: '100%', height: '100%', display: 'flex', justifyContent: "center", paddingVertical: "10%" }}>

            <View style={{ width: '100%',position: "absolute", top: "10%", display: 'flex', alignItems: 'flex-end', backgroundColor: "transparent" }}>
              <TouchableOpacity style={{ padding: 5 }} onPress={handleArticleCloseModal}>
                <FontAwesome name="close" size={30} color={colors.readioWhite} />
              </TouchableOpacity>
            </View>

            {generationStarted === true && (
              <>
                  <Text style={{ color: colors.readioWhite, position: 'absolute', top: '19%', zIndex: 200, fontFamily: readioRegularFont, alignSelf: 'center' }}>{progressMessage}</Text>
                  {/* FIXME queue will fix soon */}
                  {/* <View onLayout={handleProgressContainerLayout} style={{ position: 'absolute', top: '22%', zIndex: 200, width: '90%', marginTop: 10, overflow: "hidden", height: 10, backgroundColor: colors.readioOrange, alignSelf: "center", borderRadius: 10 }}>
                    <Animated.View style={[animatedStyles, { width: `100%`, zIndex: 20, alignSelf: "flex-start", height: 10, backgroundColor: colors.readioBlack, borderRadius: 0 }]} />
                  </View> */}
              </>
            )}

            <View style={{ display: 'flex', zIndex: 2, width: '100%', alignSelf: 'center', alignItems: 'center', justifyContent: 'center', backgroundColor: "transparent", flexDirection: "column" }}>
              
              <Animated.View entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(300)} style={{  backgroundColor: colors.readioOrange, borderRadius: 100, padding: 10}}>
                <FastImage 
                    source={{ uri: getLocalImageUri('whiteLogo') }} 
                    style={{ width: 80, height: 80,  zIndex: 2, }} resizeMode='contain' 
                  />
              </Animated.View>

              <View style={{ width: '90%', zIndex: 2 }}>
                <Text allowFontScaling={false} style={styles.heading}>Create</Text>
                <Text allowFontScaling={false} style={styles.subtext}>From simple ideas to detailed instructions, craft the perfect article in moments.</Text>
              </View>
              
              <View style={{ marginVertical: 10 }}>
                {/* <Text allowFontScaling={false} style={{ color: colors.readioWhite, opacity: 0.6, textAlign: 'center' }}>Using your wildest imagination,</Text> */}
                <Text allowFontScaling={false} style={{ color: colors.readioWhite, opacity: 0.6, textAlign: 'center' }}>What do you want to hear?</Text>
              </View>


            </View>
           
            <View style={{ justifyContent: 'center', backgroundColor: colors.readioBlack, borderRadius: 10, width: '100%', alignItems: 'flex-start', }}>
              <InputField
                onChangeText={(text) => setForm({ ...form, query: text })} value={form.query}
                placeholder={articleGenerationStatus === 'done' ? 'Article created! Check your library!' : "Type your query here..."}
                style={{ width: '90%', height: 45, padding: 15, color: colors.readioWhite, fontSize: 15, fontFamily: readioRegularFont }} label="">
              </InputField>

              <Pressable
                disabled={form?.query?.length === 0}
                onPress={() => (articleGenerationStatus === 'done' ? handleReset() : setWantsToMakeAnArticle(true))}
                style={{
                  position: 'absolute',
                  backgroundColor: form?.query?.length > 0 ? colors.readioOrange : colors.readioBlack,
                  opacity: form?.query?.length > 0 ? 1 : 0.2,
                  width: 40, height: 40, right: 10, padding: 10, marginVertical: 10, borderRadius: 100, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                <FontAwesome name={articleGenerationStatus === 'done' ? 'refresh' : 'chevron-right'} allowFontScaling={false} style={{ color: colors.readioWhite, fontWeight: 'bold', fontSize: 20 }} ></FontAwesome>
              </Pressable>

            </View>


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