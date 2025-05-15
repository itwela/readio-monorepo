import { ImageAssets } from "@/constants/imageAssets";
import { colors, readioBoldFont, readioRegularFont } from "@/constants/tokens";
import { setStateAsync } from "@/constants/utilityFunctions";
import { useLotusGiantSteps } from "@/helpers/providers/lotusGiantStepsProvider";
import { useLotusModal } from "@/helpers/providers/lotusModalContext";
import { useLotusMeditation } from "@/helpers/providers/lotusMeditationContext";
import { useLotusSettings } from "@/helpers/providers/lotusSettingsProvider";
import { useLotusUser } from "@/helpers/providers/lotusUserContext";
import { useLotusUtils } from "@/helpers/providers/lotusUtilsContext";
import { RootNavigationProp } from "@/types/type";
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ResizeMode } from 'expo-av';
import { VideoView, useVideoPlayer, VideoContentFit } from 'expo-video';
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { default as React, useEffect } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp, FadeOutDown } from "react-native-reanimated";
import { AnnouncementPopup } from "./LotusModals/LotusAnnouncement";
import { LotusDoneModal } from "./LotusModals/LotusDoneModal";
import { IconSymbol } from "./ui/IconSymbol";
import { PremiumBadge } from "./LotusPremiumBadge";
import LotusImageWithLoader from "./LotusImageWithLoader";
import { useLotusHaptic } from "@/helpers/providers/lotusHapticProvider";
import TrackPlayer, { State, useIsPlaying, usePlaybackState } from 'react-native-track-player';
import { useQueue } from "@/store/queue"; // Import useQueue
import { useLastActiveTrack } from "@/hooks/useLastActiveTrack"; // Import useLastActiveTrack
import { generateTracksListId } from "@/helpers/misc"; // Import generateTracksListId

interface LotusHeaderProps {
  backgroundColor: string,
  onSignUpPage?: boolean,
}

  // TODO
  // The header needs to know that we are in demo or not because I need to hide a certain things and add certain functionality to it based on it being in the demo versus the actual web so I'll just add something in the details for like isInDemo or something
export default function LotusHeader({
  backgroundColor,
  onSignUpPage,
}: LotusHeaderProps) {


  const { isArticleGenerating, setIsArticleGenerating, isArticleModalVisible, setIsArticleModalVisible, setArticleGenerationStatus, setWantsToMakeAnArticle, wantsToMakeAnArticle, articleGenerationStatus } = useLotusModal()
  const { user, newlyGeneratedArticle } = useLotusUser()
  const { lightFeedback, mediumFeedback, heavyFeedback } = useLotusHaptic()
  const { setSettingsOpen, settingsOpen } = useLotusSettings()
  const { currentRouteName, signUpBannerIsVisible } = useLotusUtils()
  const { setActiveQueueId } = useQueue(); // Get setActiveQueueId
  const { setLastActiveTrack, clearLastActiveTrack } = useLastActiveTrack(); // Get track functions

  // TODO THIS WILL EVENTUALLY PLAY THE NEWLY MADE ARTICLE AND OPEN THE PLAYER
  const [play, setPlay] = React.useState(true)

  const [currentHeaderText, setCurrentHeaderText] = React.useState<string>('')

  // const [currentVideoUri, setCurrentVideoUri] = React.useState<string>(ImageAssets.brownGradientVid)
  const [currentOpacityValue_Video, setCurrentOpacityValue_Video] = React.useState<number>(0.5)
  const [firstVideoZIndex, setFirstVideoZIndex] = React.useState<number>(-2)
  const [secondVideoZIndex, setSecondVideoZIndex] = React.useState<number>(-3)

  const [currentOpacityValue_BorderBottom, setCurrentOpacityValue_BorderBottom] = React.useState<number>(0)
  const [currentHeightValue_BorderBottom, setCurrentHeightValue_BorderBottom] = React.useState<number>(1)
  const [currentBackgroundColorValue_BorderBottom, setCurrentBackgroundColorValue_BorderBottom] = React.useState<string>(`${colors.readioWhite}`)
  const [stepKey, setStepKey] = React.useState(10)
  const [isArticleDoneNow, setIsArticleDoneNow] = React.useState(false)
  const router = useRouter();

  const [testStateSwitch, setTestStateSwitch] = React.useState(true)

  const {meditationSessionHasStarted, setMeditationSessionHasStarted} = useLotusMeditation()
  const { selection, handleEndWalk } = useLotusGiantSteps()
  const {} = useLotusGiantSteps()

  const navigation = useNavigation<RootNavigationProp>();
  const onEndWalk = () => {
    heavyFeedback();
    handleEndWalk();
  };

  // NOTE How I am consistently chaining many things together to animate layouts:
  /*
  The Challenge:
  In React Native, managing sequential state updates and animations is complex due to the lack of a DOM. Unlike web applications, we can't rely on DOM mutations to track changes.

  The Solution:
  I've implemented a Promise-based state management approach that:
  1. Ensures predictable order of state updates
  2. Provides guaranteed completion of each step
  3. Maintains readable and maintainable code

  Key Benefits:
  - Synchronous-like behavior using async/await
  - Guaranteed order of visual updates
  - Better control over animation sequences
  - Simplified debugging and state tracking

  Implementation:
  Using setStateAsync wrapper, each state update returns a Promise, allowing us to:
  1. Chain state updates sequentially
  2. Wait for each update to complete
  3. Handle complex animation sequences reliably
  */
  useEffect(() => {

    const handleDynamicStyleValues = async () => {

      if (isArticleGenerating === true) {
        setStepKey(20)
        await setStateAsync(setCurrentHeaderText, "Your article is on the way!", 'affectsSomethingVisual')
        await setStateAsync(setCurrentBackgroundColorValue_BorderBottom, '#DB581A', 'affectsSomethingVisual')
        await setStateAsync(setCurrentHeightValue_BorderBottom, 5, 'affectsSomethingVisual')
        await setStateAsync(setCurrentOpacityValue_BorderBottom, 1, 'affectsSomethingVisual')
        await setStateAsync(setCurrentOpacityValue_Video, 1, 'affectsSomethingVisual')

        return
      }

      if (articleGenerationStatus === 'done') {
        setStepKey(30)

        await setStateAsync(setCurrentHeaderText, "Done! Tap to play!", 'affectsSomethingVisual')
        await setStateAsync(setCurrentOpacityValue_BorderBottom, 1, 'affectsSomethingVisual')
        await setStateAsync(setCurrentBackgroundColorValue_BorderBottom, '#DB581A', 'affectsSomethingVisual')
        await setStateAsync(setCurrentHeightValue_BorderBottom, 5, 'affectsSomethingVisual')
        await setStateAsync(setIsArticleDoneNow, true, 'affectsSomethingVisual')

        return
      } 
      
    }

    handleDynamicStyleValues()

  }, [isArticleGenerating, articleGenerationStatus])

  useEffect(() => {
    const handleRestHeader = async () => {
      if (isArticleDoneNow === true) {
        
        // Set a timeout to reset header after 1 minute
        setTimeout(async () => {
          await setStateAsync(setCurrentHeaderText, "Lotus", 'affectsSomethingVisual')
          // await setStateAsync(setCurrentVideoUri, '', 'affectsSomethingVisual')
          await setStateAsync(setCurrentOpacityValue_BorderBottom, 0, 'affectsSomethingVisual')
          await setStateAsync(setCurrentHeightValue_BorderBottom, 1, 'affectsSomethingVisual')
          await setStateAsync(setCurrentBackgroundColorValue_BorderBottom, '#E9E0C1', 'affectsSomethingVisual')

          await setStateAsync(setIsArticleDoneNow, false, 'affectsSomethingVisual')
          await setStateAsync(setArticleGenerationStatus, '', 'affectsSomethingVisual')
  
        }, 60000) // 60000ms = 1 minute
      }
    }

    handleRestHeader()

  }, [isArticleDoneNow])

  const handleGoHome = async () => {
    
    mediumFeedback();

    if (onSignUpPage === true) {
      router.navigate('/(auth)/welcome')
    }

    if (onSignUpPage === false) {
      router.navigate("/(tabs)/(home)/home")
    }

  }

  // Function to play the newly generated article
  const playNewlyGeneratedArticle = async () => {
   
    if (!newlyGeneratedArticle || !newlyGeneratedArticle || newlyGeneratedArticle.length === 0) {
      console.log("No newly generated article or chapters found to play.");
      // Optionally show an alert to the user
      return;
    }

    mediumFeedback();
    console.log("Attempting to play newly generated article:", newlyGeneratedArticle.name);

    try {
      const queueId = generateTracksListId('songs', newlyGeneratedArticle.id);
      console.log("Generated queue ID for new article:", queueId);

      console.log("Resetting track player for new article");
      await TrackPlayer.reset();
      await clearLastActiveTrack();

      console.log("Adding new article chapters to track player:", newlyGeneratedArticle);
      await TrackPlayer.add(newlyGeneratedArticle);

      console.log("Starting playback for new article");
      await TrackPlayer.play();

      console.log("Updating queue ID for new article:", queueId);
      setActiveQueueId(queueId);

      console.log("Setting current item ID for new article:", newlyGeneratedArticle.id);
      // We might not need a specific state for the *header* knowing the ID,
      // but the queue and last track are important.

      console.log("Setting last active track for new article:", newlyGeneratedArticle[0]);
      setLastActiveTrack?.(newlyGeneratedArticle[0]);

    } catch (error) {
      console.error("Error playing newly generated article:", error);
      // Optionally show an alert to the user
    }

  }

  const handlePress = async () => {
    articleGenerationStatus === 'done' ? playNewlyGeneratedArticle() : await handleGoHome()
  }

  const handleShowProfileAndSettings = async () => {
    mediumFeedback();
    // navigation.navigate('profileAndSettings');
    router.navigate('/profileAndSettings');
  }

  const headerVideoPlayer = useVideoPlayer(ImageAssets.lotusPondVid, player => {
    player.muted = true;
    player.loop = true;
    player.play();
    player.staysActiveInBackground = false;
  });

  return (
    <>
        <View style={{ 
          display: selection === 'Walking' ? 'none' : "flex", 
          backgroundColor: currentRouteName === "giant" && settingsOpen === false ? 'transparent' : meditationSessionHasStarted === true && currentRouteName === 'meditation' ? 'transparent' : currentRouteName === '(home)' ? 'transparent' : onSignUpPage === true ? 'transparent' : backgroundColor, 
          height: selection === 'Walking' ? 120 : 110,
          width: "100%",
          position: 'relative',
          paddingBottom: 15,
        }}>

          {/* NOTE Video layer - only rendered if there's a video source */}
            <Animated.View 
              key={stepKey}
              entering={FadeInUp.duration(300)}
              exiting={FadeOutDown.duration(300)}
              style={{ position: 'absolute', width: '100%', height: '100%', display: meditationSessionHasStarted ? 'none' : 'flex' }}
            >

            <View style={{position: 'relative', overflow: 'hidden', width: '100%', height: '100%', display: 'flex', flexDirection: 'column'}}>  
              
              {/* Video using expo-video */}
                <VideoView
                  player={headerVideoPlayer}
                  style={{ 
                    width: '100%', height: '100%',
                    position: 'absolute',
                    top: 0,
                    opacity: currentRouteName === 'giant' ? 0 : 
                             currentRouteName === '(home)' ? 0 : 
                             onSignUpPage === true ? 0 : 
                             currentOpacityValue_Video,
                    zIndex: -2,
                    backgroundColor: colors.readioBrown,
                  }}
                  contentFit={'cover'}
                />
          

            <LinearGradient
                colors={[
                  // colors.readioBrown,
                  'rgba(45, 28, 22, 0)',
                  'rgba(45, 28, 22, 0)',
                  'rgba(45, 28, 22, 0)',
                  colors.readioBrown,
                ]}
                locations={[0, 0.25, 0.2, 1]}
                start={{ x: 0.5, y: 0.1 }}
                end={{ x: 0.5, y: 1 }}
                style={{
                  width: '100%',
                  height: '80%',
                  position: 'absolute',
                  bottom: 0,
                  opacity: currentRouteName === 'giant' ? 0 : currentRouteName === '(home)' ? 0 : onSignUpPage ? 0 : 1,
                  zIndex: 1,
                }}
              />

            </View>

            

            {/* Border */}
            <View style={{
              position: 'absolute', 
              width: '100%', 
              height: currentHeightValue_BorderBottom, 
              backgroundColor: currentBackgroundColorValue_BorderBottom,
              opacity: currentRouteName === 'giant' ? 0 : 
                       meditationSessionHasStarted === true && currentRouteName === 'meditation' ? 0 : 
                       currentRouteName === '(home)' ? 0 : 
                       currentOpacityValue_BorderBottom,
              bottom: 0,
              zIndex: 2,
            }}/>

            </Animated.View>
          {/* Gradient overlay - always present but opacity controlled by state */}
        


          {/* Content layer - consistent structure */}
          <Animated.View 
            entering={FadeInUp.duration(300)}
            exiting={FadeOutDown.duration(300)}
            style={{ 
              flex: 1,
              justifyContent: 'flex-end',
              paddingHorizontal: 20,
              paddingBottom: 10,
            }}
          >
            <View 
              style={{flexDirection: 'row', gap: 10, alignItems: 'center', width: '100%', justifyContent: 'space-between',}}
            >

              <Pressable onPress={handlePress} style={{ backgroundColor: 'transparent', flexDirection: 'row', width: '75%', gap: 10, alignItems: 'center',}}>

                  {/* Icon/Logo section */}
                  {isArticleGenerating ? (
                    <ActivityIndicator color={colors.readioWhite}/>
                  ) : articleGenerationStatus === 'done' ? (
                    <FontAwesome name={play ? 'play' : 'pause'} size={20} color={colors.readioWhite}/>
                  ) : (
                    <LotusImageWithLoader
                      useSpinnerLoader
                      loaderSize="small"
                      source={ImageAssets.whiteLogo}
                      style={{ width: 30, height: 30 }}
                      resizeMode='contain'
                    />
                  )}

                  {/* Text section */}
                  <Text allowFontScaling={false} style={{ 
                    color: colors.readioWhite, 
                    opacity: 0.91, 
                    fontSize: 18, 
                    fontWeight: "bold"
                  }}>
                    {currentHeaderText}
                  </Text>
                  

              </Pressable>

              <View style={{backgroundColor: 'transparent',  display: onSignUpPage ? 'none' : 'flex', flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'flex-end'}}>
                {signUpBannerIsVisible === false && (
                  <>

                      {/* <Pressable
                        onPress={() => {
                          testHeaderStates()
                        }}
                      >
                        <View style={{backgroundColor: 'transparent', position: 'absolute', alignSelf:'center', top: 0, padding: 5, alignContent: 'center', alignItems: 'center'}}>
                              <IconSymbol
                              name="bell.fill"
                              color={colors.readioWhite}
                              size={24}
                            />
                        </View>
                      </Pressable> */}

                    {/* TODO HOME + UPDATE ALL CONDITIONS CORRECTLY */}
                    <Pressable onPress={() => {handleGoHome()}} style={{backgroundColor: 'transparent', flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'flex-end'}}>
                        <View style={{backgroundColor: 'transparent', padding: 5, alignContent: 'center', alignItems: 'center'}}>
                              <IconSymbol 
                              name="house.fill"
                              color={currentRouteName === '(home)' ? colors.readioOrange : colors.readioWhite}
                              size={24}
                            />
                        </View>
                    </Pressable>

                    {/* TODO PROFILE + SETTINGS WILL GO BACK TO BEING A ROUTE AGAIN + UPDATE ALL CONDITIONS CORRECTLY */}
                    <Pressable onPress={() => {handleShowProfileAndSettings()}} style={{backgroundColor: 'transparent', flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'flex-end'}}>
                        <View style={{backgroundColor: 'transparent', padding: 5, alignContent: 'center', alignItems: 'center'}}>
                              <IconSymbol 
                              name="person.fill"
                              color={currentRouteName === 'profileAndSettings' ? colors.readioOrange : colors.readioWhite}
                              size={24}
                              style={{transform: [{scale: 0.9}]}}
                            />
                        </View>
                    </Pressable>
              
                  </>
                )}
               </View>


            </View>

          </Animated.View>


        </View>
        
        <View style={{ 
          display: selection !== 'Walking' ? 'none' : "flex", 
          width: '100%',  height: selection !== 'Walking' ? 120 : 110, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
          backgroundColor: currentRouteName === 'giant' ? 'transparent' : colors.readioOrange,
          paddingHorizontal: 20,
          paddingBottom: 15,
          }}>
            <Text allowFontScaling={false} style={styles.stat}>Currently {selection}</Text>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={onEndWalk}
              style={{
                backgroundColor: currentRouteName === 'giant' ? colors.readioOrange : colors.readioBlack,
                width: 100,
                paddingHorizontal: 10,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 10,
              }}
            >
              <Text allowFontScaling={false} style={[styles.link, { marginTop: 10 }]}>End Walk</Text>
            </TouchableOpacity>
        </View> 

        {/* Modals */}
        <LotusDoneModal/>
      <AnnouncementPopup/>
    </>
  )
}

const styles = StyleSheet.create({
  safeAreaContainer: {
  },
  searchBar: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 20,
  },
  container: {
    padding: 20,
  },
  text: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.readioWhite,
    textAlign: 'center'
  },
  link: {
    color: colors.readioDustyWhite,
    marginBottom: 10,
    fontFamily: readioRegularFont
  },
  blackStat: {
    color: colors.readioWhite,
    fontSize: 56,
    marginVertical: 5,
    fontFamily: readioBoldFont
  },
  stat: {
    color: colors.readioWhite,
    fontSize: 16,
    marginVertical: 5,
    fontFamily: readioRegularFont,
  },
  timeStat: {
    color: colors.readioWhite,
    fontSize: 100,
    marginVertical: 5,
    fontFamily: readioRegularFont,
  },
  error: {
    color: 'red',
    fontSize: 16,
    marginVertical: 10,
  },
  cancel: {
    color: colors.readioWhite,
    fontFamily: readioRegularFont,
  },
  cancelButton: {
    backgroundColor: colors.readioOrange,
    borderRadius: 5,
    padding: 5,
  }
});

