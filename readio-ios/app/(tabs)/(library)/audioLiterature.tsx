import LotusGap from '@/components/LotusGap';
import LotusHeader from '@/components/LotusHeader';
import { ReadioTracksList } from '@/components/ReadioTrackList';
import { getLocalImageUri } from '@/constants/imageAssets';
import { colors, giantFont, readioBoldFont, readioRegularFont } from "@/constants/tokens";
import { setStateAsync } from '@/constants/utilityFunctions';
import { generateTracksListId } from '@/helpers/misc';
import { useLotusFithop } from '@/helpers/providers/lotusFithopProvider';
import { useLotusUtils } from '@/helpers/providers/lotusUtilsContext';
import { useLastActiveTrack } from '@/hooks/useLastActiveTrack';
import { useQueue } from '@/store/queue';
import { LotusArticle } from '@/types/type';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated as ReactNativeAnimated, Dimensions, FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import TrackPlayer, { State, Track, useIsPlaying, usePlaybackState } from 'react-native-track-player';
import { LotusPageDisplayName } from '@/components/LotusPageDisplayName';
import { LotusButtonSelectGroup } from '@/components/LotusButtonSelectGroup';
import { useLotusAudiobook } from '@/helpers/providers/lotusAudiobookProvider';
import { useLotusUser } from '@/helpers/providers/lotusUserContext';
import Animated, { FadeInUp, FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import { shortLengthArticle_Name, shortLengthArticle_Name_DB } from '@/constants/tokens';
import LotusImageWithLoader from '@/components/LotusImageWithLoader';
import { useLotusHaptic } from '@/helpers/providers/lotusHapticProvider';
import { LotusUpgradeBlur } from '@/components/LotusUpgradeBlur';
import { useProgressTracking } from '@/hooks/useProgressTracking';
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";


export default function AudioLiteraturePage() {
  const playbackState = usePlaybackState();
  const { linerNoteArticles} = useLotusUser();
  const { userIsSubscribed, userIsOnStarterPlan, userIsAdmin, userIsOnPremiumPlan } = useLotusUser();
  const { lastActiveTrack, clearLastActiveTrack, setLastActiveTrack } = useLastActiveTrack();
  const { floatingPlayerIsVisible } = useLotusUtils();
  const queueOffset = useRef(0);
  const { activeQueueId, setActiveQueueId } = useQueue();
  const { playing } = useIsPlaying()
  const [currentArticleId, setCurrentArticleId] = React.useState<string | null>(null);
	const {lightFeedback, mediumFeedback, successFeedback} = useLotusHaptic();
  const { audiobooks } = useLotusAudiobook();
  const [contentType, setContentType] = React.useState<'liner_notes'|'books'|'docu_series'>('liner_notes');
  const [hasSavedProgress, setHasSavedProgress] = React.useState(false);

  // 🎯 SMART DATA LOADING: Load full data only when user wants to play
  const [needsFullLinerNoteData, setNeedsFullLinerNoteData] = React.useState(false);
  const [needsFullAudiobookData, setNeedsFullAudiobookData] = React.useState(false);
  
  // Full data queries (only run when needed for playback)
  const fullLinerNoteData = useQuery(
    api.articles.getLinerNotesWithSeasonMetadata,
    needsFullLinerNoteData ? { limit: 100 } : "skip"
  );
  const fullAudiobookData = useQuery(
    api.articles.getAudiobooksWithMetadata,
    needsFullAudiobookData ? { limit: 100 } : "skip"
  );

  // Add these new states and refs
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollX = useRef(new ReactNativeAnimated.Value(0)).current;
  const { width: screenWidth } = Dimensions.get('window');
  const [articleIndex, setArticleIndex] = React.useState(0);

  // Create a dynamic data structure based on the current article
  const currentContentData = React.useMemo(() => {
    // Use full data if available, otherwise use light data for browsing
    const items = contentType === 'liner_notes' 
      ? (fullLinerNoteData && fullLinerNoteData.length > 0 ? fullLinerNoteData : linerNoteArticles)
      : (fullAudiobookData && fullAudiobookData.length > 0 ? fullAudiobookData : audiobooks);
    
    const currentItem = items?.[articleIndex];
    
    // 🎯 REVERSE: Reverse the chapters order for liner_notes only
    const chapters = currentItem?.chapters;
    // const reversedChapters = contentType === 'liner_notes' && chapters 
    //   ? [...chapters].reverse() 
    //   : chapters;
    
    return {
      items,
      chapters: chapters,
      currentItem,
      hasFullData: contentType === 'liner_notes' ? !!fullLinerNoteData : !!fullAudiobookData
    }
  }, [linerNoteArticles, audiobooks, fullLinerNoteData, fullAudiobookData, articleIndex, contentType])

  // Progress tracking for current content
  const progressTracking = useProgressTracking({
    contentType: contentType === 'liner_notes' ? 'liner_note' : 'audiobook',
    contentId: currentContentData.currentItem?._id || '',
    contentName: currentContentData.currentItem?.name || currentContentData.currentItem?.audiobook_name,
  });

  // Check for saved progress when content changes
  useEffect(() => {
    const checkProgress = async () => {
      if (currentContentData.currentItem?._id) {
        const savedProgress = await progressTracking.loadSavedProgress();
        setHasSavedProgress(!!savedProgress && savedProgress.position_seconds > 30); // Only show if more than 30 seconds
      } else {
        setHasSavedProgress(false);
      }
    };
    checkProgress();
  }, [currentContentData.currentItem?._id, progressTracking.loadSavedProgress]);

  // Function to resume from saved progress
  const handleResumeFromSaved = async () => {
    const currentItem = currentContentData.currentItem;
    if (!currentItem) return;

    // Reset and load content like normal play
    await TrackPlayer.reset();
    await clearLastActiveTrack();

    const tracksWithContentType = currentItem.chapters.map((chapterTrack: Track) => ({ 
      ...chapterTrack,
      contentType: contentType,
      contentId: currentItem._id,
      parentContentName: currentItem.name || currentItem.audiobook_name
    }));
    await TrackPlayer.add(tracksWithContentType);

    // Load saved progress and seek to position
    const savedProgress = await progressTracking.loadSavedProgress();
    if (savedProgress) {
      // If saved progress has a specific chapter, jump to that chapter first
      if (savedProgress.chapter_index !== undefined && savedProgress.chapter_index > 0) {
        await TrackPlayer.skip(savedProgress.chapter_index);
      }
      
      // Seek to saved position
      await TrackPlayer.seekTo(savedProgress.position_seconds);
      setLastActiveTrack(currentItem.chapters[savedProgress.chapter_index || 0]);
    }

    await TrackPlayer.play();
    setActiveQueueId(generateTracksListId('songs', currentItem._id));
    setCurrentArticleId(currentItem._id);

    successFeedback();
  };

  // Check if the current linerNoteSeason is playing
  useEffect(() => {
    const checkPlaybackState = async () => {
      if (playbackState.state === State.Playing &&
        currentArticleId === linerNoteArticles?.[articleIndex]?.id) {
      } else if (playbackState.state !== State.Playing) {
      }
    };

    checkPlaybackState();
  }, [playbackState, articleIndex, currentArticleId, linerNoteArticles]);

  // Function to play or pause the current linerNoteSeason
  const handlePlayPauseArticle = async () => {
    const currentItem = currentContentData.currentItem;
    // console.log("Current Item:", currentItem);

    if (!currentItem) {
      // console.log("No current item found");
      return;
    }

    // 🎯 SMART LOADING: Load full data with chapters only when user wants to play
    if (!currentContentData.hasFullData) {
      console.log('🎯 Loading full chapter data for playback...');
      if (contentType === 'liner_notes') {
        setNeedsFullLinerNoteData(true);
      } else {
        setNeedsFullAudiobookData(true);
      }
      // Wait for data to load before proceeding
      mediumFeedback();
      return;
    }

    // Check if we have chapters now
    if (!currentItem.chapters || currentItem.chapters.length === 0) {
      console.log('⚠️ No chapters available yet, please try again');
      return;
    }

    const queueId = generateTracksListId('songs', currentItem._id);
    // console.log("Generated queue ID:", queueId);
    // console.log("Current playback state:", { playing, currentArticleId });

    if (playing && currentArticleId === currentItem._id) {
      // If already playing this item, pause it
      // console.log("Pausing current item");
      await TrackPlayer.pause();
    } else if (currentArticleId === currentItem._id) {
      // If this item is loaded but paused, resume
      // console.log("Resuming paused item");
      await TrackPlayer.play();
    } else {
      // Load and play this item
      // console.log("Loading and playing new item");
      // console.log("Resetting track player");
      await TrackPlayer.reset();
      await clearLastActiveTrack();

      // console.log("Adding chapters to track player:", currentItem.chapters);
      const tracksWithContentType = currentItem.chapters.map((chapterTrack: Track) => ({ 
        ...chapterTrack,
        contentType: contentType,
        contentId: currentItem._id,
        parentContentName: currentItem.name || currentItem.audiobook_name
      }));
      await TrackPlayer.add(tracksWithContentType);

      // 🎯 NEW: Check for saved progress and resume if available
      const savedProgress = progressTracking.getCurrentProgress();
      let startFromSavedPosition = false;
      
      if (savedProgress && savedProgress.position_seconds > 30) {
        console.log('📍 Found saved progress, resuming from:', savedProgress.position_seconds);
        
        // If saved progress has a specific chapter, jump to that chapter first
        if (savedProgress.chapter_index !== undefined && savedProgress.chapter_index > 0) {
          await TrackPlayer.skip(savedProgress.chapter_index);
        }
        
        // Seek to saved position
        await TrackPlayer.seekTo(savedProgress.position_seconds);
        startFromSavedPosition = true;
      }

      // console.log("Starting playback");
      await TrackPlayer.play();

      // console.log("Updating queue ID:", queueId);
      setActiveQueueId(queueId);

      // console.log("Setting current item ID:", currentItem.id);
      setCurrentArticleId(currentItem._id);

      // Set the first track as last active track
      if (currentItem.chapters.length > 0) {
        // console.log("Setting last active track:", currentItem.chapters[0]);
        const activeChapterIndex = savedProgress?.chapter_index || 0;
        setLastActiveTrack(currentItem.chapters[activeChapterIndex]);
      }

      if (startFromSavedPosition) {
        // console.log('✅ Resumed from saved position successfully');
      }
    }

    mediumFeedback();
  };

  const handleScroll = ReactNativeAnimated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const handleMomentumScrollEnd = async (e: any) => {
    const newPosition = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
    if (newPosition > articleIndex) {
      await setStateAsync(setArticleIndex, newPosition, 'affectsSomethingVisual');
      await TrackPlayer.reset();
      await TrackPlayer.setQueue([]);
      if (playing) {
        await TrackPlayer.pause();
      }
      clearLastActiveTrack();
      setCurrentArticleId(null);
      setActiveQueueId(null);
    } else if (newPosition < articleIndex) {
      await setStateAsync(setArticleIndex, newPosition, 'affectsSomethingVisual');
      await TrackPlayer.reset();
      await TrackPlayer.setQueue([]);
      if (playing) {
        await TrackPlayer.pause();
      }
      clearLastActiveTrack();
      await setStateAsync(setCurrentArticleId, null, 'backendData')
      await setStateAsync(setActiveQueueId, null, 'backendData')
    }

    lightFeedback();
  };

  const handlePress = () => {
    router.back();
    lightFeedback();
  }

  interface Section {
    id: string;
    type: 'display-name' | 'audioLiterature-cover' | 'audioLiterature-chapters' | 'observer';
    data?: LotusArticle[];
  }

  // Create sections for the FlatList with explicit typing
  const sections: Section[] = [
    { id: 'display-name', type: 'display-name' },
    { id: 'audioLiterature-cover', type: 'audioLiterature-cover' },
    { id: 'audioLiterature-chapters', type: 'audioLiterature-chapters' },
  ];

  const linerNoteSeasonCategories = [
    'Lotus Liner Notes',
  ]

  return (
    <>
      <View style={styles.container}>

        <FlatList
          data={sections}
          renderItem={({ item }: { item: Section }) => {
            switch (item.type) {
              case 'display-name':
                return (
                  <>
                    <View style={{ marginTop: 100}}>
                    <Animated.View style={{ paddingHorizontal: 20, height: 140, justifyContent: 'flex-end' }} entering={FadeInUp.duration(600)} exiting={FadeInDown.duration(600)}>
                      <TouchableOpacity style={{ opacity: 0.5 }} onPress={handlePress}>
                        <FontAwesome color={colors.readioWhite} size={20} name='chevron-left' />
                      </TouchableOpacity>
                      <LotusPageDisplayName title={shortLengthArticle_Name} />
                    </Animated.View>

                    <LotusButtonSelectGroup 
                    // REVIEW HIDING AUDIOBOOKS FOR NOW
                      buttons={['Articles']}
                      // buttons={['Articles', 'Books']}
                      activeButton={contentType === 'liner_notes' ? 'Articles' : 'Books'}
                      onButtonPress={(buttonPressed) => {
                        lightFeedback();
                        if (buttonPressed === 'Articles') {
                          setContentType('liner_notes');
                        } else if (buttonPressed === 'Books') {
                          setContentType('books');
                        }
                        // Add more else if blocks here if you introduce more content types
                        setArticleIndex(0); // Reset index when type changes
                      }}                      containerStyle={{
                        alignSelf: 'center',
                      }}
                    />

                  {/* NOTE INDEX LINER NOTE COUNTER SMALL CIRCLES */}
                      <View style={{ padding: 5, marginVertical: 10, display: 'flex', flexDirection: 'row', alignSelf: 'center', alignContent: 'center', justifyContent: 'center', backgroundColor: colors.readioBlack, borderRadius: 10 }}>
                        {(currentContentData.items || []).length > 0 && (currentContentData.items || []).map((item: any, index: number) => (
                          <View key={index} style={{
                            width: 10,
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: index === articleIndex ? colors.readioOrange : colors.readioWhite,
                            opacity: index === articleIndex ? 1 : 0.4,
                            marginHorizontal: 5
                          }}></View>
                        ))}
                      </View>

                    </View>
                  </>
                );
              case 'audioLiterature-cover':
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

                      {currentContentData.items && currentContentData.items.length > 0 && currentContentData.items.map((item: any, index: number) => (
                        <View key={index} style={[styles.audiobookCoverContainer, { width: screenWidth }]}>
                          <View style={styles.audiobookCoverContainer}>
                          
                          {/* NOTE: THE COVER IMAGE and PLAY BUTTON */}
                          <LotusUpgradeBlur intensity={0} show={contentType === 'books' ? !userIsOnPremiumPlan : (!userIsSubscribed)}>
                              <View style={styles.audiobookImageContainer}>
                                {/* // NOTE: THE SEASON IMAGE */}
                                <LotusImageWithLoader
                                    source={{ uri: contentType === 'liner_notes' ? item.season_image : item.audiobook_image }}
                                    style={styles.audiobookImage}
                                    resizeMode='cover'                              
                                />
                                <View style={{
                                  position: 'absolute',
                                  bottom: 0,
                                  paddingHorizontal: 20,
                                  width: '100%',
                                  height: 80,
                                  display: 'flex',
                                  flexDirection: 'row',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  zIndex: 2
                                }}>
                                  <View style={{ flex: 1, gap: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
                                    {/* NOTE THE SEASON NAME */}
                                    <Text  allowFontScaling={false} style={styles.audiobookTitle}></Text>
                                    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                                      {/* Resume button - only show if there's saved progress */}
                                      {hasSavedProgress && (
                                        <TouchableOpacity
                                          activeOpacity={0.7}
                                          onPress={handleResumeFromSaved}
                                          style={{
                                            padding: 8,
                                            backgroundColor: colors.readioWhite,
                                            borderRadius: 20,
                                            width: 35,
                                            height: 35,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                          }}
                                        >
                                          <Ionicons
                                            name="bookmark"
                                            size={16}
                                            color={colors.readioOrange}
                                          />
                                        </TouchableOpacity>
                                      )}
                                      
                                      {/* Play/Pause button */}
                                      <TouchableOpacity
                                        activeOpacity={0.7}
                                        onPress={() => {
                                          // console.log("Play button pressed");
                                          handlePlayPauseArticle();
                                        }}
                                        style={{
                                          padding: 10,
                                          backgroundColor: colors.readioOrange,
                                          borderRadius: 25,
                                          width: 40,
                                          height: 40,
                                          justifyContent: 'center',
                                          alignItems: 'center',
                                        }}
                                      >
                                        <Ionicons
                                          name={playing && currentArticleId === currentContentData.currentItem?.id ? "pause" : "play"}
                                          size={20}
                                          color={colors.readioWhite}
                                        />
                                      </TouchableOpacity>
                                    </View>
                                  </View>
                                </View>
                                {/* NOTE THE GRADIENT ON BOTTOM OF IMAGE */}
                                {/* <LinearGradient
                                  colors={[
                                    'rgba(45, 28, 22, 0)',
                                    'rgba(45, 28, 22, 0)',
                                    'rgba(45, 28, 22, 0)',
                                    colors.readioBrown
                                  ]}
                                  locations={[0, 0.4, 0.5, 1]}
                                  start={{ x: 0.5, y: 0 }}
                                  end={{ x: 0.5, y: 1 }}
                                  style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    width: '100%',
                                    height: '100%',
                                    zIndex: 1
                                  }}
                                /> */}
                              </View>
                            </LotusUpgradeBlur>
                          </View>
                          <View style={{ display: 'flex', paddingHorizontal: 35 }}>
                            {/* TODO */}
                            <Text  allowFontScaling={false} numberOfLines={4} style={[styles.audiobookArtist, { textAlign: 'center' }]}>
                              {contentType === 'liner_notes' ? item.season_description : item.audiobook_description}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                );
              case 'audioLiterature-chapters':
                return (
                  <>
                    {currentContentData.chapters && currentContentData.chapters.length > 0 && (
                      <LotusUpgradeBlur intensity={0} show={contentType === 'books' ? !userIsOnPremiumPlan : (!userIsSubscribed)}>
                      <View style={styles.tracksContainer}>
                        <ReadioTracksList
                          hideQueueControls
                          id={generateTracksListId('songs', currentContentData.currentItem?._id || '')}
                          tracks={currentContentData.chapters}
                          scrollEnabled={false}
                        />
                      </View>
                      </LotusUpgradeBlur>
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
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  albumCarouselContainer: {
    height: 350,
    width: '100%',
  },
  pagerView: {
    flex: 1,
    width: '100%',
  },
  audiobookCoverContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  audiobookImageContainer: {
    width: 250,
    height: 250,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: colors.readioBlack,
  },
  audiobookImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  audiobookTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.readioWhite,
    fontFamily: readioBoldFont,
  },
  audiobookArtist: {
    fontSize: 14,
    color: colors.readioDustyWhite,
    marginTop: 5,
    fontFamily: readioRegularFont,
  },
  tracksContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.readioWhite,
    marginBottom: 20,
    fontFamily: readioBoldFont,
  },
  trackItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.readioWhite}20`,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 16,
    color: colors.readioWhite,
    fontFamily: readioBoldFont,
  },
  trackArtist: {
    fontSize: 14,
    color: colors.readioDustyWhite,
    marginTop: 4,
    fontFamily: readioRegularFont,
  },
  trackDuration: {
    fontSize: 14,
    color: colors.readioDustyWhite,
    fontFamily: readioRegularFont,
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    // alignItems: 'center',
    backgroundColor: colors.readioBrown,
    width: "100%",
    justifyContent: "space-between",
    flex: 1,
    // marginTop: 100,
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: `${colors.readioWhite}50`,
    marginVertical: 20
  },
  fullScrollView: {
    flexGrow: 1,
    width: "100%"
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
    fontFamily: readioBoldFont,
    paddingHorizontal: 20,
  },
  bettertittle: {
    fontSize: 35,
    fontWeight: 'bold',
    fontFamily: giantFont,
    color: colors.readioWhite,
    paddingHorizontal: 20,
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
    minHeight: 'auto',  // Changed from height: 'auto'
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 15,
    backgroundColor: "transparent",
    paddingHorizontal: 20,
    flex: 1,  // Add this
    alignContent: 'flex-start',  // Add this
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
    // backgroundColor: colors.readioWhite,
    backgroundColor: colors.readioBlack,
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
