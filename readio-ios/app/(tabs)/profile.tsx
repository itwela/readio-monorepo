import { colors } from "@/constants/tokens";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity,RefreshControl, Pressable, Dimensions, Modal, KeyboardAvoidingView, ActivityIndicator, LayoutChangeEvent } from "react-native";
import { readioRegularFont, readioBoldFont } from "@/constants/tokens";
import  { accessKeyId, secretAccessKey } from '@/helpers/s3Client';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { buttonStyle, utilStyle } from "@/constants/tokens";
import { router } from 'expo-router';
import { useReadio } from "@/constants/readioContext";
import Animated, { FadeIn, FadeInDown, FadeInUp, FadeOut, FadeOutDown, FadeOutUp, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { SlideInUp, SlideOutDown } from "react-native-reanimated";
import { whitelogo, blacklogo } from "@/constants/images";
import FastImage from "react-native-fast-image";
import { useEffect, useState } from "react";
import { FontAwesome } from "@expo/vector-icons";
import InputField from "@/components/inputField";
import { icons } from "@/constants/icons";
import sql from "@/helpers/neonClient";
import { Asset } from 'expo-asset';
import { LinearGradient } from "expo-linear-gradient";
import AnimatedModal from "@/components/AnimatedModal";
import { geminiPexals, geminiTest, geminiTitle } from "@/helpers/geminiClient";
import { createClient } from "pexels";
import ReactNativeBlobUtil from 'react-native-blob-util'
import { s3 } from '@/helpers/s3Client';
import { pexelsClient } from "@/helpers/pexelsClient";
import { Buffer } from 'buffer';
import React from "react";
import { Keyboard } from "react-native";


export default function ProfileScreen() {
  const {user, setUser, needsToRefresh, setNeedsToRefresh} = useReadio()
  const [modalMessage, setModalMessage] = useState("")
  
  const [wantsToEditProfile, setWantsToEditProfile] = useState(false)
  const [isEditModalVisible, setIsEditModalVisible] = useState(false)
  const [isArticleModalVisible, setIsArticleModalVisible] = useState(false)
  const [articleGenerationStatus, setArticleGenerationStatus] = useState('')

  const [articleLength, setArticleLength] = useState(0)
  // const toggleEditModal = () => {
  // setIsEditModalVisible(!isEditModalVisible);
  // }
  // const toggleArticleModal = () => {
  // setIsArticleModalVisible(!isArticleModalVisible);
  // }




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
    // NOTE This section handles study generation 

    const [wantsToMakeAnArticle, setWantsToMakeAnArticle] = useState<any>(null)

    // ANCHOR GEMINI TEST FUNCTION
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

    // ANCHOR GEMINI TEST FUNCTION
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
            await handleGenerateReadioCustom();
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

      /* ANCHOR 
      wantsToMakeAnArticle is placed as a dependency in this array to essentially watch for changes in the state of  wantsToMakeAnArticle
      the useEffect now will always watch for changes in wantsToMakeAnArticle
      If wantsToMakeAnArticle is equal to TRUE , it will fire off the tests to verify gemini :D
      If the tests come back resulting in true, then I run my "Important  Functions"
      If not, I get to handle the error HOWEVER I WANT. Which is exactly what I am going for.
      */
    }, [wantsToMakeAnArticle]);
 

    const handleGenerateReadioCustom = async () => {

      ProgressQueue.resetQueue()
      ProgressQueue.resetQueue()
      
      Keyboard.dismiss();
      ProgressQueue.add(pV[0]);

      
      setArticleGenerationStatus('generating...')
      setGenerationStarted(true);
      setProgressMessage("Were generating your article...")
      
      // NOTE generate a title with ai ------------------------------------------------
      
      // Add first progress update to queue
      ProgressQueue.add(pV[1]);
      const readioTitles = await sql`
      SELECT title FROM readios WHERE clerk_id = ${user?.clerk_id}
      `;

      console.log("Starting Gemini...");

      // Using a variable instead of useState for title
      let title = "";
      console.log("Starting Gemini...title");
      const promptTitle = `Please generate me a good title for this readio. Here is a preview of the article: ${articleForm?.query.substring(0, 100)}. Also, here are the titles of the readios I already have. ${readioTitles}. Please give me something new and not in this list.`;

      geminiTitle.generateContent(promptTitle)
        .then(resultTitle => resultTitle.response)
        .then(geminiTitleResponse => geminiTitleResponse.text())
        .then(textTitle => {
          if (textTitle.length > 0) {
            title = textTitle; // Assigning the response to the variable title
            console.log("set title response: ", title);
          } else {
            console.log("Title is empty, not setting it.");
          }
        })
        .catch(error => {
          console.error("Error generating title:", error.message);
      });

      // END END END -----------------------------------------------------------------

      // Using a variable instead of useState for pexalQuery
      let pexalQuery = "";
      const promptPexals =  `Can you make me a pexals query? The title we came up with for the readio itself is: ${title}, and a preview of the article is: ${articleForm?.query.substring(0, 100)}.`;
      const resultPexals = await geminiPexals.generateContent(promptPexals);
      const geminiPexalsResponse = await resultPexals.response;
      const textPexals = geminiPexalsResponse.text();    
      pexalQuery = textPexals;
      console.log("set pexal response: ", pexalQuery);
      
      ProgressQueue.add(pV[2]);
      // END END END -----------------------------------------------------------------

      // NOTE Pexals ----------------------------------------------------------
      console.log("Starting Pexals....");
      const searchQuery = `${pexalQuery}`;
      let illustration = "";
      let pexalsResponse;
      try {
          const response = await pexelsClient.photos.search({
              query: `${searchQuery}`,
              per_page: 1,
          });

          if (response && "photos" in response && response.photos?.length > 0) {
              illustration = response.photos[0].src.landscape;
              setProgressMessage("Found a cool image for you...");
          } else {
              setProgressMessage("Couldn't find a cool image for you...");
          }
      } catch (error) {
          console.error("Error fetching from Pexals:", error);
          setProgressMessage(`Couldn't find a cool image for you... Error: ${error}`);
      }

      ProgressQueue.add(pV[3]);
      // NOTE database --------------------------------------------------------
      
      console.log("Starting Supabase....");
      
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
              ${articleForm?.query},
              'Study', 
              ${title},
              ${user?.clerk_id},
              ${user?.fullName},
              ${user?.fullName},
              'default',
              0
              )
              RETURNING id, image, text, topic, title, clerk_id, username, artist, tag, upvotes;
        `;
        
        console.log("addReadioToDB: ", addReadioToDB);

        console.log("Ending Supabase....");    

        ProgressQueue.add(pV[4]);
    
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
          articleForm?.query,
          'bc2697930732a0ba97be1d90cf641035',
          "ri3Bh626mOazCBOSTIae",
        )
        console.log("path: ", path);
        
        for (let i = 1; i <= 10; i++) {
          console.log(`Count: ${i}`);
        }

        console.log("Trying to read audio file...");
        const base64Audio = await ReactNativeBlobUtil.fs.readFile(path, 'base64');
        console.log('success')

        console.log("Trying to get buffer file...");

        ProgressQueue.add(pV[5]);
        setProgressMessage("Almost done...");
        
        let audioBuffer;

          try {
            audioBuffer = Buffer.from(base64Audio, 'base64');
            console.log('Audio buffer created successfully');
          } catch (error) {
            console.error('Error creating audio buffer:', error);
            ProgressQueue.resetQueue()
            setProgressMessage("Failed to get image, Please try again. 🔴")  
          }
          console.log('success')
          // Upload the audio file to S3
          const s3Key = `${addReadioToDB?.[0]?.id}.mp3`;  // Define the file path within the S3 bucket
          console.log("s3Key line done");
      
          const aki = accessKeyId
          const ski = secretAccessKey
      
          console.log("aki: ", aki);
          console.log("ski: ", ski);

          ProgressQueue.add(pV[6]);

          try {
            await s3.upload({
              Bucket: "readio-audio-files",  // Your S3 bucket name
              Key: s3Key,
              Body: audioBuffer,
              ContentEncoding: 'base64', // Specify base64 encoding
              ContentType: 'audio/mpeg', // Specify content type
            }).promise();
            console.log("s3Key uploaded: ");
          } catch (error) {
            console.error("Failed to upload audio to S3:", error);
            ProgressQueue.resetQueue()
            setProgressMessage("Article creation unsuccessful. Please try again. 🔴");
            setArticleGenerationStatus('done')  
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
        
  
          ProgressQueue.add(pV[7]);
          setProgressMessage("Done, Check your library ✅");

      setTimeout(() => {
        setArticleGenerationStatus('done')
      }, 1000)

      // setModalVisible(false);
          
    }

    const handleReset = () => {
      try {

        setArticleGenerationStatus('')
        setWantsToMakeAnArticle(false)
        ProgressQueue.resetQueue()
        setProgressMessage('')
        setArticleForm({...articleForm, query: ''})
        setArticleForm({...articleForm, query: ''})
        ProgressQueue.resetQueue();
        setGenerationStarted(false)

      } catch (error) {

        console.error('Error in handleArticleCloseModal:', error);

      } finally {

        setTimeout(() => {
          setNeedsToRefresh?.(false);
        }, 200);

      }
    }


// END  --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------



  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [articleForm, setArticleForm] = useState({
    query: '',
  })

const [showPass, setShowPass] = useState(false)
const [doPasswordsMatch, setDoPasswordsMatch] = useState(false)

useEffect(() => {
    if (editForm.password?.length > 5 && editForm?.confirmPassword?.length > 5 && editForm?.password === editForm?.confirmPassword) {
        setDoPasswordsMatch(true)
        console.log('match')
      } else {
        setDoPasswordsMatch(false)
        console.log('NO match')
    }
}, [editForm.confirmPassword, editForm.password])
  
const [imagesLoaded, setImagesLoaded] = useState(0)
const [screenIsReady, setScreenIsReady] = useState(false)

useEffect(() => {
  if (imagesLoaded > 4 && user) {
      setTimeout(()=> {
          setScreenIsReady(true)
      }, 1000)
  }
}, [imagesLoaded, screenIsReady, setScreenIsReady])

useEffect(() => {
  const handleGetArticleCount = async () => {
    const getArticleIds = await sql`SELECT id FROM readios WHERE clerk_id = ${user?.clerk_id}`;
    const ALength = getArticleIds?.length
    setArticleLength(ALength)
  } 

  handleGetArticleCount()

}, [])

const handleSaveChanges = async () => {
  console.log(editForm);

  if (editForm?.name !== '' && editForm?.name?.length > 0) {
    console.log('valid name');
    try {
      const saveNewName = await sql`UPDATE users SET name = ${editForm.name} WHERE name = ${user?.name} AND jwt = ${user?.jwt}`;
      console.log('successfully updated name');
    } catch (error) {
      console.log('error', error)
    } 
  }

  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm?.email)) {
    console.log('valid email');
    try {
      const saveNewName = await sql`UPDATE users SET email = ${editForm.email} WHERE name = ${user?.name} AND jwt = ${user?.jwt}`;
      console.log('successfully updated email');
    } catch (error) {
      console.log('error', error)
    } 
  }

  if (  editForm?.password?.length > 5 && editForm?.password?.length > 5 && doPasswordsMatch === true  ) {
    console.log('valid password');
    try {
      const saveNewName = await sql`UPDATE users SET pass = ${editForm.password} WHERE name = ${user?.name} AND jwt = ${user?.jwt}`;
      console.log('successs1');
    } catch (error) {
      console.log('error', error)
    } 
  }

  const updateUser = await sql`SELECT * FROM users WHERE jwt = ${user?.jwt}`
  setUser?.(updateUser[0])
  setIsEditModalVisible(false)

}

const handleEditCloseModal = () => {
  setModalMessage("");
  setEditForm({ name: '', email: '', password: '', confirmPassword: '' });
  setIsEditModalVisible(false);
  setNeedsToRefresh?.(true)
  setTimeout(() => {
    setNeedsToRefresh?.(false)
  }, 200)
}

const handleArticleCloseModal = () => {
  try {
    setModalMessage("");
    setArticleGenerationStatus('');
    setArticleForm({ query: '' });
    setNeedsToRefresh?.(true);
    setIsArticleModalVisible(false);
    setWantsToMakeAnArticle(false)
    setGenerationStarted(false)
    ProgressQueue.resetQueue();
    ProgressQueue.resetQueue();
    router.push('/(tabs)/(library)/lib');
    console.log('ran function -------------------------------- ');
  } catch (error) {
    console.error('Error in handleArticleCloseModal:', error);
  } finally {
    setTimeout(() => {
      setNeedsToRefresh?.(false);
    }, 200);
  }
}

const [refreshing, setRefreshing] = useState(false); // For refresh control
const onRefresh = () => {
  setRefreshing(true);
  setNeedsToRefresh?.(true) 

  // Add any refresh logic here, such as resetting state or re-fetching data
  setTimeout(() => {
    setRefreshing(false);
    setNeedsToRefresh?.(false) 
  }, 1000); // Simulate an async operation
};

  return (
    <>

            {screenIsReady === false && (
                <>
              <Animated.View  exiting={FadeOut.duration(1500)} style={{position: 'absolute', bottom: 0, zIndex: 1, width: '100%', height: '100%', justifyContent: 'center', gap: 10, backgroundColor: colors.readioBrown}}>
                    
                    <View style={{position: 'absolute', top: 0, left: 0, padding: 3, paddingTop: 62}}>
                      <Text numberOfLines={1}  allowFontScaling={false} style={[styles.text, {width: '100%', padding: 20,}]}>Hi, {user?.name}!</Text>
                    </View>
                    
                    <Animated.Text  exiting={FadeOutUp.duration(100)} style={{alignSelf: 'center', color: colors.readioWhite, fontFamily: readioRegularFont, fontSize: 13}}>Were loading your experience...</Animated.Text>
                    <ActivityIndicator size="large" color={colors.readioWhite} />
                </Animated.View>
                </>
            )}


            {isEditModalVisible === true && (
              <>
                <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.modalBackground}>

                </Animated.View>
              </>
            )}
  
      <ScrollView
      refreshControl={
        <RefreshControl 
          tintColor={colors.readioWhite} 
          refreshing={refreshing} 
          onRefresh={onRefresh} 
          />
        }
      showsVerticalScrollIndicator={false} style={{height: '100%', backgroundColor: colors.readioOrange}}>


      <SafeAreaView style={[{   alignItems: 'flex-start', backgroundColor: colors.readioOrange}]}>
        
            <FastImage onLoadEnd={() => setImagesLoaded(imagesLoaded + 1)} source={Asset.fromModule(require('@/assets/images/cropwhitelogo.png'))} style={{width: 700, top: '-150%',  position: 'absolute', left: '-5%', height: 1300, opacity: 0.3, alignSelf: "center",  backgroundColor: "transparent"}} resizeMode="cover" />
            <FastImage  onLoadEnd={() => setImagesLoaded(imagesLoaded + 1)} source={Asset.fromModule(require('@/assets/images/cropwhitelogo.png'))}  style={{width: 700, top: '-380%',  position: 'absolute', right: '-120%', height: 1300, opacity: 0.3, alignSelf: "center",  backgroundColor: "transparent"}} resizeMode="cover" />
            <FastImage onLoadEnd={() => setImagesLoaded(imagesLoaded + 1)}  source={Asset.fromModule(require('@/assets/images/cropwhitelogo.png'))}  style={{width: 700, top: '-200%', position: 'absolute', right: '25%', height: 700, opacity: 0.3, alignSelf: "center", backgroundColor: "transparent"}} resizeMode="cover" />
            <FastImage onLoadEnd={() => setImagesLoaded(imagesLoaded + 1)} source={Asset.fromModule(require('@/assets/images/cropwhitelogo.png'))}  style={{width: 700, top: '-100%', position: 'absolute', right: '45%', height: 700, opacity: 0.3, alignSelf: "center", backgroundColor: "transparent"}} resizeMode="cover" />



        <View style={styles.container}>
          
          <Text numberOfLines={1}  allowFontScaling={false} style={[styles.text, {width: '100%', padding: 20,}]}>{user?.name}</Text>
          
          <Animated.View  entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(300)}  style={{marginTop: 10, width: 110, justifyContent: 'center', alignSelf: 'center', height: 110, backgroundColor: colors.readioWhite, borderRadius: 500}}>
            <FastImage onLoadEnd={() => setImagesLoaded(imagesLoaded + 1)} source={Asset.fromModule(require('@/assets/images/cropblacklogo.png'))}  style={{width: 70, height: 70, alignSelf: "center", marginTop: 10, backgroundColor: "transparent"}} resizeMode="cover" />
          </Animated.View>
          
          

        </View>

      </SafeAreaView>
     
      <View style={{zIndex: -1, position: 'absolute', backgroundColor: colors.readioOrange, width: '100%', height: '100%'}}></View>
     
      <View style={{width: '100%', alignSelf: 'flex-end'}}>
        <Pressable onPress={() => setIsEditModalVisible(true)} style={{alignSelf: 'center', margin: 20, padding: 10, borderRadius: 100, backgroundColor: colors.readioWhite, alignItems: 'center'}}>
          <Text style={{color: colors.readioBlack, fontFamily: readioBoldFont, padding: 5}}>Edit Profile</Text>
        </Pressable>
      </View>

      {/* SECTION this is the scrollview that i want to move to the top of the screen as i scroll, covering everything else */}
      <View style={{width: '100%', minHeight: Dimensions.get('window').height, backgroundColor: colors.readioBrown, padding: 20,  borderTopLeftRadius: 30, borderTopRightRadius: 30}}>
        <View style={{display: 'flex', padding: 10, flexDirection: 'column', width: '100%', height: '100%', gap: 15,}}>
            
            <View style={{display: 'flex',}}>
              <Text style={{color: colors.readioWhite, fontFamily: readioBoldFont, fontSize: 20, paddingVertical: 10,}}>@{user?.name}</Text>
            </View>
            
            <View style={{height: 2}}/>
            <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: 10}}>
              
              <View>
                <Text style={{color: colors.readioWhite, textAlign: 'center', fontFamily: readioBoldFont, fontSize: 20}}>{articleLength}</Text>
                <Text style={{color: colors.readioWhite, textAlign: 'center', fontFamily: readioRegularFont, fontSize: 20}}>articles</Text>
              </View>

              <View>
                <Text style={{color: colors.readioWhite, textAlign: 'center', fontFamily: readioBoldFont, fontSize: 20}}>{user?.upvotes}</Text>
                <Text style={{color: colors.readioWhite, textAlign: 'center', fontFamily: readioRegularFont, fontSize: 20}}>upvotes</Text>
              </View>

              <View>
                <Text style={{color: colors.readioWhite, textAlign: 'center', fontFamily: readioBoldFont, fontSize: 20}}>{user?.usersteps}</Text>
                <Text style={{color: colors.readioWhite, textAlign: 'center', fontFamily: readioRegularFont, fontSize: 20}}>steps</Text>
              </View>
            
            </View>

            <View style={{opacity: 0.5, width: '100%', height: 50, borderBottomWidth: 1, borderBottomColor: colors.readioWhite,  justifyContent: 'center', paddingHorizontal: 5}}>
              <Text  allowFontScaling={false} onPress={() => setIsArticleModalVisible(true)} style={{ color: colors.readioWhite, fontSize: 18, fontFamily: readioRegularFont}}>Study</Text>
            </View>

            <View style={{opacity: 0.5, width: '100%', height: 50, borderBottomWidth: 1, borderBottomColor: colors.readioWhite,  justifyContent: 'center', paddingHorizontal: 5}}>
              <Text  allowFontScaling={false} onPress={() => router.push('/(tabs)/(library)/(playlist)/interests')} style={{ color: colors.readioWhite, fontSize: 18, fontFamily: readioRegularFont}}>Your Interests</Text>
            </View>

            <View style={{opacity: 0.5, width: '100%', height: 50, borderBottomWidth: 1, borderBottomColor: colors.readioWhite,  justifyContent: 'center', paddingHorizontal: 5}}>
              <Text  allowFontScaling={false} onPress={() => router.push('/(tabs)/(library)/(playlist)/favorites')} style={{color: colors.readioWhite, fontSize: 18, fontFamily: readioRegularFont}}>Your Favorites</Text>
            </View>

            <View style={{opacity: 0.5, width: '100%', height: 50, borderBottomWidth: 1, borderBottomColor: colors.readioWhite,  justifyContent: 'center', paddingHorizontal: 5}}>
              <Text  allowFontScaling={false} onPress={() => router.push('/(auth)/welcome')} style={{color: colors.readioWhite, fontSize: 18, fontFamily: readioRegularFont}}>Go back to welcome screen</Text>
            </View>
        </View>
      </View>

      </ScrollView>

      {/* SECTION edit profile modal */}
      <Modal
          animationType="slide" 
          transparent={true} 
          visible={isEditModalVisible}
          onRequestClose={handleEditCloseModal}
          style={{width: '100%', height: '95%',  }}
        >
          <SafeAreaView style={{width: '100%', height: '95%', bottom: 0, borderRadius: 40, position: 'absolute', backgroundColor: colors.readioBrown, }}>

            <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={10} style={{padding: 20, borderRadius: 40, backgroundColor: colors.readioBrown,  width: '100%', height: '100%', display: 'flex', justifyContent: "space-between", paddingVertical: "10%"}}>
              
              <View style={{width: '100%', marginBottom: 20, alignItems: 'center', flexDirection: 'row', display: 'flex', justifyContent: 'space-between', backgroundColor: "transparent"}}>
                
                <View>
                  <Text style={{color: colors.readioWhite, fontFamily: readioBoldFont, fontSize: 30}}>Edit profile</Text>
                </View>

                <TouchableOpacity onPress={handleEditCloseModal}>
                  <FontAwesome name="close" size={30} color={colors.readioWhite} />
                </TouchableOpacity>

              </View>

              {/* the actual modal content */}
              <ScrollView>
              
                <View>
                  <Text style={{fontFamily: readioBoldFont, color: colors.readioWhite}}>Name</Text>
                  <InputField 
                      allowFontScaling={false}
                        label=""
                        placeholder={user?.name}
                        placeholderTextColor={'#7a7a7a'}
                        icon={''}
                        value={editForm.name}
                        onChangeText={(text) => setEditForm({ ...editForm, name: text })}
                      />
                </View>
              
               
                <View>
                  <Text style={{fontFamily: readioBoldFont, color: colors.readioWhite}}>Email</Text>
                  <InputField 
                      allowFontScaling={false}
                        label=""
                        placeholder={user?.email}
                        placeholderTextColor={'#7a7a7a'}
                        icon={''}
                        value={editForm.email}
                        onChangeText={(text) => setEditForm({ ...editForm, email: text })}
                      />
                </View>
               
      

                <View>
                  <View style={{display: 'flex', justifyContent: 'space-between', flexDirection: 'row', width: '100%', alignItems: 'center'}}>
                    <Text style={{fontFamily: readioBoldFont, color: colors.readioWhite}}>New Password</Text>
                    <Pressable onPress={() => {setShowPass(!showPass)}} style={{padding: 10, opacity: showPass ? 1 : 0.7, display: 'flex', justifyContent: 'center', alignItems: 'center',}}>
                      <FontAwesome size={15} name={showPass ? 'eye' : 'eye-slash'} color={colors.readioWhite}/>
                    </Pressable>
                  </View>
                  <InputField 
                      allowFontScaling={false}
                        label=""
                        placeholder={showPass ? user?.pass : '*******'}
                        placeholderTextColor={'#7a7a7a'}
                        icon={''}
                        value={editForm.password}
                        onChangeText={(text) => setEditForm({ ...editForm, password: text })}
                      />
                </View>

                <View>
                  <Text style={{fontFamily: readioBoldFont, color: colors.readioWhite}}>Confirm Password</Text>
                  <InputField 
                      allowFontScaling={false}
                        label=""
                        placeholder=""
                        icon={''}
                        value={editForm.confirmPassword}
                        onChangeText={(text) => setEditForm({ ...editForm, confirmPassword: text })}
                      />

                     {doPasswordsMatch === true && (
                        <Text style={{color: 'lime', fontFamily: readioRegularFont, opacity: 0.8}}>Passwords match!</Text>
                      )}
                
                      {doPasswordsMatch === false && editForm?.confirmPassword?.length > 0 && (
                        <Text style={{color: colors.readioWhite, fontFamily: readioRegularFont, opacity: 0.7}}>Passwords do not match</Text>
                      )}
                </View>
               
                
              </ScrollView>

                <Pressable onPress={() => {handleSaveChanges()}} style={{width: '100%', height: 40, alignSelf: 'center', justifyContent: 'center', position: 'absolute', bottom: 60, alignItems: 'center', borderRadius: 15, backgroundColor: colors.readioOrange}}>
                    <View>
                      <Text style={{color: colors.readioWhite, fontFamily: readioBoldFont, fontSize: 18}}>Save Changes</Text>
                    </View>
                </Pressable>
            </KeyboardAvoidingView>

          </SafeAreaView>
      </Modal>

      {/* SECTION create study article modal */}
      <Modal
          animationType="slide" 
          transparent={true} 
          visible={isArticleModalVisible}
          // onRequestClose={handleArticleCloseModal}
          style={{width: '100%', height: '100%' }}
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
            <View style={{width: "100%", minHeight: "600%", zIndex: -3, position: "absolute", backgroundColor: colors.readioBrown }} />   
          <SafeAreaView style={{width: '100%', zIndex: 2, height: '100%', backgroundColor: 'transparent', }}>

            <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={60} style={{padding: 20, backgroundColor: 'transparent',  width: '100%', height: '100%', display: 'flex', justifyContent: "space-between", paddingVertical: "10%"}}>
              
              <View style={{width: '100%', display: 'flex', alignItems: 'flex-end', backgroundColor: "transparent"}}>
                <TouchableOpacity onPress={() => handleArticleCloseModal()}>
                  <FontAwesome name="close" size={30} color={colors.readioWhite} />
                </TouchableOpacity>
              </View>

              {generationStarted === true && (
                <>
                <View onLayout={handleProgressContainerLayout} style={{width: '90%', marginTop: 20, overflow: "hidden", height: 10, backgroundColor: colors.readioOrange, alignSelf: "center", borderRadius: 10}}>                                   
                    <Animated.View style={[animatedStyles, {width: `100%`, zIndex: 20, alignSelf: "flex-start", height: 10, backgroundColor: colors.readioBlack, borderRadius: 0}]}/>                             
                </View>
                <Text style={{color: colors.readioWhite, position: 'absolute', right: 40, top: '22%', zIndex: 200, fontFamily: readioRegularFont, alignSelf: 'flex-end'}}>{progressMessage}</Text>
                </>
              )}

            <View style={{display: 'flex', zIndex: 2, width: '100%', alignSelf: 'center', alignItems: 'center', backgroundColor: "transparent", flexDirection: "column"}}>
              <Animated.View  entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(300)}  style={{marginTop: 10, zIndex: 2, width: 110, justifyContent: 'center', alignSelf: 'center', height: 110, backgroundColor: 'transparent', borderRadius: 500}}>
              <FastImage  source={Asset.fromModule(require('@/assets/images/cropwhitelogo.png'))}  style={{width: 200, height: 200, zIndex: 2,  alignSelf: "center", marginTop: 10, backgroundColor: "transparent"}} resizeMode="cover" />
              </Animated.View>
              <View style={{width: '80%', zIndex: 2}}>
                <Text  allowFontScaling={false} style={styles.heading}>Study</Text>
                <Text  allowFontScaling={false} style={styles.subtext}>Hear anything from your thoughts, to ideas, to even notes in seconds.</Text>
              </View>
              <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: "transparent"}}>
  
              </View>

              <View style={{marginVertical: 10, display: 'flex', flexDirection: 'row', gap: 5}}>
                <Text  allowFontScaling={false} style={{color: colors.readioWhite, opacity: 0.6, textAlign: 'center'}}>Try your own content!</Text>
                <Text  allowFontScaling={false} style={{color: colors.readioWhite, opacity: 0.6, textAlign: 'center'}}>Hear what you want.</Text>
              </View>
              <View style={{justifyContent: 'center', alignItems: 'center'}}>                 
              <InputField 
                value={articleForm.query} 
                onChangeText={(text) => {
                  if (articleGenerationStatus !== 'done') {
                    setArticleForm({...articleForm, query: text});
                    console.log(articleForm.query);
                  }
                }} 
                placeholder="Write your own..." 
                style={{
                  width: '100%', 
                  fontSize: 15, 
                  minHeight: 100, 
                  maxHeight: 100, 
                  padding: 15, 
                  color: colors.readioWhite, 
                  fontFamily: readioRegularFont
                }} 
                label="" 
                multiline
                editable={articleGenerationStatus !== 'done'}
              />
             
              <Pressable 
                onPress={() => (articleGenerationStatus === 'done' ? handleReset() : setWantsToMakeAnArticle(true))} 
                disabled={articleForm?.query?.length < 1}
                 style={{
                  width: '100%', alignSelf: 'center', 
                  backgroundColor: articleForm?.query?.length > 0 ? colors.readioOrange : colors.readioBlack, 
                  opacity: articleForm?.query?.length > 0 ? 1 : 0.4, 
                  borderRadius: 100, alignItems: 'center', display: 'flex', flexDirection: 'row', 
                  justifyContent: 'space-between'
                  }}
                  >
                <Text style={{height: 40, opacity: 0}}>.</Text>
                <Text style={{color: colors.readioWhite, fontSize: 20, fontFamily: readioBoldFont}}>{articleGenerationStatus === "done" ? 'Again?' : 'Generate'}</Text>
                <Text style={{height: 40, opacity: 0}}>.</Text>
              </Pressable>

              </View>
            </View>

            <View style={{height: 150}}/>

            </KeyboardAvoidingView>

          </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    width: '100%',
  },
  modalBackground: {
    justifyContent: "flex-end",
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    width: '100%',
    height: '100%',
    zIndex: 100,
    position: 'absolute',
  },
  gap: {
    marginVertical: 20,
  },
  text: {
    fontSize: 30,
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.readioWhite,
    fontFamily: readioBoldFont
  },
  subtext: {
    fontSize: 15,
    opacity: 0.5,
    textAlign: 'center',
    fontFamily: readioRegularFont,
    color: colors.readioWhite
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
});

