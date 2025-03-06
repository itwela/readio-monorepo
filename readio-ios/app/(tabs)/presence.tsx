import LotusHeader from "@/components/LotusHeader";
import { colors, readioBoldFont, utilStyle } from "@/constants/tokens";
import React, { useEffect } from "react";
import { View, StyleSheet, FlatList, Pressable, Text, Modal, ScrollView, Dimensions } from "react-native";
import Animated, { FadeInDown, FadeInUp, FadeOutDown } from "react-native-reanimated";
import { ResizeMode, Video } from 'expo-av';
import { getLocalImageUri, ImageAssets } from "@/constants/imageAssets";
import { LinearGradient } from 'expo-linear-gradient';
import { useLotusPresence } from "@/helpers/providers/lotusPresenceContext";
import { utilsStyles } from "@/styles";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from 'expo-blur';
import { LotusArticleModal } from "@/components/LotusArticleModal";
import { Picker } from '@react-native-picker/picker';
import TrackPlayer, { useIsPlaying } from "react-native-track-player";
import { generateTracksListId } from "@/helpers/misc";
import { SoundAssets } from "@/constants/soundAssets";
import { useQueue } from "@/store/queue";
import { useLastActiveTrack } from "@/hooks/useLastActiveTrack";

export default function LotusPresencePage() {

  const [selectedModal, setSelectedModal] = React.useState<'music' | 'duration' | 'topics' | null>(null);
  const [selectedDuration, setSelectedDuration] = React.useState(5);
  const [selectedIntro, setSelectedIntro] = React.useState<any>();
  const [readyToStartSession, setReadyToStartSession] = React.useState(false);
  const { activeQueueId, setActiveQueueId } = useQueue();
  const { lastActiveTrack, clearLastActiveTrack, setLastActiveTrack } = useLastActiveTrack();

  const {playing} = useIsPlaying()
  const [welcomeIsPlaying, setWelcomeIsPlaying] = React.useState(true);
  const [howToMeditateIsPlaying, setHowToMeditateIsPlaying] = React.useState(false);

  const intros = [
    { 
      id: 'intros1', 
      title: 'INNER PEACE',
      url: SoundAssets.presenceIntroInnerPeace,
      image: ImageAssets.lotusFlowerPondVidDark,
      topic: 'Presence',
      artist: 'Readio'
    },
    { 
      id: 'intros2', 
      title: 'ALWAYS AWARE',
      url: SoundAssets.presenceIntroAlwaysAware,
      image: ImageAssets.lotusFlowerPondVidDark,
      topic: 'Presence',
      artist: 'Readio'
    },
    { 
      id: 'intros3', 
      title: 'ONE PATH',
      url: SoundAssets.presenceIntroOnePath,
      image: ImageAssets.lotusFlowerPondVidDark,
      topic: 'Presence',
      artist: 'Readio'
    },
    { 
      id: 'intros4', 
      title: 'INSTILLING STILLNESS',
      url: SoundAssets.presenceIntroInstillingStillness,
      image: ImageAssets.lotusFlowerPondVidDark,
      topic: 'Presence',
      artist: 'Readio'
    },
    { 
      id: 'intros5', 
      title: 'SHIFTS',
      url: SoundAssets.presenceIntroShifts,
      image: ImageAssets.lotusFlowerPondVidDark,
      topic: 'Presence',
      artist: 'Readio'
    }
  ];

  const welcomeData = [
    {
      id: 'welcome1',
      title: 'Welcome',
      url: SoundAssets.presenceWelcome,
      image: getLocalImageUri('presenceIcon'),
      topic: 'Presence',
      artist: 'Readio'
    },
  ];

  const howToMeditateData = [
    {
      id: 'howtomeditate1',
      title: 'How To Meditate',
      url: SoundAssets.presenceHowToMeditate,
      image: ImageAssets.whiteLogo,
      topic: 'Presence',
      artist: 'Readio'
    },
  ];

  // Add modal container component
  const PresenceModal = () => {

    const presenceModalStyles = {
      modalBackdrop: {
        flex: 1,
        justifyContent: 'center',
      },
      modalContent: {
        backgroundColor: 'rgba(45, 28, 22, 0.9)',
        borderRadius: 20,
        padding: 20,
        position: 'absolute',
        alignSelf: 'center',
        height: '60%',
        width: '100%',
        bottom: 0,

      },
      modalTitle: {
        fontSize: 24,
        fontFamily: readioBoldFont,
        color: colors.readioWhite,
        marginBottom: 20,
      },
      modalItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
      },
      modalItemText: {
        color: colors.readioWhite,
        fontSize: 16,
      },
      modalItemSubtext: {
        color: colors.readioOrange,
        fontSize: 12,
      },
      durationContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
      },
      durationPill: {
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
      },
      durationText: {
        color: colors.readioWhite,
      },
      closeButton: {
        position: 'absolute',
        top: 15,
        right: 15,
        padding: 5,
      },
      
    }

    const durations = [5, 10, 15, 30, 45, 60];
    const scrollViewRef = React.useRef(null);
    const { height: modalHeight } = Dimensions.get('window');
    const contentHeight = modalHeight * 0.6 - 0;

    const handleSelectIntro = (intro: string) => {
      setSelectedIntro(intro);
      setSelectedModal(null);
    }

    return (
      <>
      <Modal
        visible={!!selectedModal}
        transparent
        animationType="slide"
      >
        <BlurView intensity={5} style={presenceModalStyles.modalBackdrop as any}>
          <Animated.View entering={FadeInUp.duration(300)} style={presenceModalStyles.modalContent as any}>
            

            {/* Duration Modal */}
            {selectedModal === 'duration' && (
              <>
                <Text style={presenceModalStyles.modalTitle}>Set Duration</Text>
                <View style={{
                  height: contentHeight,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Picker
                    ref={scrollViewRef}
                    selectedValue={selectedDuration}
                    onValueChange={(itemValue) => {
                      setSelectedDuration(itemValue);
                      setSelectedModal(null);
                      console.log('value', itemValue)
                    }}
                    style={{
                      width: 300,
                      height: 300,
                      backgroundColor: 'transparent',
                    }}
                    itemStyle={{
                      fontSize: 40,
                      fontFamily: readioBoldFont,
                      color: colors.readioWhite,
                      height: 160,
                      textAlign: 'center',
                      borderRadius: 10,
                    }}
                  >
                    {durations.map((mins: number, index: number) => (
                      <Picker.Item
                        key={index}
                        label={`${mins} mins`}
                        value={mins}
                        color={colors.readioWhite} />
                    ))}
                  </Picker>
                </View>
              </>
            )}

            {/* intros Modal */}
            {selectedModal === 'topics' && (
              <>
                <Text style={presenceModalStyles.modalTitle}>Choose Intro</Text>
                {intros.map((intro: any) => (
                  <Pressable onPress={() => handleSelectIntro(intro)} key={intro.id} style={presenceModalStyles.modalItem}>
                    <Text style={presenceModalStyles.modalItemSubtext}>{intro.id}.</Text>
                    <Text style={[presenceModalStyles.modalItemText, {fontFamily: readioBoldFont}]}>{intro.title}</Text>
                  </Pressable>
                ))}
              </>
            )}

            <Pressable
              style={presenceModalStyles.closeButton as any}
              onPress={() => setSelectedModal(null)}
            >
              <MaterialCommunityIcons name="close" size={24} color={colors.readioWhite} />
            </Pressable>

          </Animated.View>
        </BlurView>
      </Modal>
      </>
    )
  }

  const PresenceOptions = () => {

      const MusicButton = () => {
        const [isMusicEnabled, setIsMusicEnabled] = React.useState(true);
      
        return (
          <View style={{ borderRadius: 100 }}>
            <Pressable
              onPress={() => setIsMusicEnabled(prev => !prev)}
              style={[
                optionStyles.optionButton,
                { backgroundColor: colors.readioBlack }
              ]}
              android_ripple={{ color: colors.readioBrown }}
            >
              <Text allowFontScaling={false} style={optionStyles.optionText}>{isMusicEnabled ? 'Music on' : 'Silence'}</Text>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.readioBlack,
                borderRadius: 20,
                padding: 4,
                width: 100,
                height: 36,
                position: 'relative',
              }}>
                <View style={{
                  position: 'absolute',
                  backgroundColor: colors.readioOrange,
                  width: '55%',
                  height: '100%',
                  borderRadius: 16,
                  left: isMusicEnabled ? '50%' : 0,
                }} />
                <MaterialCommunityIcons
                  name="music-off"
                  size={20}
                  color={!isMusicEnabled ? colors.readioWhite : 'rgba(255,255,255,0.5)'}
                  style={{ flex: 1, textAlign: 'center' }}
                />
                <MaterialCommunityIcons
                  name="music"
                  size={20}
                  color={isMusicEnabled ? colors.readioWhite : 'rgba(255,255,255,0.5)'}
                  style={{ flex: 1, textAlign: 'center' }}
                />
              </View>
            </Pressable>
          </View>
        )
      };

      const DurationButton = () => (
        <View>
          <Pressable
            onPress={() => setSelectedModal('duration')}
            style={[
              optionStyles.optionButton, 
              { backgroundColor: colors.readioBlack }
            ]}
            android_ripple={{ color: colors.readioBrown }}
          >
            <Text allowFontScaling={false} style={optionStyles.optionText}>Duration</Text>
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3}}>
              <Text allowFontScaling={false} style={[optionStyles.optionText, {color: colors.readioOrange}]}>{selectedDuration} mins</Text>
              <MaterialCommunityIcons 
                name="timer-outline" 
                size={28} 
                color={colors.readioOrange} 
                style={optionStyles.icon}
              />
            </View>
          </Pressable>
        </View>
      );

      const TopicsButton = () => {

        return (
        <View>
          <Pressable
            onPress={() => setSelectedModal('topics')}
            style={[
              optionStyles.optionButton, 
              { backgroundColor: colors.readioBlack }
            ]}
            android_ripple={{ color: colors.readioBrown }}
          >
            <Text allowFontScaling={false} style={optionStyles.optionText}>Intro</Text>
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3}}>
              <Text allowFontScaling={false} style={[optionStyles.optionText, {color: selectedIntro ? colors.readioOrange : colors.readioWhite}]}>{!selectedIntro ? "Select" : selectedIntro?.title}</Text>
              <MaterialCommunityIcons 
                name="book-open-outline" 
                size={28} 
                color={selectedIntro ? colors.readioOrange : colors.readioWhite} 
                style={optionStyles.icon}
              />
            </View>
          </Pressable>
        </View>
        )
      };

      const StartButton = () => (
        <View >
          <Pressable
            style={[
              optionStyles.optionButton, 
              { 
                backgroundColor: readyToStartSession === true ? colors.readioOrange : colors.readioBlack, 
                opacity: readyToStartSession === true ? 1 : 0.5,
                justifyContent: 'center' 
              }
            ]}
            android_ripple={{ color: colors.readioOrange }}
          >
            <Text allowFontScaling={false} style={optionStyles.optionText}>Start</Text>
          </Pressable>
        </View>
      );

    return (
      <View style={{ gap: 24, paddingHorizontal: 20, marginTop: 40, bottom: 150, alignSelf: 'center', position: 'absolute', width: '100%'}}>
       

        <View       
        style={[optionStyles.optionButton, {
          backgroundColor: colors.readioBlack,
          width: 'auto',
          paddingHorizontal: 12,
          alignSelf: 'center',
          gap: 10,
          // opacity: 0.81,
          justifyContent: 'center'
        }]}>

          <Pressable
            onPress={() => {
              console.log("Play button pressed");
            }}
            style={{
              backgroundColor: colors.readioOrange,
              borderRadius: 25,
              width: 28,
              height: 28,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons
              name={howToMeditateIsPlaying ? "pause" : "play"}
              size={20}
              color={colors.readioWhite}
            />
          </Pressable>

          <Text
            allowFontScaling={false}
            style={[optionStyles.optionText, {}]}>
            {howToMeditateData?.[0]?.title}
          </Text>
        </View>

        {/* Duration Selection */}
        <DurationButton/>

        {/* Topics Selection */}
         <TopicsButton/>

        {/* Music Selection */}
        <MusicButton/>

        <StartButton/>

      </View>
    );
  };

  // Function to play or pause the welcome message
  const handlePlayPauseWelcome = async () => {

    const queueId = generateTracksListId('songs', welcomeData?.[0]?.id);
    console.log("Generated queue ID:", queueId);
    
    // Check if this track is currently loaded (by comparing queue IDs)
    const isCurrentQueue = activeQueueId === queueId;
    
    if (playing && isCurrentQueue) {
      // If already playing this track, pause it
      console.log("Pausing welcome message");
      await TrackPlayer.pause();
      setWelcomeIsPlaying(false);
    } else if (isCurrentQueue) {
      // If this track is loaded but paused, resume
      console.log("Resuming welcome message");
      await TrackPlayer.play();
      setWelcomeIsPlaying(true);
    } else {
      // Load and play this track (either first time or switching from different track)
      console.log("Loading and playing welcome message");
      await TrackPlayer.reset();
      setWelcomeIsPlaying(false);
      
      console.log("Adding audio to track player:", welcomeData?.[0]);
      await TrackPlayer.add(welcomeData?.[0]);
      
      console.log("Starting playback");
      await TrackPlayer.play();
      setWelcomeIsPlaying(true);
      
      console.log("Updating queue ID:", queueId);
      setActiveQueueId(queueId);
      
      if (welcomeData?.length > 0) {
        console.log("Setting last active track:", welcomeData?.[0]);
        setLastActiveTrack(welcomeData?.[0]);
      }
    }
  };



  useEffect(() => {

    if (selectedIntro && selectedDuration !== 0) {
      setReadyToStartSession(true)
    }

  }, [selectedIntro, selectedDuration])


  return (
    <>
        {/* Add video here */}
        <Animated.View 
          // key={stepKey}
          entering={FadeInUp.duration(300)}
          exiting={FadeOutDown.duration(300)}
          style={{ position: 'absolute', width: '100%', height: '100%', zIndex: -1 }}
        >

        {/* TODO Video --- soon to be depreciated migrate to expo-video */}
          <Video
          source={ImageAssets.lotusFlowerPondVidDark}
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isLooping
          isMuted
          rate={0.618}
          style={{ 
            width: '100%', height: '100%',
            opacity: 1
           }}
        />

         {/* Top Gradient */}
         <LinearGradient
            colors={[
              colors.readioBrown, 
              colors.readioBrown,
              'rgba(45, 28, 22, 0.7)',
              'rgba(45, 28, 22, 0)'
            ]}
            locations={[0, 0.5, 0.6, 1]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 0.5 }}
            style={{
              position: 'absolute',
              top: 0,
              width: '100%',
              height: '100%',
              zIndex: 1
            }}
          />
          
          {/* Bottom Gradient */}
          <LinearGradient
            colors={[
              'rgba(45, 28, 22, 0)',
              'rgba(45, 28, 22, 0.7)',
              'rgba(45, 28, 22, 0.7)',
              colors.readioBrown
            ]}
            locations={[0, 0.4, 0.5, 1]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 0.8 }}
            style={{
              position: 'absolute',
              bottom: 0,
              width: '100%',
              height: '100%',
              zIndex: 1
            }}
          />


        </Animated.View>

        <View style={styles.container}>

          <View style={{paddingTop: 30}}>

            <Animated.View
            entering={FadeInUp.duration(300)}
            exiting={FadeOutDown.duration(100)}
            style={{paddingHorizontal: 20, gap: 10}}
              >
                <Text 
                  allowFontScaling={false} 
                  style={[styles.bettertittle, {}]}
                >
                  Presence
                </Text>

                <Animated.View 
                  entering={FadeInUp.duration(300)}
                  exiting={FadeOutDown.duration(100)}                
                  style={[optionStyles.optionButton, {
                    backgroundColor: colors.readioBlack,
                    width: 'auto',
                    paddingHorizontal: 12,
                    alignSelf: 'flex-start',
                    gap: 10,
                    justifyContent: 'center'
                  }]}>

                  <Pressable
                    onPress={() => {
                      console.log("Play button pressed");
                      handlePlayPauseWelcome();
                    }}
                    style={{
                      backgroundColor: colors.readioOrange,
                      borderRadius: 25,
                      width: 28,
                      height: 28,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Ionicons
                      name={playing && welcomeIsPlaying ? "pause" : "play"}
                      size={20}
                      color={colors.readioWhite}
                    />
                  </Pressable>

                  <Text 
                  allowFontScaling={false}
                  style={[optionStyles.optionText, {}]}>
                    {welcomeData?.[0]?.title}
                  </Text>
                </Animated.View>

            </Animated.View>

          </View>

          <PresenceOptions/>

        </View>

        <PresenceModal/>
        <LotusArticleModal />
    </>
  )
}

// Add to StyleSheet
const optionStyles = StyleSheet.create({
  optionButton: {
		height: 48,
		alignItems: 'center',
		justifyContent: 'space-between',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 4,
		// alignSelf: 'center',
    display: 'flex',
    flexDirection: 'row',
    overflow: 'hidden',
    width: '100%',
    paddingHorizontal: 16,
    borderRadius: 100,
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.7,
  },
  icon: {
    marginLeft: 8
  },
  optionText: {
    ...utilsStyles.buttonText,
    color: colors.readioWhite,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  pressed: {
    opacity: 0.9,
  },
});

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    // alignItems: 'center',
    backgroundColor: 'transparent',
    width: "100%",
    justifyContent: "space-between",
    flex: 1,
    marginTop: 110,
  },
  bettertittle: {
    fontSize: 45,
    fontWeight: 'bold',
    fontFamily: readioBoldFont,
    color: colors.readioWhite,
  },
});