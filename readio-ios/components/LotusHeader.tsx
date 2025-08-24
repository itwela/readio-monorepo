import { getLocalImageUri, ImageAssets } from "@/constants/imageAssets";
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
import LotusImageWithLoader from "./LotusImageWithLoader";
import { useLotusHaptic } from "@/helpers/providers/lotusHapticProvider";
import TrackPlayer, { State, useIsPlaying, usePlaybackState } from 'react-native-track-player';
import { useQueue } from "@/store/queue"; // Import useQueue
import { useLastActiveTrack } from "@/hooks/useLastActiveTrack"; // Import useLastActiveTrack
import { generateTracksListId } from "@/helpers/misc"; // Import generateTracksListId
import { useLotusCreateArticle } from "@/helpers/providers/lotusCreateArticleProvider";

interface LotusHeaderProps {
  backgroundColor: string,
  onSignUpPage?: boolean,
}

// TODO
// On the giant page i need to jsut have a back button on the header and no lotus and icon :D
export default function LotusHeader({
  backgroundColor,
  onSignUpPage,
}: LotusHeaderProps) {

  // 🎯 SIMPLIFIED: Use the proper create article provider
  const { articleGenerationStatus, setArticleGenerationStatus } = useLotusCreateArticle()
  const { isArticleModalVisible, setIsArticleModalVisible, setWantsToMakeAnArticle, wantsToMakeAnArticle } = useLotusModal()
  const { user, newlyGeneratedArticle } = useLotusUser()
  const { lightFeedback, mediumFeedback, heavyFeedback } = useLotusHaptic()
  const { setSettingsOpen, settingsOpen } = useLotusSettings()
  const { currentRouteName, signUpBannerIsVisible } = useLotusUtils()
  const { setActiveQueueId } = useQueue(); // Get setActiveQueueId
  const { setLastActiveTrack, clearLastActiveTrack } = useLastActiveTrack(); // Get track functions

  // 🎯 SIMPLIFIED STATE - Only what we actually need
  const [headerText, setHeaderText] = React.useState<string>('Lotus')
  const [showProcessingState, setShowProcessingState] = React.useState(false)
  const [play, setPlay] = React.useState(true)

  const router = useRouter();

  const { meditationSessionHasStarted, setMeditationSessionHasStarted } = useLotusMeditation()
  const { selection, handleEndWalk } = useLotusGiantSteps()
  const { } = useLotusGiantSteps()

  const navigation = useNavigation<RootNavigationProp>();
  const onEndWalk = () => {
    heavyFeedback();
    handleEndWalk();
  };

  // 🎯 SIMPLIFIED HEADER STATE MANAGEMENT
  useEffect(() => {
    if (articleGenerationStatus === 'generating') {
      setHeaderText("Your article is on the way!")
      setShowProcessingState(true)
      return
    }

    if (articleGenerationStatus === 'done') {
      setHeaderText("Done! Check your Library!")
      setShowProcessingState(false)

      // Auto-reset after 60 seconds
      setTimeout(() => {
        setHeaderText("Lotus")
        setArticleGenerationStatus('idle')
      }, 60000)
      return
    }

    if (articleGenerationStatus === 'error') {
      setHeaderText("Please try again")
      setShowProcessingState(false)

      // Auto-reset after 10 seconds
      setTimeout(() => {
        setHeaderText("Lotus")
        setArticleGenerationStatus('idle')
      }, 10000)
      return
    }

    if (articleGenerationStatus === 'limitReached') {
      setHeaderText("Limit reached - Please upgrade")
      setShowProcessingState(false)

      // Auto-reset after 15 seconds
      setTimeout(() => {
        setHeaderText("Lotus")
        setArticleGenerationStatus('idle')
      }, 15000)
      return
    }

    // Default state (idle, submitted, etc.)
    setHeaderText("Lotus")
    setShowProcessingState(false)

  }, [articleGenerationStatus])

  const handleGoHomeFromSignUp = async () => {

    router.navigate('/(auth)/welcome')
    lightFeedback();


  }

  const handleGoHome = async () => {

    router.navigate("/(tabs)/(home)/home")
    lightFeedback();

  }

  // Function to play the newly generated article
  const playNewlyGeneratedArticle = async () => {

    if (!newlyGeneratedArticle || !newlyGeneratedArticle || newlyGeneratedArticle.length === 0) {
      console.log("No newly generated article found to play.");
      return;
    }

    mediumFeedback();
    console.log("Attempting to access newly generated article:", newlyGeneratedArticle[0]?.title);

    try {
      const article = newlyGeneratedArticle[0];

      // Check if article has audio URL
      if (!article.url || article.url === '') {
        console.log("Article created but audio not yet generated. Navigating to library instead.");
        // Navigate to library where they can see their new article
        router.navigate('/(tabs)/(library)/lib');
        return;
      }

      // If we have audio, proceed with playback
      const queueId = generateTracksListId('songs', article.id);
      console.log("Generated queue ID for new article:", queueId);

      console.log("Resetting track player for new article");
      await TrackPlayer.reset();
      await clearLastActiveTrack();

      console.log("Adding new article to track player:", article.title);
      await TrackPlayer.add(newlyGeneratedArticle);

      console.log("Starting playback for new article");
      await TrackPlayer.play();

      console.log("Updating queue ID for new article:", queueId);
      setActiveQueueId(queueId);

      console.log("Setting last active track for new article:", article.title);
      setLastActiveTrack?.(article);

    } catch (error) {
      console.error("Error playing newly generated article:", error);
      // Fallback: navigate to library
      router.navigate('/(tabs)/(library)/lib');
    }

  }

  const handlePress = async () => {
    // Check user state and redirect accordingly
    if (!user) {
      // If no user, take them to welcome
      router.navigate('/(auth)/welcome');
    }
    else if (currentRouteName === 'giant' || currentRouteName === 'timer' || currentRouteName === 'mytimers') {
      router.navigate('/(tabs)/(gym)/gym');
    }
    else {
      // If user exists, proceed with existing logic
      articleGenerationStatus === 'done' ? playNewlyGeneratedArticle() : await handleGoHome();
    }
  }

  const handleShowProfileAndSettings = async () => {
    router.navigate('/profileAndSettings');
    lightFeedback();
    // navigation.navigate('profileAndSettings');
  }

  // const headerVideoPlayer = useVideoPlayer(ImageAssets.lotusPondVid, player => {
  //   player.muted = true;
  //   player.loop = true;
  //   player.play();
  //   player.staysActiveInBackground = false;
  //   player.allowsExternalPlayback = false;
  // });

  return (
    <>
      <View style={{
        display: selection === 'Walking' ? 'none' : "flex",
        backgroundColor: currentRouteName === "giant"  && settingsOpen === false ? 'transparent' : meditationSessionHasStarted === true && currentRouteName === 'meditation' ? 'transparent' : currentRouteName === '(home)' ? 'transparent' : onSignUpPage === true ? 'transparent' : backgroundColor,
        height: selection === 'Walking' ? 120 : 110,
        width: "100%",
        position: 'relative',
        paddingBottom: 15,
      }}>

        {/* NOTE Video layer - only rendered if there's a video source */}
        <Animated.View
          entering={FadeInUp.duration(300)}
          exiting={FadeOutDown.duration(300)}
          style={{ position: 'absolute', width: '100%', height: '100%', display: meditationSessionHasStarted ? 'none' : 'flex' }}
        >

          <View style={{ position: 'relative', overflow: 'hidden', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>

            {/* NOTE - GIF using LotusImageWithLoader */}
            <LotusImageWithLoader
              source={{
                uri: getLocalImageUri('lotusPondGif'),
              }}
              style={{
                width: '100%', height: '100%',
                position: 'absolute',
                top: 0,
                opacity: currentRouteName === 'giant' ? 0 :
                  currentRouteName === '(home)' ? 0 :
                    onSignUpPage === true ? 0 :
                      showProcessingState ? 0.8 : 0.8,
                zIndex: -2,
                backgroundColor: colors.readioBrown,
              }}
              resizeMode="cover"
            />

            <LinearGradient
              colors={[
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

          {/* 🎯 SIMPLIFIED: Only show border when processing */}
          {showProcessingState && (
            <View style={{
              position: 'absolute',
              width: '100%',
              height: 4,
              backgroundColor: colors.readioOrange,
              bottom: 0,
              zIndex: 2,
            }} />
          )}

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
            style={{ flexDirection: 'row', gap: 10, alignItems: 'center', width: '100%', justifyContent: 'space-between', }}
          >

            <Pressable onPress={handlePress} style={{ backgroundColor: 'transparent', flexDirection: 'row', width: '75%', gap: 10, alignItems: 'center', }}>

              {currentRouteName === 'timer' && (
                <>
                  {/* add a BACK BUTTON */}
                  <TouchableOpacity style={styles.back} onPress={handlePress}>
                    <FontAwesome color={colors.readioWhite} size={20} name='chevron-left' />
                  </TouchableOpacity>
                </>
              )}
  
              {currentRouteName === 'giant' && (
                <>
                  {/* add a BACK BUTTON */}
                  <TouchableOpacity style={styles.back} onPress={handlePress}>
                    <FontAwesome color={colors.readioWhite} size={20} name='chevron-left' />
                  </TouchableOpacity>
                </>
              )}

              {currentRouteName === 'mytimers' && (
                <>
                  {/* add a BACK BUTTON */}
                  <TouchableOpacity style={styles.back} onPress={handlePress}>
                    <FontAwesome color={colors.readioWhite} size={20} name='chevron-left' />
                  </TouchableOpacity>
                </>
              )}

              {currentRouteName !== 'timer' && currentRouteName !== 'giant' && currentRouteName !== 'mytimers' && (
                <>
                  {/* NOTE - Icon/Logo section */}
                  {showProcessingState ? (
                    <ActivityIndicator color={colors.readioWhite} />
                  ) : (
                    <LotusImageWithLoader
                      useSpinnerLoader
                      loaderSize="small"
                      source={ImageAssets.whiteLogo}
                      style={{ width: 30, height: 30 }}
                      resizeMode='contain'
                    />
                  )}
                </>
              )}


              {/* Text section */}
              <Text allowFontScaling={false} style={{
                color: colors.readioWhite,
                opacity: 0.91,
                fontSize: 18,
                fontWeight: "bold"
              }}>
                {currentRouteName === 'giant' || currentRouteName === 'timer' || currentRouteName === 'mytimers' ? 'Gym' : headerText}
              </Text>


            </Pressable>

            <View style={{ backgroundColor: 'transparent', display: onSignUpPage ? 'none' : 'flex', flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'flex-end', paddingHorizontal: 5 }}>
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
                  {onSignUpPage === false ? (
                    <Pressable onPress={() => { handleGoHome() }} style={{ backgroundColor: 'transparent', flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'flex-end' }}>
                      <View style={{ backgroundColor: 'transparent', padding: 2, alignContent: 'center', alignItems: 'center' }}>
                        <IconSymbol
                          name="house.fill"
                          color={currentRouteName === '(home)' ? colors.readioOrange : colors.readioWhite}
                          size={24}
                        />
                      </View>
                    </Pressable>
                  ) : (
                    <Pressable onPress={() => { handleGoHomeFromSignUp(); }} style={{ backgroundColor: 'transparent', flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'flex-end' }}>
                      <View style={{ backgroundColor: 'transparent', padding: 2, alignContent: 'center', alignItems: 'center' }}>
                        <IconSymbol
                          name="person.fill"
                          color={currentRouteName === 'profileAndSettings' ? colors.readioOrange : colors.readioWhite}
                          size={24}
                          style={{ transform: [{ scale: 0.9 }] }}
                        />
                      </View>
                    </Pressable>
                  )}

                  <Pressable onPress={() => { handleShowProfileAndSettings(); }} style={{ backgroundColor: 'transparent', flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'flex-end' }}>
                    <View style={{ backgroundColor: 'transparent', padding: 2, alignContent: 'center', alignItems: 'center' }}>
                      <IconSymbol
                        name="person.fill"
                        color={currentRouteName === 'profileAndSettings' ? colors.readioOrange : colors.readioWhite}
                        size={24}
                        style={{ transform: [{ scale: 0.9 }] }}
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
        width: '100%', height: selection !== 'Walking' ? 120 : 110, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
        backgroundColor: currentRouteName === 'giant' || currentRouteName === 'timer' ? 'transparent' : colors.readioOrange,
        paddingHorizontal: 20,
        paddingBottom: 15,
      }}>
        <Text allowFontScaling={false} style={styles.stat}>Currently {selection}</Text>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onEndWalk}
          style={{
            backgroundColor: currentRouteName === 'giant' || currentRouteName === 'timer' ? colors.readioOrange : colors.readioBlack,
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
      <LotusDoneModal />
      <AnnouncementPopup />
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
  back: {
    opacity: 0.5
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

