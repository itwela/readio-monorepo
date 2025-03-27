import LotusHeader from "@/components/LotusHeader";
import { colors, giantFont, readioBoldFont, utilStyle } from "@/constants/tokens";
import React, { useEffect } from "react";
import { View, StyleSheet, FlatList, Pressable, Text, Modal, ScrollView, Dimensions, Image } from "react-native";
import Animated, { FadeInDown, FadeInUp, FadeOutDown } from "react-native-reanimated";
import { ResizeMode, Video, Audio } from 'expo-av';
import { getLocalImageUri, ImageAssets } from "@/constants/imageAssets";
import { LinearGradient } from 'expo-linear-gradient';
import { useLotusPresence } from "@/helpers/providers/lotusPresenceContext";
import { utilsStyles } from "@/styles";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from 'expo-blur';
import { LotusArticleModal } from "@/components/LotusModals/LotusArticleModal";
import { LotusPicker } from "@/components/LotusPicker";
import TrackPlayer, { Event, useIsPlaying, useProgress, useTrackPlayerEvents } from "react-native-track-player";
import { generateTracksListId } from "@/helpers/misc";
import { SoundAssets } from "@/constants/soundAssets";
import { useQueue } from "@/store/queue";
import { useLastActiveTrack } from "@/hooks/useLastActiveTrack";
import LotusGap from "@/components/LotusGap";
import { PlayerVolumeBar } from "@/components/ReadioPlayerVolumeBar";
import { useTrackPlayerVolume } from "@/hooks/useTrackPlayerVolume";
import { ViewProps } from "@/components/Themed";
import { LotusPageDisplayName } from "@/components/LotusPageDisplayName";
import { useLotusUtils } from "@/helpers/providers/lotusUtilsContext";
import { useLotusStreak } from "@/helpers/providers/lotusStreakProvider";


export default function LotusPresencePage() {

  const { activeQueueId, setActiveQueueId } = useQueue();
  const { lastActiveTrack, clearLastActiveTrack, setLastActiveTrack } = useLastActiveTrack();
  const { playing } = useIsPlaying();
  const { volume, updateVolume } = useTrackPlayerVolume();
  // Then modify the handleStartPresenceSession to check if setLastActiveTrack exists
  const { updatePresenceStreak } = useLotusStreak();
  const {
    progress,
    selectedModal,
    setSelectedModal,
    selectedDuration,
    setSelectedDuration,
    selectedIntro,
    setSelectedIntro,
    readyToStartSession,
    setReadyToStartSession,
    isMusicEnabled,
    setIsMusicEnabled,
    welcomeIsPlaying,
    setWelcomeIsPlaying,
    howToMeditateIsPlaying,
    setHowToMeditateIsPlaying,
    presenceSessionHasStarted,
    setPresenceSessionHasStarted,
    currentTrack,
    setCurrentTrack,
    intros,
    presenceMeditationMusic,
    welcomeData,
    howToMeditateData
  } = useLotusPresence();
 
  const { floatingPlayerIsVisible } = useLotusUtils()

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
      <Modal visible={!!selectedModal} transparent animationType="slide"
      >
        <BlurView intensity={5} style={presenceModalStyles.modalBackdrop as any}>
          <Animated.View entering={FadeInUp.duration(300)} style={presenceModalStyles.modalContent as any}>
            

            {/* Duration Modal */}
            {selectedModal === 'duration' && (
              <>
                <Text allowFontScaling={false} style={presenceModalStyles.modalTitle}>Set Duration</Text>
                <View style={{
                  height: contentHeight,
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  backgroundColor: 'transparent'
                }}>
                  <LotusPicker
                    items={durations.map(mins => ({ label: `${mins} minutes`, value: mins }))}
                    selectedValue={selectedDuration}
                    onValueChange={(itemValue) => {
                      setSelectedDuration(itemValue);
                      setSelectedModal(null);
                      console.log('value', itemValue)
                    }}
                    itemHeight={160}
                    visibleItems={3}
                    textStyle={{
                      fontSize: 30,
                      fontFamily: readioBoldFont,
                      color: colors.readioWhite,
                      textAlign: 'center',
                    }}
                    style={{
                      width: 300,
                    }}
                  />
                </View>
              </>
            )}

            {/* intros Modal */}
            {selectedModal === 'topics' && (
              <>
                <Text allowFontScaling={false} style={presenceModalStyles.modalTitle}>Choose Meditation</Text>
                {intros.map((intro: any, index: number) => (
                  <Pressable onPress={() => handleSelectIntro(intro)} key={intro.id} style={presenceModalStyles.modalItem}>
                    <Text allowFontScaling={false} style={presenceModalStyles.modalItemSubtext}>{index + 1}.</Text>
                    <Text allowFontScaling={false} style={[presenceModalStyles.modalItemText, {fontFamily: readioBoldFont}]}>{intro.title}</Text>
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
      
        return (
          <View style={{ borderRadius: 100 }}>
            <Pressable
              onPress={() => setIsMusicEnabled(!isMusicEnabled)}
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
              <Text allowFontScaling={false} style={[optionStyles.optionText, {color: colors.readioOrange}]}>{selectedDuration} minutes</Text>
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
            <Text allowFontScaling={false} style={optionStyles.optionText}>Meditations</Text>
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3}}>
              <Text allowFontScaling={false} style={[optionStyles.optionText, {color: selectedIntro ? colors.readioOrange : colors.readioWhite}]}>{!selectedIntro ? "- - -" : selectedIntro?.title}</Text>
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
            onPress={handleStartPresenceSession}
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
      <View style={{ gap: 12, paddingHorizontal: 20, marginTop: 40, bottom: floatingPlayerIsVisible ? 150 : 100, alignSelf: 'center', position: 'absolute', width: '100%'}}>
       

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
    setHowToMeditateIsPlaying(false);
    const queueId = generateTracksListId('songs', welcomeData?.[0]?.id);
    
    const isCurrentQueue = activeQueueId === queueId;
    
    if (playing && isCurrentQueue) {
      await TrackPlayer.pause();
      setWelcomeIsPlaying(false);
    } else if (isCurrentQueue) {
      await TrackPlayer.play();
      setWelcomeIsPlaying(true);
    } else {
      await TrackPlayer.reset();
      setWelcomeIsPlaying(false);
      
      // Add track with specific options to prevent looping
      await TrackPlayer.add({
        ...welcomeData?.[0],
        repeat: false,
        repeatMode: 'off'
      });
      
      // Also set the player's repeat mode
      await TrackPlayer.setRepeatMode(0); // 0 means no repeat
      
      await TrackPlayer.play();
      setWelcomeIsPlaying(true);
      setActiveQueueId(queueId);
      
      if (welcomeData?.length > 0) {
        setLastActiveTrack(welcomeData?.[0]);
      }
    }
  };

  // Function to play or pause the welcome message
  const handlePlayPauseHowToMeditate = async () => {
    setWelcomeIsPlaying(false);
    const queueId = generateTracksListId('songs', howToMeditateData?.[0]?.id);
    
    const isCurrentQueue = activeQueueId === queueId;
    
    if (playing && isCurrentQueue) {
      await TrackPlayer.pause();
      setHowToMeditateIsPlaying(false);
    } else if (isCurrentQueue) {
      await TrackPlayer.play();
      setHowToMeditateIsPlaying(true);
    } else {
      await TrackPlayer.reset();
      setHowToMeditateIsPlaying(false);
      
      // Add track with specific options to prevent looping
      await TrackPlayer.add({
        ...howToMeditateData?.[0],
        repeat: false,
        repeatMode: 'off'
      });
      
      // Also set the player's repeat mode
      await TrackPlayer.setRepeatMode(0); // 0 means no repeat
      
      await TrackPlayer.play();
      setHowToMeditateIsPlaying(true);
      setActiveQueueId(queueId);
      
      if (howToMeditateData?.length > 0) {
        setLastActiveTrack(howToMeditateData?.[0]);
      }
    }
  };
  

  const handleStartPresenceSession = async () => {
    if (selectedIntro && selectedDuration !== 0) {
      setPresenceSessionHasStarted(true);

        const introChime = new Audio.Sound();
        try {
          await introChime.loadAsync(SoundAssets.presenceIntroChime.id);
          await introChime.setVolumeAsync(0.20); // Set volume to 20% (value between 0 and 1)
          await introChime.playAsync();
        } catch (error) {
          console.error("Error playing intro chime:", error);
        }

      try {
        const matchingMusic = presenceMeditationMusic.find(
          music => music.id === selectedIntro.id
        );
    
        if (!matchingMusic) {
          console.error("No matching music found for intro:", selectedIntro.title);
          return;
        }
    
        const queueId = generateTracksListId(`presence-session-${selectedIntro?.title}`, selectedIntro.id);
        

        console.log('is music enabled?', isMusicEnabled)

        await TrackPlayer.reset();
        await TrackPlayer.add([
          selectedIntro,
          {
            ...matchingMusic,
          }
        ]);

        await TrackPlayer.play();
                
        // Update state with null checks
        setActiveQueueId(queueId);
        if (setLastActiveTrack) {
          setLastActiveTrack(selectedIntro);
        }

        setPresenceSessionHasStarted(true);

        
      } catch (error) {
        console.error("Error starting presence session:", error);
      }
      
      // Update presence streak when session starts
      await updatePresenceStreak();
    }
  };

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
              'rgba(45, 28, 22, 0)'
            ]}
            locations={[0, 1]}
            start={{ x: 0.5, y: 0.4 }}
            end={{ x: 0.5, y: 1 }}
            style={{
              position: 'absolute',
              top: 100,
              width: '100%',
              height: 300,
              zIndex: 1,
              opacity: presenceSessionHasStarted === true ? 0 : 1
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
            end={{ x: 0.5, y: 0.6 }}
            style={{
              position: 'absolute',
              bottom: 0,
              width: '100%',
              height: '100%',
              zIndex: 1
            }}
          />


        </Animated.View>

        {presenceSessionHasStarted === false && (
          <View style={styles.container}>

            <View style={{}}>

              <Animated.View
              entering={FadeInUp.duration(300)}
              exiting={FadeOutDown.duration(100)}
              style={{paddingHorizontal: 20, gap: 10}}
                >
                  <LotusPageDisplayName title="MEDITATE"/>

                  <View style={{display: 'flex', gap: 4, flexDirection: 'column', width: '100%', alignItems: 'center'}}>
                    <Animated.View 
                      entering={FadeInUp.duration(300)}
                      exiting={FadeOutDown.duration(100)}                
                      style={[optionStyles.optionButton, {
                        backgroundColor: colors.readioBlack,
                        width: 'auto',
                        paddingHorizontal: 12,
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

                    <Animated.View       
                      style={[optionStyles.optionButton, {
                        backgroundColor: colors.readioBlack,
                        width: 'auto',
                        paddingHorizontal: 12,
                        gap: 10,
                        justifyContent: 'center'
                      }]}>

                        <Pressable
                            onPress={() => {
                              console.log("Play button pressed");
                              handlePlayPauseHowToMeditate();
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
                            name={playing && howToMeditateIsPlaying ? "pause" : "play"}
                            size={20}
                            color={colors.readioWhite}
                          />
                        </Pressable>

                        <Text
                          allowFontScaling={false}
                          style={[optionStyles.optionText, {}]}>
                          {howToMeditateData?.[0]?.title}
                        </Text>
                    </Animated.View>
                  </View>

              </Animated.View>

            </View>

            <PresenceOptions/>

          </View>
        )}

      {presenceSessionHasStarted === true && (
        <View style={styles.container}>
          <View style={{ }}>
            <Animated.View
              entering={FadeInUp.duration(300)}
              exiting={FadeOutDown.duration(100)}
              style={{ paddingHorizontal: 20, gap: 20, justifyContent: 'space-between' , height: '95%' }}
            >
              <View style={{}}>


                <LotusPageDisplayName title={selectedIntro?.id?.toUpperCase()}  />
                <LotusGap gapNumber={10} backgroundColor="transparent" />

                <Animated.View
                  entering={FadeInUp.duration(300)}
                  exiting={FadeOutDown.duration(100)}
                  style={[optionStyles.optionButton, {
                    backgroundColor: colors.readioBlack,
                    width: 'auto',
                    alignSelf: 'center',
                    gap: 10,
                    justifyContent: 'center',
                  }]}>
            
                  <View style={{  flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    <Image style={{ width: 28, height: 28, opacity: 0.5 }} source={ ImageAssets.presenceIcon} resizeMode="contain"/>
                  </View>
            
                  <Text
                    allowFontScaling={false}
                    style={[optionStyles.optionText, {}]}>
                    {currentTrack === 'intro' ? (
                      `Playing: ${selectedIntro?.title}`
                    ) : (
                      `Your ${selectedDuration} minutes have begun!`
                    )}
                  </Text>

                </Animated.View>
              
              </View>


              <View style={{}}>
                {/* Progress information and controls */}

                <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <Animated.View
                    style={[optionStyles.optionButton, {
                      backgroundColor: colors.readioBlack,
                      width: 'auto',
                      paddingHorizontal: 12,
                      alignSelf: 'center',
                      gap: 10,
                    }]}>
                    <Text allowFontScaling={false} style={[optionStyles.optionText, { color: colors.readioOrange }]}>
                      {Math.floor(progress.position / 60)}:{Math.floor(progress.position % 60).toString().padStart(2, '0')} / 
                      {currentTrack === 'intro' ? ' Intro' : ` ${selectedDuration}:00`}
                    </Text>
                  </Animated.View>

                </View>

                <LotusGap gapNumber={10} backgroundColor="transparent" />

                <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                 
                  <PlayerVolumeBar style={{width: 150} as ViewProps} customScrollerColor={colors.readioOrange} customScorllerBackground={colors.readioBlack}/>

                  {/* Play/Pause and Stop Controls */}
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Pressable
                      onPress={async () => {
                        if (playing) {
                          await TrackPlayer.pause();
                        } else {
                          await TrackPlayer.play();
                        }
                      }}
                      style={{
                        backgroundColor: colors.readioBlack,
                        borderRadius: 24,
                        width: 48,
                        height: 48,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Ionicons
                        name={playing ? "pause" : "play"}
                        size={24}
                        color={colors.readioOrange}
                      />
                    </Pressable>

                    <Pressable
                      onPress={async () => {
                        if (currentTrack != 'meditation') {
                          await TrackPlayer.skipToNext();
                        }                       
                      }}
                      style={{
                        backgroundColor: colors.readioBlack,
                        borderRadius: 24,
                        width: 48,
                        height: 48,
                        justifyContent: 'center',
                        alignItems: 'center',
                        opacity: currentTrack === 'meditation' ? 0.5 : 1,
                      }}
                    >
                      <Ionicons
                        name="play-skip-forward"
                        size={24}
                        color={colors.readioOrange}
                      />
                    </Pressable>
                      
                      <Pressable
                        onPress={async () => {
                          // Reset everything
                          await TrackPlayer.reset();
                          setPresenceSessionHasStarted(false);
                          setCurrentTrack(null);
                          setSelectedIntro(null);
                          setSelectedDuration(5);
                          setReadyToStartSession(false);
                          setIsMusicEnabled(true);
                          if (setLastActiveTrack) {
                            setLastActiveTrack(null);
                          }
                          await updateVolume(0.618);
                          await clearLastActiveTrack();
                          await updateVolume(0.618);
                        }}
                        style={{
                          backgroundColor: colors.readioBlack,
                          borderRadius: 24,
                          width: 48,
                          height: 48,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Ionicons
                          name="stop"
                          size={24}
                          color={colors.readioOrange}
                        />
                      </Pressable>
                  </View>

                </View>

                <LotusGap gapNumber={10} backgroundColor="transparent" />

                {/* Meditation guidance */}
                <Text allowFontScaling={false} style={[optionStyles.optionText, { color: colors.readioWhite, opacity: 0.8, alignSelf: 'center', textAlign: "center", width: '95%' }]}>
                  {currentTrack === 'intro' ? 
                    "Get comfortable, take a deep breath, and follow along with the introduction..." :
                    "Find your breath and settle into your meditation practice..."
                  }
                </Text>

              </View>

            </Animated.View>
          </View>
        </View>
      )}

        <PresenceModal/>
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
    marginTop: 100,
  },
  bettertittle: {
    fontSize: 35,
    fontWeight: 'bold',
    fontFamily: giantFont,
    color: colors.readioWhite,
  },
});