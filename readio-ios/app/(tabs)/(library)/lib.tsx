import { SafeAreaView } from 'react-native-safe-area-context';
import { utilStyle } from "@/constants/tokens";
import { colors } from "@/constants/tokens";
import { StyleSheet, Text, View, ScrollView, KeyboardAvoidingView, TouchableOpacity, Modal, Button, Pressable, LayoutChangeEvent, Keyboard } from "react-native";
import { readioRegularFont, readioBoldFont } from "@/constants/tokens";
import { useTracks } from '@/store/library';
import { useMemo } from 'react';
import { trackTitleFilter } from '@/helpers/filter'
import { useNavigationSearch } from '@/hooks/useNavigationSearch'
import { Href, router } from 'expo-router';
import NotSignedIn from '@/constants/notSignedIn';
import { Readio, UserStuff } from '@/types/type';
import { useEffect, useState } from 'react';
import { useReadio } from '@/constants/readioContext';
import InputField from '@/components/inputField';
import FastImage from 'react-native-fast-image';
import { useNavigation } from "@react-navigation/native";
import { RootNavigationProp } from "@/types/type";
import { croplogowhite, filter, unknownTrackImageUri } from '@/constants/images';
import { FontAwesome } from '@expo/vector-icons';
import sql from "@/helpers/neonClient";
import { geminiTest } from '@/helpers/geminiClient';
import Animated, { FadeInUp, FadeOut, FadeOutDown, FadeOutUp, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { pexelsClient } from '@/helpers/pexelsClient';
import React from 'react';
import { handleGenerateArticleCompletelyFree, handleGenerateArticleCompletelyFreeProps } from '../../../handleArticleGenerations/handleGenerateArticle';
import { useProgressQueue } from '../../../handleArticleGenerations/processingQueue';
import TrackPlayer, { useActiveTrack } from 'react-native-track-player';
import { useLastActiveTrack } from '@/hooks/useLastActiveTrack';
import { getLocalImageUri } from '@/constants/imageAssets';

export default function LibTabTwo() {
  return (
    <>
      <SafeAreaView style={[utilStyle.safeAreaContainer, { backgroundColor: colors.readioBrown, width: '100%', padding: utilStyle.padding.padding }]}>

        <SignedInLib />

      </SafeAreaView>
    </>
  )
}

function SignedInLib() {
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
  const { readioSelectedReadioId, setReadioSelectedReadioId, floatingPlayerIsVisible } = useReadio()
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [progressModalVisible, setProgressModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("")
  const [articleGenerationStatus, setArticleGenerationStatus] = useState('')
  const { needsToRefresh, setNeedsToRefresh, setLinerNoteTopic } = useReadio()
  const { ProgressQueue, animatedStyles, setGenerationStarted, setProgressMessage, generationStarted, progressMessage, handleProgressContainerLayout } = useProgressQueue()

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
  // NOTE This is the create modal stuff

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };
  const [form, setForm] = useState({
    query: ''
  })

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

  const handleGoToLinerNotes = async () => {
    TrackPlayer.reset()
    setLinerNoteTopic?.("Lotus Liner Notes")
    router.push('/(tabs)/(home)/linerNotes')
  }

  const activeTrack = useActiveTrack();
  const lastActiveTrack = useLastActiveTrack();
  const displayedTrack = activeTrack ?? lastActiveTrack;


  return (
    <>

      <ScrollView style={{
        width: '100%',
        minHeight: '100%',
      }}
        showsVerticalScrollIndicator={false}  // Hides vertical scroll bar
      >
        <Animated.Text entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(100)} allowFontScaling={false} style={styles.bettertittle}>Library</Animated.Text>
        <View style={{
          paddingVertical: 5,
          backgroundColor: "transparent",
        }}>
          <Animated.Text entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(100)} allowFontScaling={false} style={styles.option} onPress={() => router.push('/(tabs)/(library)/(playlist)')}>Playlist</Animated.Text>
          <Animated.Text entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(100)} allowFontScaling={false} style={styles.option} onPress={() => router.push('/(tabs)/(library)/(playlist)/interests')}>Interests</Animated.Text>
          <Animated.Text entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(100)} allowFontScaling={false} style={styles.option} onPress={() => {handleGoToLinerNotes()}}>Liner Notes</Animated.Text>
          <Animated.Text entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(100)} allowFontScaling={false} style={styles.option} onPress={() => router.push('/all-readios')}>All Articles</Animated.Text>
        </View>
        <View style={{ marginVertical: 15 }} />
        <Animated.Text entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(100)} allowFontScaling={false} style={styles.title}>Recently Saved Articles</Animated.Text>


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


        <View style={styles.recentlySavedContainer}>

          {readios?.length === 0 && (
            <>
              <TouchableOpacity activeOpacity={0.9} onPress={toggleModal} style={styles.recentlySavedItems}>
                <Animated.View entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(100)} >

                  <View style={styles.recentlySavedImg}>
                    <Text allowFontScaling={false} style={[styles.readioRedTitle, { fontSize: 40 }]}>+</Text>
                    {/* <Image source={{uri: stations?.[0]?.imageurl}} style={styles.nowPlayingImage} resizeMode='cover'/> */}
                  </View>
                  <Text allowFontScaling={false} style={styles.readioRedTitle}>Create an Article</Text>
                </Animated.View>
              </TouchableOpacity>
            </>
          )}

          {readios?.length > 0 && (
            <>
              {readios?.map((readio: Readio, index) => (
                <TouchableOpacity activeOpacity={0.9} onPress={() => handleGoToSelectedReadio(readio?.id as number, readio?.title as string)} key={readio.id} style={styles.recentlySavedItems}>
                  <Animated.View entering={FadeInUp.duration(300 + (index * 100))} exiting={FadeOutDown.duration(100)} >
                    <View style={styles.recentlySavedImg}>
                      {/* <Image source={{uri: readio.image}} style={styles.nowPlayingImage} resizeMode='cover'/> */}
                    <FastImage  source={{ uri: getLocalImageUri('filter') }}  style={[styles.nowPlayingImage, { zIndex: 1, opacity: 0.4 }]} resizeMode='cover' />
                      <FastImage source={{ uri: readio.image ? readio.image : getLocalImageUri('unknownArticle') }} style={styles.nowPlayingImage} resizeMode='cover' />
                      {/* <Image source={{uri: stations?.[0]?.imageurl}} style={styles.nowPlayingImage} resizeMode='cover'/> */}
                    </View>
                    <Text allowFontScaling={false} numberOfLines={2} style={styles.recentlySavedTItle}>{readio.title}</Text>
                    <Text allowFontScaling={false} numberOfLines={1} style={styles.recentlySavedSubheading}>{readio.topic}</Text>
                  </Animated.View>
                </TouchableOpacity>
              ))}
              <TouchableOpacity activeOpacity={0.9} onPress={toggleModal} style={styles.recentlySavedItems}>
                <Animated.View entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(100)} >

                  <View style={styles.recentlySavedImg}>
                    <Text allowFontScaling={false} style={[styles.readioRedTitle, { fontSize: 40 }]}>+</Text>
                    {/* <Image source={{uri: stations?.[0]?.imageurl}} style={styles.nowPlayingImage} resizeMode='cover'/> */}
                  </View>
                  <Text allowFontScaling={false} style={styles.readioRedTitle}>Create an Article</Text>
                </Animated.View>
              </TouchableOpacity>
            </>

          )}


          {/* <View style={[styles.gap, { paddingBottom: floatingPlayerIsVisible === false ? 150 : 120 }]}></View> */}

        </View>

        <View style={{ height: floatingPlayerIsVisible ? 90 : 60}}/>

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