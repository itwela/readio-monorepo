import LotusGap from '@/components/LotusGap';
import { ReadioTracksList } from '@/components/ReadioTrackList';
import { getLocalImageUri } from '@/constants/imageAssets';
import { colors, giantFont, readioBoldFont, readioRegularFont } from "@/constants/tokens";
import { setStateAsync } from '@/constants/utilityFunctions';
import { generateTracksListId } from '@/helpers/misc';
import { useLotusUtils } from '@/helpers/providers/lotusUtilsContext';
import { useLastActiveTrack } from '@/hooks/useLastActiveTrack';
import { useQueue } from '@/store/queue';
import { LotusArticle } from '@/types/type';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated as ReactNativeAnimated, Dimensions, FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import TrackPlayer, { State, useIsPlaying, usePlaybackState } from 'react-native-track-player';
import { LotusPageDisplayName } from '@/components/LotusPageDisplayName';
import { LotusButtonSelectGroup } from '@/components/LotusButtonSelectGroup';
import { router } from 'expo-router';
import Animated, { FadeInUp, FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { Audiobook, Chapter, useLotusAudiobook } from '@/helpers/providers/lotusAudiobookProvider';
import LotusImageWithLoader from '@/components/LotusImageWithLoader';
import { useLotusHaptic } from '@/helpers/providers/lotusHapticProvider';

export default function AudioBooksPage() {
  const playbackState = usePlaybackState();
  const { audiobooks } = useLotusAudiobook();
  
  const { lastActiveTrack, clearLastActiveTrack, setLastActiveTrack } = useLastActiveTrack();
  const { floatingPlayerIsVisible } = useLotusUtils();
  const queueOffset = useRef(0);
  const { activeQueueId, setActiveQueueId } = useQueue();
  const { playing } = useIsPlaying();
  const [currentAudiobookId, setCurrentAudiobookId] = React.useState<string | null>(null);
	const {lightFeedback, mediumFeedback, successFeedback} = useLotusHaptic();

  // Add these new states and refs
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollX = useRef(new ReactNativeAnimated.Value(0)).current;
  const { width: screenWidth } = Dimensions.get('window');
  const [audiobookIndex, setAudiobookIndex] = React.useState(0);

  // Check if the current album is playing
  useEffect(() => {
    const checkPlaybackState = async () => {
      if (playbackState.state === State.Playing && 
          currentAudiobookId === (audiobooks?.[audiobookIndex]?.id || null)) {
        // Current audiobook is playing
      } else if (playbackState.state !== State.Playing) {
        // Not playing
      }
    };
    
    checkPlaybackState();
  }, [playbackState, audiobookIndex, currentAudiobookId, audiobooks]);

  // Function to play or pause the current audiobook
  const handlePlayPauseAudiobook = async () => {
    const currentAudiobook = audiobooks?.[audiobookIndex];
    console.log("Current audiobook:", currentAudiobook);
    
    if (!currentAudiobook) {
      console.log("No current audiobook found");
      return;
    }
    
    const queueId = generateTracksListId('songs', String(currentAudiobook.id));
    console.log("Generated queue ID:", queueId);
    console.log("Current playback state:", { playing, currentAudiobookId });
    
    try {
      if (playing && currentAudiobookId === String(currentAudiobook.id)) {
        // If already playing this audiobook, pause it
        console.log("Pausing current audiobook");
        await TrackPlayer.pause();
      } else if (currentAudiobookId === String(currentAudiobook.id)) {
        // If this audiobook is loaded but paused, resume
        console.log("Resuming paused audiobook");
        await TrackPlayer.play();
      } else {
        // Load and play this audiobook
        console.log("Loading and playing new audiobook");
        console.log("Resetting track player");
        await TrackPlayer.reset();
        await clearLastActiveTrack();

        
        const chapters = currentAudiobook.chapters || [];
        
        if (chapters.length === 0) {
          console.error("No chapters found for playback");
          Alert.alert("Playback Error", "No chapters found for this audiobook.");
          return;
        }
        
        console.log("Adding songs to track player:", chapters);
        await TrackPlayer.add(chapters);
        
        console.log("Starting playback");
        await TrackPlayer.play();
        
        console.log("Updating queue ID:", queueId);
        setActiveQueueId(queueId);
        
        console.log("Setting current audiobook ID:", currentAudiobook.id);
        setCurrentAudiobookId(String(currentAudiobook.id));
        
        // Set the first track as last active track
        if (chapters.length > 0) {
          console.log("Setting last active track:", chapters[0]);
          setLastActiveTrack?.(chapters[0]);
        }
      }
    } catch (error) {
      console.error("Playback operation failed:", error);
      Alert.alert("Playback Error", "Failed to play audiobook. Please try again.");
    }

    mediumFeedback();

  };

  // Handle scroll events in the carousel
  const handleScroll = ReactNativeAnimated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  // Handle carousel page changes
  const handleMomentumScrollEnd = async (e: any) => {
    const newPosition = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
    
    if (newPosition !== audiobookIndex) {
      await setStateAsync(setAudiobookIndex, newPosition, 'affectsSomethingVisual');
      
      // Reset playback when changing audiobooks
      await TrackPlayer.reset();
      
      if (playing) {
        await TrackPlayer.pause();
      }
      
      clearLastActiveTrack();
      setCurrentAudiobookId(null);
      setActiveQueueId(null);
    }

    lightFeedback();
  };

  const handlePress = () => {
    router.back();
  };

  interface Section {
    id: string;
    type: 'display-name' | 'audiobook-cover' | 'audiobook-chapters' | 'observer';
    data?: LotusArticle[];
  }

  // Create sections for the FlatList with explicit typing
  const sections: Section[] = [
    { id: 'display-name', type: 'display-name' },
    { id: 'audiobook-cover', type: 'audiobook-cover' },
    { id: 'audiobook-chapters', type: 'audiobook-chapters' },
  ];

  const audiobookCategories = [
    'Wellness',
    // 'Instrumentals',
  ];

  const [currentAudiobookCategory, setCurrentAudiobookCategory] = React.useState(audiobookCategories[0] || '');

  // Create a dynamic data structure based on the current music category
  const currentAudiobookData = React.useMemo(() => {
    switch (currentAudiobookCategory) {
      case 'Wellness':
        return {
          audiobooks: audiobooks || [],
          chapters: audiobooks?.[audiobookIndex]?.chapters || []
        }
      default:
        return {
            audiobooks: [],
            chapters: []
        }
    }
  }, [currentAudiobookCategory, audiobooks, audiobookIndex]);

  // NOTE Custom play button component
  const PlayButton = ({ audiobook }: { audiobook: Audiobook | undefined }) => {
    if (!audiobook) return null;
    
    const audiobookId = audiobook.id;
    
    return (
      <TouchableOpacity 
        activeOpacity={0.7}
        onPress={() => handlePlayPauseAudiobook()}
        style={styles.playDownloadButton}
      >
        <Ionicons 
          name={playing && currentAudiobookId === String(audiobookId) ? "pause" : "play"} 
          size={20} 
          color={colors.readioWhite} 
        />
      </TouchableOpacity>
    );
  };

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
                <View style={{ marginTop: 120}}>
                
                {/* NOTE DISPLAY NAME - AUDIO BOOKS */}
                <Animated.View style={{ paddingHorizontal: 20, height: 140, justifyContent: 'flex-end' }} entering={FadeInUp.duration(600)} exiting={FadeInDown.duration(600)}>
                      <TouchableOpacity style={{ opacity: 0.5 }} onPress={handlePress}>
                        <FontAwesome color={colors.readioWhite} size={20} name='chevron-left' />
                      </TouchableOpacity>
                  <LotusPageDisplayName title="AUDIO BOOKS" />
                </Animated.View>

                  {/* NOTE SELECT BUTTONS - (WELLNESS, ETC) */}
                  <LotusButtonSelectGroup 
                    buttons={audiobookCategories}
                    activeButton={currentAudiobookCategory}
                    onButtonPress={setCurrentAudiobookCategory}
                    containerStyle={{
                      alignSelf: 'center',
                    }}
                  />

                  {/* NOTE INDEX AUDIOBOOK COUNTER SMALL CIRCLES */}
                  <View style={{padding: 5, marginVertical: 10, display: 'flex', flexDirection: 'row', alignSelf: 'center', alignContent: 'center', justifyContent: 'center', backgroundColor: colors.readioBlack, borderRadius: 10}}>
                    {currentAudiobookData.audiobooks.map((audiobook: Audiobook, index: number) => (
                      <View key={index} style={[styles.indexAudiobookCounterContainer, {
                        backgroundColor: audiobook.id === audiobookIndex ? colors.readioOrange : colors.readioWhite,
                        opacity: audiobook.id === (audiobookIndex + 1) ? 1 : 0.4,
                      }]}></View>
                    ))}
                  </View>
                </View>
                </>
              );
            case 'audiobook-cover':
              return (
                <View style={styles.albumCarouselContainer}>
                  {/* NOTE SCROLLVIEW CONTAINER */}
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
                    
                    {currentAudiobookData.audiobooks.length > 0 && currentAudiobookData.audiobooks.map((audiobook: Audiobook, index: number) => (
                      <View key={index} style={[styles.audiobookCoverContainer, { width: screenWidth }]}>
                        <View key={audiobook.id} style={styles.audiobookCoverContainer}>
                          
                          {/* NOTE AUDIOBOOK IMAGE + TITLE AND BUTTON CONTAINER */}
                          <View style={styles.audiobookImageContainer}>
                              
                              {/* NOTE IMAGE FILTER */}
                            <LotusImageWithLoader 
                              source={{ uri: getLocalImageUri('filter') || '' }} 
                              style={[styles.audiobookImage, { zIndex: 1, opacity: 0.4 }]} 
                              resizeMode='cover' 
                            />
                              {/* NOTE AUDIOBOOK FILTER */}
                            <LotusImageWithLoader 
                              source={{ uri: audiobook.audiobook_image }} 
                              style={styles.audiobookImage} 
                              resizeMode='cover' 
                            />

                              {/* NOTE BUTTON AND TITLE CONTAINER */}
                            <View style={styles.buttonandTitleContainer}>
                              <View style={{flex: 1, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between'}}>
                                <Text style={styles.audiobookTitle}>{audiobook.audiobook_name}</Text>
                                <PlayButton audiobook={audiobook} />
                              </View>
                            </View>

                            {/* NOTE GRADIENT */}
                            <LinearGradient
                              colors={[
                                'rgba(45, 28, 22, 0)',
                                'rgba(45, 28, 22, 0)',
                                'rgba(45, 28, 22, 0)',
                                colors.readioBrown
                              ]}
                              locations={[0, 0.4, 0.5, 1]}
                              start={{ x: 0.5, y: 0 }}
                              end={{ x: 0.5, y: 1 }}
                              style={styles.gradientStyle}
                            />

                          </View>

                        </View>

                        {/* NOTE AUDIOBOOK DESCRIPTION */}
                        <View style={{display: 'flex', paddingHorizontal: 35}}>
                          <Text numberOfLines={5} style={[styles.audiobookArtist, {textAlign: 'center'}]}>
                            {audiobook.audiobook_description}
                          </Text>
                        </View>

                      </View>
                    ))}
                  </ScrollView>
                </View>
              );
            case 'audiobook-chapters':
              return (
                <>
                {currentAudiobookData.chapters.length > 0 && (
                  <View style={styles.tracksContainer}>
                    <View style={styles.chapterHeaderContainer}>
                      <Text style={styles.chapterHeaderTitle}>Chapters</Text>
                    </View>
                    <ReadioTracksList 
                      hideQueueControls 
                      id={generateTracksListId('songs', '')} 
                      tracks={currentAudiobookData.chapters as any} 
                      scrollEnabled={false}
                    />
                  </View>
                )}
                <LotusGap backgroundColor='' gapNumber={floatingPlayerIsVisible ? 130 : 100}/>
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
    height: 320 + 40,
    width: '100%',
  },
  buttonandTitleContainer: {
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
  },
  gradientStyle: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 1
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
    backgroundColor: colors.readioWhite,
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
  playDownloadButton: {
    padding: 10,
    backgroundColor: colors.readioOrange,
    borderRadius: 25,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadInfo: {
    fontFamily: readioRegularFont,
    fontSize: 12,
    color: colors.readioWhite,
    opacity: 0.8,
    marginTop: 12,
    textAlign: 'center',
  },
  chapterHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  chapterHeaderTitle: {
    fontFamily: readioBoldFont,
    fontSize: 18,
    color: colors.readioWhite,
  },
  chapterHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chapterHeaderInfoText: {
    fontFamily: readioRegularFont,
    fontSize: 12,
    color: colors.readioWhite,
    marginLeft: 4,
  },
  managementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  managementButtonText: {
    fontFamily: readioRegularFont,
    fontSize: 12,
    color: colors.readioWhite,
    marginLeft: 4,
  },
  indexAudiobookCounterContainer: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5
  },
});