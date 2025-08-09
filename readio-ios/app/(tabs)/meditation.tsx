import { LotusButtonSelectGroup } from "@/components/LotusButtonSelectGroup";
import LotusGap from "@/components/LotusGap";
import LotusImageWithLoader from "@/components/LotusImageWithLoader";
import { LotusPageDisplayName } from "@/components/LotusPageDisplayName";
import { LotusPicker } from "@/components/LotusPicker";
import LotusToggleIcon from "@/components/LotusToggleIcon";
import { PlayerVolumeBar } from "@/components/ReadioPlayerVolumeBar";
import { ViewProps } from "@/components/Themed";
import { ImageAssets } from "@/constants/imageAssets";
import { SoundAssets } from "@/constants/soundAssets";
import { colors, fontSize, giantFont, readioBoldFont, readioRegularFont } from "@/constants/tokens";
import { generateTracksListId } from "@/helpers/misc";
import { useLotusHaptic } from "@/helpers/providers/lotusHapticProvider";
import { MeditationSeason, useLotusMeditation } from "@/helpers/providers/lotusMeditationContext";
import { useLotusStreak } from "@/helpers/providers/lotusStreakProvider";
import { useLotusUtils } from "@/helpers/providers/lotusUtilsContext";
import { useLastActiveTrack } from "@/hooks/useLastActiveTrack";
import { useTrackPlayerVolume } from "@/hooks/useTrackPlayerVolume";
import { useQueue } from "@/store/queue";
import { defaultStyles, utilsStyles } from "@/styles";
import { RootNavigationProp } from "@/types/type";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import { Audio, ResizeMode, Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { Animated as RNAnimated, Dimensions, Modal, Pressable, FlatList, ScrollView, StyleSheet, Text, View, TouchableOpacity, TouchableHighlight } from "react-native";
import Animated, { FadeInUp, FadeOutDown, FadeIn, FadeOut } from "react-native-reanimated";
import TrackPlayer, { useIsPlaying } from "react-native-track-player";
import { getLocalImageUri } from '@/constants/imageAssets';
import { setStateAsync } from '@/constants/utilityFunctions';
import { useLotusUser } from "@/helpers/providers/lotusUserContext";
import { useRevenueCat } from "@/helpers/providers/RevenueCatProvider";
import ReactNativeModal from "react-native-modal";

export default function LotusMeditationPage() {
  // NOTE A TIER VARIABLES
  const { activeQueueId, setActiveQueueId } = useQueue();
  const { lastActiveTrack, clearLastActiveTrack, setLastActiveTrack } = useLastActiveTrack();
  const { playing } = useIsPlaying();
  const { volume, updateVolume } = useTrackPlayerVolume();
  const navigation = useNavigation<RootNavigationProp>();
  const { updateMeditationStreak } = useLotusStreak();
  const {
    progress,
    selectedModal,
    setSelectedModal,
    selectedDuration,
    setSelectedDuration,
    readyToStartSession,
    setReadyToStartSession,
    isMusicEnabled,
    setIsMusicEnabled,
    welcomeIsPlaying,
    setWelcomeIsPlaying,
    howToMeditateIsPlaying,
    setHowToMeditateIsPlaying,
    meditationSessionHasStarted,
    setMeditationSessionHasStarted,
    currentTrack,
    setCurrentTrack,
    welcomeData,
    howToMeditateData,
    introChime,
    outroChime,
    meditationCategories,
    meditationSeasons,
    playIntroChime,
    playOutroChime,
    updateMinutesMeditated,
  } = useLotusMeditation();
  const [selectedSeason, setSelectedSeason] = useState<MeditationSeason | null>(null);
  const [selectedThemeKey, setSelectedThemeKey] = useState<string | null>(null); // e.g., "shifts", "one_path"
  const [selectedVoiceKey, setSelectedVoiceKey] = useState<string | null>(null); // e.g., "stic", "grace" (lowercase)
  const { floatingPlayerIsVisible } = useLotusUtils();
  const { lightFeedback, mediumFeedback, heavyFeedback, meditationTransition } = useLotusHaptic();
  const { user, userIsSubscribed, userIsOnStarterPlan, userIsAdmin, userIsOnPremiumPlan } = useLotusUser();
  const { subscribeToLotus } = useRevenueCat();

  // NOTE useEffect to determine if the session is ready to start based on new selections
  React.useEffect(() => {
    if (selectedSeason && selectedThemeKey && selectedVoiceKey && selectedDuration > 0) {
      setReadyToStartSession(true);
    } else {
      setReadyToStartSession(false);
    }
  }, [selectedSeason, selectedThemeKey, selectedVoiceKey, selectedDuration, setReadyToStartSession]);

  // SECTION - PRESENCE MODAL SECTION ===================================================================================

  // Add modal container component
  const presenceModalStyles = {
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent backdrop
    },
    modalContent: {
      width: '100%',
      height: '90%', // Adjust height as needed
      backgroundColor: colors.readioBlack, // Or your theme's modal background
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: 20,
      // paddingHorizontal: 20, // Moved to inner views where needed
      position: 'absolute',
      bottom: 0,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: -2, // Shadow on top
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    modalTitle: {
      fontSize: 20,
      fontFamily: readioBoldFont,
      color: colors.readioWhite,
      marginBottom: 15,
      // textAlign: 'center', // Centered title
    },
    closeButton: {
      position: 'absolute',
      top: 0,
      right: 15,
      padding: 5,
    },

  }

  // NOTE B TIER VARIABLES
  const [currentMeditationSeasonId, setCurrentMeditationSeasonId] = React.useState<string | null>(null);
  const durations = [5, 10, 15, 30, 45, 60];
  const scrollViewRef = React.useRef(null);
  const scrollX = useRef(new RNAnimated.Value(0)).current;
  const { width: screenWidth } = Dimensions.get('window');
  const { height: modalHeight } = Dimensions.get('window');
  const contentHeight = modalHeight * 0.6 - 0;
  const [modalSelectedVoice, setModalSelectedVoice] = React.useState("Grace");
  const [currentMeditationCategory, setCurrentMeditationCategory] = React.useState(meditationCategories?.[0])
  const [meditationIndex, setMeditationIndex] = React.useState(0);

  const handleScroll = RNAnimated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const handleMomentumScrollEnd = async (e: any) => {

    const newPosition = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
    if (newPosition > meditationIndex) {
      await setStateAsync(setMeditationIndex, newPosition, 'affectsSomethingVisual');
      setCurrentMeditationSeasonId(null);
    } else if (newPosition < meditationIndex) {
      await setStateAsync(setMeditationIndex, newPosition, 'affectsSomethingVisual');
      await setStateAsync(setCurrentMeditationSeasonId, null, 'backendData')
    }

    lightFeedback();

  };

  interface Section {
    id: string;
    type: 'display-name' | 'meditation-cover' | 'meditation-tracks' | 'observer';
    data?: any[];
  }

  const sections: Section[] = [
    { id: 'display-name', type: 'display-name' },
    { id: 'meditation-cover', type: 'meditation-cover' },
    { id: 'meditation-tracks', type: 'meditation-tracks' },
  ];

  const currentMeditationData = React.useMemo(() => {
    switch (currentMeditationCategory) {
      // case 'Lotus':
      case 'Easy Tiger':
        return {
          meditation_season: meditationSeasons,
          meditation_season_intros: meditationSeasons?.[meditationIndex]?.meditation_season_intros,
          meditation_season_image: meditationSeasons?.[meditationIndex]?.meditation_season_cover,
          meditation_season_name: meditationSeasons?.[meditationIndex]?.meditation_season_name,
        }
      default:
        return {
          meditation_season: [],
          meditation_season_intros: [],
          meditation_season_image: '',
          meditation_season_name: '',
        }
    }
  }, [currentMeditationCategory, meditationSeasons, meditationIndex])

  const voiceKey = modalSelectedVoice.toLowerCase();
  const filteredIntros = currentMeditationData.meditation_season_intros?.[0]?.[voiceKey]
    ? Object.entries(currentMeditationData.meditation_season_intros[0][voiceKey])
      .map(([theme, url]) => ({
        voice: modalSelectedVoice,
        theme,
        url,
      }))
      .sort((a, b) => a.theme.localeCompare(b.theme))
    : [];

  // Define and sort the order of voices for cycling
  const availableVoicesInModal = (
    user?.subscription_plan === 'starter' ? ["Grace", "Padma", "Pythagorus"] : 
    user?.subscription_plan === 'premium' ? ["Grace", "Padma", "Pythagorus", "Stic"] : 
    userIsAdmin ? ["Grace", "Padma", "Pythagorus", 'Stic'] : []).sort();

  // SECTION - PRESENCE MODAL SECTION -- END

  const PresenceOptions = () => {


    const DurationButton = () => (
      <View>
        <Pressable
          onPress={() => {
            lightFeedback();
            setSelectedModal('duration');
          }}
          style={[
            optionStyles.optionButton,
            { backgroundColor: colors.readioBlack }
          ]}
          android_ripple={{ color: colors.readioBrown }}
        >
          <Text allowFontScaling={false} style={optionStyles.optionText}>Duration</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
            <Text allowFontScaling={false} style={[optionStyles.optionText, { color: colors.readioOrange }]}>{selectedDuration} minutes</Text>
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

    const MusicButton = () => {

      return (
        <View style={{ borderRadius: 100 }}>
          <Pressable
            onPress={() => {
              lightFeedback();
              setIsMusicEnabled(!isMusicEnabled);
            }}
            style={[
              optionStyles.optionButton,
              { backgroundColor: colors.readioBlack }
            ]}
            android_ripple={{ color: colors.readioBrown }}
          >
            <Text allowFontScaling={false} style={optionStyles.optionText}>{isMusicEnabled ? 'Music on' : 'Silence'}</Text>
            <LotusToggleIcon
              isEnabled={isMusicEnabled}
              enabledIcon={'music'}
              disabledIcon={'music-off'}
            />
          </Pressable>
        </View>
      )
    };

    const TopicsButton = () => {

      return (
        <View>
          <Pressable
            onPress={() => {
              lightFeedback();
              setSelectedModal('topics');
              // TrackPlayer.reset();
              // clearLastActiveTrack?.();
            }}
            style={[
              optionStyles.optionButton,
              { backgroundColor: colors.readioBlack }
            ]}
            android_ripple={{ color: colors.readioBrown }}
          >
            <Text allowFontScaling={false} style={optionStyles.optionText}>Meditations</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
              <Text
                allowFontScaling={false}
                style={[optionStyles.optionText, { color: selectedSeason && selectedThemeKey ? colors.readioOrange : colors.readioWhite }]}
              >
                {selectedSeason && selectedThemeKey
                  ? `${selectedThemeKey.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}`
                  : "- - -"}
              </Text>
              <MaterialCommunityIcons
                name="book-open-outline"
                size={28}
                color={selectedSeason && selectedThemeKey ? colors.readioOrange : colors.readioWhite}
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
          onPress={!userIsSubscribed ? subscribeToLotus : handleStartPresenceSession}
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
      <View style={{ gap: 12, paddingHorizontal: 20, marginTop: 40, bottom: floatingPlayerIsVisible ? 150 : 100, alignSelf: 'center', position: 'absolute', width: '100%' }}>


        {/* Duration Selection */}
        <DurationButton />

        {/* Topics Selection */}
        <TopicsButton />

        {/* Music Selection */}
        <MusicButton />

        <StartButton />

      </View>
    );
  };

  // NOTE - Function to play or pause the welcome message
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
      await clearLastActiveTrack();
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
        setLastActiveTrack?.(welcomeData?.[0]);
      }
    }
  };

  // NOTE - Function to play or pause the welcome message
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
      await clearLastActiveTrack();
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
        setLastActiveTrack?.(howToMeditateData?.[0]);
      }
    }
  };


  // NOTE - This is the function that starts the meditation session
  const handleStartPresenceSession = async () => {

    // Use the new dynamic selection states
    if (selectedSeason && selectedThemeKey && selectedVoiceKey && selectedDuration > 0) {
      setMeditationSessionHasStarted(true);

      // console.log("Attempting to play intro chime...");
      await playIntroChime();

      try {
        // get urls
        const introUrl = selectedSeason.meditation_season_intros?.[0]?.[selectedVoiceKey]?.[selectedThemeKey];
        const formattedThemeKeyForMusic = selectedThemeKey ? selectedThemeKey.toLowerCase().replace(/ /g, '_') : '';
        const musicUrl = selectedSeason.meditation_season_music?.[0]?.[formattedThemeKeyForMusic];

        if (!introUrl) {
          console.error("No intro URL found for current selection. Details:", {
            seasonName: selectedSeason.meditation_season_name,
            themeKey: selectedThemeKey,
            voiceKey: selectedVoiceKey,
          });
          setMeditationSessionHasStarted(false);
          return;
        }

        if (!musicUrl) {
          console.error("No music URL found for current selection. Details:", {
            seasonName: selectedSeason.meditation_season_name,
            themeKey: selectedThemeKey,
          });
          setMeditationSessionHasStarted(false);
          return;
        }

        const queueId = generateTracksListId(`presence-${selectedSeason.id}-${selectedThemeKey}`, selectedSeason.id?.toString() || 'unknown');
        const tracksToPlay: any[] = []; // Ensure LastActiveTrack is compatible with TrackPlayer.Track
        await TrackPlayer.reset();
        await clearLastActiveTrack();

        // Create Intro Track object
        const introTrack: any = {
          id: `intro-${selectedSeason.id}-${selectedThemeKey}-${selectedVoiceKey}`,
          url: introUrl,
          title: `${selectedThemeKey.replace(/_/g, ' ')} Intro`,
          artist: selectedVoiceKey.charAt(0).toUpperCase() + selectedVoiceKey.slice(1),
          artwork: selectedSeason.meditation_season_cover || getLocalImageUri('meditationIcon'),
          contentType: 'meditation_intro',
        };
        tracksToPlay.push(introTrack);

        // Create Music Track object if enabled and URL exists
        if (isMusicEnabled && musicUrl) {
          const musicTrackToAdd: any = {
            id: `music-${selectedSeason.id}-${selectedThemeKey}`,
            url: musicUrl,
            title: `${selectedThemeKey.replace(/_/g, ' ')} Music`,
            artist: 'Lotus- Presence',
            artwork: selectedSeason.meditation_season_cover || getLocalImageUri('meditationIcon'),
            contentType: 'meditation_music',
          };
          tracksToPlay.push(musicTrackToAdd);
          // console.log("Created musicTrackToAdd:", JSON.stringify(musicTrackToAdd, null, 2));
        } 
        
        if (isMusicEnabled === false) {
          const silentMusicTrack: any = {
            id: `music-${selectedSeason.id}-${selectedThemeKey}-silent`,
            url: musicUrl,
            title: `${selectedThemeKey.replace(/_/g, ' ')} Music (Silent)`,
            artist: 'Lotus - Presence',
            artwork: selectedSeason.meditation_season_cover || getLocalImageUri('meditationIcon'),
            contentType: 'meditation_music',
            volume: 0,
          };
          tracksToPlay.push(silentMusicTrack);
        }

        // add tracks to queue
        await TrackPlayer.add(tracksToPlay);
        await TrackPlayer.play();

        setActiveQueueId(queueId);
        setLastActiveTrack?.(tracksToPlay[0]); // Set the dynamically created intro track
        setMeditationSessionHasStarted(true);

      } catch (error) {
        console.error("Error starting presence session:", error);
      }

      // Update presence streak when session starts
      await updateMeditationStreak();

    } else {
      console.warn("handleStartPresenceSession: Conditions not met to start session. Check selectedSeason, selectedThemeKey, selectedVoiceKey, or selectedDuration.");
    }

    meditationTransition();

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

        {/* NOTE Top Gradient */}
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
            opacity: meditationSessionHasStarted === true ? 0 : 1
          }}
        />

        {/* NOTE Bottom Gradient */}
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

      {meditationSessionHasStarted === false && (
        <View style={styles.container}>

          <View style={{}}>

            <Animated.View
              entering={FadeInUp.duration(300)}
              exiting={FadeOutDown.duration(100)}
              style={{ paddingHorizontal: 20, gap: 10 }}
            >
              <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 15 }}>
                <LotusPageDisplayName title="MEDITATE" />
                <Text allowFontScaling={false} style={{ transform: [{ translateY: -5 }], color: colors.readioWhite, fontSize: 16, fontFamily: readioBoldFont, textAlign: 'center' }}>
                  The Practice of Presence
                </Text>
              </View> 

              <View style={{ display: 'flex', gap: 4, flexDirection: 'column', width: '100%', alignItems: 'center' }}>
                {/* NOTE GETTING STARTED BUTTON */}
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
                      if (!userIsSubscribed) {
                        subscribeToLotus();
                      } else {
                        // console.log("Play button pressed");
                        mediumFeedback();
                        handlePlayPauseWelcome();
                      }
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
                      color={colors.readioDustyWhite}
                    />
                  </Pressable>

                  <Text
                    allowFontScaling={false}
                    style={[optionStyles.optionText, {}]}>
                    {welcomeData?.[0]?.title}
                  </Text>
                </Animated.View>

                {/* NOTE HOW TO MEDITATE BUTTON */}
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
                      if (!userIsSubscribed) {
                        subscribeToLotus();
                      } else {
                        // console.log("Play button pressed");
                        mediumFeedback();
                        handlePlayPauseHowToMeditate();
                      }
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
                      color={colors.readioDustyWhite}
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

          <PresenceOptions />

          {/* NOTE MODALS */}
          <ReactNativeModal style={{ padding: 0, margin: 0, }} isVisible={selectedModal !== null}
          >
            <View style={presenceModalStyles.modalBackdrop}>
              <Animated.View entering={FadeInUp.duration(300)} style={presenceModalStyles.modalContent as any}>


                {/* NOTE Duration Modal */}
                {selectedModal === 'duration' && (
                  <>

                    <View style={{ paddingHorizontal: 20, width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text allowFontScaling={false} style={presenceModalStyles.modalTitle}>Set Duration</Text>
                      <Pressable
                        style={presenceModalStyles.closeButton as any}
                        onPress={() => { lightFeedback(); setSelectedModal(null); }}
                      >
                        <MaterialCommunityIcons name="close" size={24} color={colors.readioWhite} />
                      </Pressable>
                    </View>

                    <View style={{
                      height: contentHeight,
                      alignItems: 'center',
                      backgroundColor: 'transparent'
                    }}>
                      <LotusPicker
                        items={durations.map(mins => ({ label: `${mins} minutes`, value: mins }))}
                        selectedValue={selectedDuration}
                        onValueChange={(itemValue) => {
                          setSelectedDuration(itemValue);
                          setSelectedModal(null);
                          // console.log('value', itemValue)
                          lightFeedback();
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

                {/* NOTE CHOOSE MEDITATION Modal */}
                {selectedModal === 'topics' && (
                  <>

                    <View style={{ paddingHorizontal: 20, width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text allowFontScaling={false} style={presenceModalStyles.modalTitle}>Choose Meditation</Text>
                      <Pressable
                        style={presenceModalStyles.closeButton as any}
                        onPress={() => { lightFeedback(); setSelectedModal(null); }}
                      >
                        <MaterialCommunityIcons name="close" size={24} color={colors.readioWhite} />
                      </Pressable>
                    </View>

                    <FlatList
                      data={sections}
                      renderItem={({ item }: { item: Section }) => {
                        switch (item.type) {
                          case 'display-name':
                            return (
                              <>
                                <View style={{}}>

                                  <LotusButtonSelectGroup
                                    buttons={meditationCategories}
                                    activeButton={currentMeditationCategory}
                                    onButtonPress={setCurrentMeditationCategory}
                                    containerStyle={{
                                      alignSelf: 'center',
                                    }}
                                  />

                                  <View style={{ padding: 5, marginVertical: 2, display: 'flex', flexDirection: 'row', alignSelf: 'center', alignContent: 'center', justifyContent: 'center', backgroundColor: colors.readioBlack, borderRadius: 10 }}>
                                    {currentMeditationData.meditation_season && currentMeditationData.meditation_season.length > 0 && currentMeditationData.meditation_season?.map((meditation: any, index: number) => (
                                      <View key={index} style={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: 5,
                                        backgroundColor: meditation?.id === meditationIndex + 1 ? colors.readioOrange : colors.readioWhite,
                                        opacity: meditation?.id === meditationIndex + 1 ? 1 : 0.4,
                                        marginHorizontal: 5
                                      }}></View>
                                    ))}
                                  </View>
                                </View>
                              </>
                            );
                          case 'meditation-cover':
                            return (
                              <View style={styles.albumCarouselContainer}>
                                <ScrollView
                                  ref={scrollViewRef}
                                  horizontal
                                  pagingEnabled
                                  showsHorizontalScrollIndicator={false}
                                  onScroll={handleScroll}
                                  onMomentumScrollEnd={handleMomentumScrollEnd}
                                  scrollEventThrottle={16}
                                  style={styles.pagerView}
                                >

                                  {currentMeditationData.meditation_season && currentMeditationData.meditation_season.length > 0 && currentMeditationData.meditation_season?.map((meditation: any, index: number) => (
                                    <View key={index} style={[styles.albumCoverContainer, { width: screenWidth }]}>
                                      <View key={meditation.id} style={styles.albumCoverContainer}>
                                        <View style={styles.albumImageContainer}>
                                          <LotusImageWithLoader
                                            source={{ uri: getLocalImageUri('filter') }}
                                            style={[styles.albumImage, { zIndex: 1, opacity: 0.4 }]}
                                            resizeMode='cover'
                                          />
                                          <LotusImageWithLoader
                                            source={{ uri: meditation.meditation_season_cover }}
                                            style={styles.albumImage}
                                            resizeMode='cover'
                                          />

                                        </View>
                                      </View>
                                      <View style={{ display: 'flex', paddingHorizontal: 35, paddingTop: 10 }}>
                                        <Text allowFontScaling={false} numberOfLines={3} style={[styles.albumArtist, { textAlign: 'center' }]}>
                                          {meditation.meditation_season_name} - {meditation.meditation_season_description}
                                        </Text>
                                      </View>
                                    </View>
                                  ))}
                                </ScrollView>
                              </View>
                            );
                          case 'meditation-tracks':
                            const handleVoiceSelect = (voice: string) => {
                              lightFeedback();
                              setModalSelectedVoice(voice); // Use modal-local setter
                            };

                            return (
                              <>
                                {filteredIntros && filteredIntros.length > 0 && (
                                  <>
                                    <LotusGap backgroundColor="transparent" gapNumber={20} />
                                    <View style={[]}>
                                      <LotusButtonSelectGroup
                                        buttons={availableVoicesInModal}
                                        activeButton={modalSelectedVoice}
                                        onButtonPress={handleVoiceSelect}
                                        containerStyle={{
                                          alignSelf: 'center',
                                          marginBottom: 10
                                        }}
                                      />
                                      <FlatList
                                        data={filteredIntros} contentContainerStyle={{ paddingTop: 10, paddingBottom: 128 }}
                                        ListEmptyComponent={
                                          <>
                                            <View >
                                              <LotusGap backgroundColor="transparent" gapNumber={10} />
                                              <View style={{ height: 30 }}>
                                                <LotusImageWithLoader
                                                  source={ImageAssets.whiteLogo}
                                                  style={[{ width: 50, height: 50, alignSelf: 'center' }]}
                                                  resizeMode='contain'
                                                />
                                              </View>
                                              <Text allowFontScaling={false} style={[utilsStyles.emptyContentText, { opacity: 0.5 }]}>No Intros found right now.</Text>
                                            </View>
                                          </>
                                        }
                                        renderItem={({ item: intro, index }) => (
                                          <>
                                            <Animated.View entering={FadeIn.duration(300 + (index * 100))} style={{ paddingHorizontal: 20 }} exiting={FadeOut.duration(300 + (index * 100))} >
                                              <TouchableHighlight style={{ borderRadius: 10, marginBottom: 5 }} activeOpacity={0.95} underlayColor="rgba(255,255,255,0.1)">
                                                <TouchableOpacity
                                                  activeOpacity={0.7}
                                                  onPress={() => {
                                                    mediumFeedback();
                                                    const currentSeasonData = currentMeditationData.meditation_season?.[meditationIndex];
                                                    // These now set the PAGE-LEVEL states
                                                    if (currentSeasonData) { setSelectedSeason(currentSeasonData as MeditationSeason); }
                                                    setSelectedThemeKey(intro.theme); // intro.theme is snake_case
                                                    setSelectedVoiceKey(intro.voice.toLowerCase()); // intro.voice is "Grace", "Padma", etc. -> convert to "grace"
                                                    setSelectedModal(null); // Close the modal
                                                  }}
                                                  style={[styles.trackItemContainer, { borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.1)', paddingVertical: 10 }]}
                                                >
                                                  <View>
                                                    <LotusImageWithLoader source={{ uri: getLocalImageUri('filter') }} style={[styles.trackArtworkImage, { zIndex: 1, opacity: 0.4, position: 'absolute' }]} resizeMode='cover' />
                                                    <LotusImageWithLoader source={{ uri: currentMeditationData.meditation_season_image }}
                                                      style={{
                                                        ...styles.trackArtworkImage,
                                                        opacity: 1,
                                                      }}
                                                    />
                                                  </View>

                                                  <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} >
                                                    <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}>
                                                      <Text
                                                        allowFontScaling={false}
                                                        numberOfLines={1}
                                                        style={{
                                                          color: colors.readioWhite,
                                                          fontSize: 15,
                                                          fontWeight: '600',
                                                          fontFamily: readioBoldFont
                                                        }}
                                                      >
                                                        {intro.theme.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}
                                                      </Text>

                                                      <Text allowFontScaling={false} numberOfLines={1} style={{ ...styles.trackArtistText, color: colors.readioOrange }}>
                                                        {modalSelectedVoice}
                                                      </Text>
                                                    </View>

                                                  </View>
                                                </TouchableOpacity>
                                              </TouchableHighlight>
                                            </Animated.View>
                                          </>
                                        )}
                                      />
                                    </View>
                                  </>
                                )}
                                <LotusGap backgroundColor='' gapNumber={floatingPlayerIsVisible ? 130 : 100} />
                              </>
                            );
                          default:
                            return null;
                        }
                      }}
                      keyExtractor={item => item.id}
                      showsVerticalScrollIndicator={false}
                    />

                  </>
                )}

              </Animated.View>
            </View>
          </ReactNativeModal>

        </View>
      )}

      {meditationSessionHasStarted === true && (
        <View style={styles.container}>
          <View style={{}}>
            <Animated.View
              entering={FadeInUp.duration(300)}
              exiting={FadeOutDown.duration(100)}
              style={{ paddingHorizontal: 20, gap: 20, justifyContent: 'space-between', height: '95%' }}
            >
              <View style={{}}>

                <LotusPageDisplayName title={
                  selectedThemeKey
                    ? `${selectedThemeKey.replace(/_/g, ' ').toUpperCase()}`
                    : "MEDITATION"} />
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

                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    <LotusImageWithLoader style={{ width: 28, height: 28, opacity: 0.5 }} source={ImageAssets.meditationIcon} resizeMode="contain" />
                  </View>

                  <Text
                    allowFontScaling={false}
                    style={[optionStyles.optionText, {}]}>
                    {currentTrack === 'intro' ? (
                      selectedThemeKey && selectedVoiceKey
                        ? `Playing: ${selectedThemeKey.replace(/_/g, ' ')}`
                        : "Playing Introduction"
                    ) : (
                      `Your ${selectedDuration} minutes have begun!`
                    )}
                  </Text>

                </Animated.View>

              </View>


              <View style={{}}>
                {/* NOTE VOLUME BAR, Progress information and controls */}

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

                <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'center', gap: 5 }}>

                  <View
                    style={{
                      backgroundColor: colors.readioBlack,
                      borderRadius: 24,
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: 48,
                      paddingHorizontal: 15,
                    }}
                  >
                    <PlayerVolumeBar style={{ width: 150 } as ViewProps} customScrollerColor={colors.readioOrange} customScorllerBackground={colors.readioBrown} />
                  </View>

                  {/* NOTE Play/Pause and Stop Controls */}
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Pressable
                      onPress={async () => {
                        if (playing) {
                          await TrackPlayer.pause();
                        } else {
                          await TrackPlayer.play();
                        }
                        // REVIEW
                        mediumFeedback();
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
                        mediumFeedback();
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
                        // NOTE Reset everything
                        updateMinutesMeditated();
                        await TrackPlayer.reset();
                        await clearLastActiveTrack();
                        setMeditationSessionHasStarted(false);
                        setCurrentTrack(null);
                        // Reset dynamic selection states
                        setSelectedSeason(null);
                        setSelectedThemeKey(null);
                        setSelectedVoiceKey(null);
                        setSelectedDuration(5);
                        setReadyToStartSession(false);
                        setIsMusicEnabled(true);
                        if (setLastActiveTrack) {
                          setLastActiveTrack?.(null);
                        }
                        await updateVolume(0.618);
                        await clearLastActiveTrack();
                        await updateVolume(0.618);

                        mediumFeedback();

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

    </>
  )
}

// NOTE StyleSheets
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
    color: colors.readioDustyWhite,
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
  albumCarouselContainer: {
    height: 300,
    width: '100%',
    backgroundColor: 'transparent',

  },
  pagerView: {
    flex: 1,
    width: '100%',
  },
  albumCoverContainer: {
    // flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  albumImageContainer: {
    width: 250,
    height: 250,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: colors.readioWhite,
  },
  albumImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  albumArtist: {
    fontSize: 14,
    color: colors.readioDustyWhite,
    marginTop: 5,
    fontFamily: readioRegularFont,
  },
  trackItemContainer: {
    flexDirection: 'row',
    columnGap: 14,
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: 5,
  },
  trackPlayingIconIndicator: {
    position: 'absolute',
    top: 18,
    left: 16,
    width: 16,
    height: 16,
  },
  trackPausedIndicator: {
    position: 'absolute',
    top: 14,
    left: 14,
  },
  trackArtworkImage: {
    borderRadius: 8,
    width: 50,
    height: 50,
  },
  trackTitleText: {
    ...defaultStyles.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
    maxWidth: '90%',
  },
  trackArtistText: {
    ...defaultStyles.text,
    color: colors.readioWhite,
    fontSize: 14,
    fontFamily: readioRegularFont
  },
  heading: {
    fontSize: 60,
    fontWeight: 'bold',
  },
});
