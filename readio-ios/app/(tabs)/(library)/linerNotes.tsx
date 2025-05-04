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
import TrackPlayer, { State, useIsPlaying, usePlaybackState } from 'react-native-track-player';
import { LotusPageDisplayName } from '@/components/LotusPageDisplayName';
import { LotusButtonSelectGroup } from '@/components/LotusButtonSelectGroup';
import { useLotusAudiobook } from '@/helpers/providers/lotusAudiobookProvider';
import { useLotusUser } from '@/helpers/providers/lotusUserContext';
import Animated, { FadeInUp, FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import { shortLengthArticle_Name, shortLengthArticle_Name_DB } from '@/constants/tokens';
import LotusImageWithLoader from '@/components/LotusImageWithLoader';
import { useLotusHaptic } from '@/helpers/providers/lotusHapticProvider';



export default function LinerNotesPage() {
  const playbackState = usePlaybackState();
  const { linerNoteArticles } = useLotusUser();
  const { lastActiveTrack, clearLastActiveTrack, setLastActiveTrack } = useLastActiveTrack();
  const { floatingPlayerIsVisible } = useLotusUtils();
  const queueOffset = useRef(0);
  const { activeQueueId, setActiveQueueId } = useQueue();
  const { playing } = useIsPlaying()
  const [currentLinerNoteSeasonId, setCurrentLinerNoteSeasonId] = React.useState<string | null>(null);
	const {lightFeedback, mediumFeedback, successFeedback} = useLotusHaptic();

  // Add these new states and refs
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollX = useRef(new ReactNativeAnimated.Value(0)).current;
  const { width: screenWidth } = Dimensions.get('window');
  const [linerNoteSeasonIndex, setLinerNoteSeasonIndex] = React.useState(0);

  // Check if the current linerNoteSeason is playing
  useEffect(() => {
    const checkPlaybackState = async () => {
      if (playbackState.state === State.Playing &&
        currentLinerNoteSeasonId === linerNoteArticles?.[linerNoteSeasonIndex]?.id) {
      } else if (playbackState.state !== State.Playing) {
      }
    };

    checkPlaybackState();
  }, [playbackState, linerNoteSeasonIndex, currentLinerNoteSeasonId, linerNoteArticles]);

  // Function to play or pause the current linerNoteSeason
  const handlePlayPauseLinerNoteSeason = async () => {
    const currentLinerNoteSeason = linerNoteArticles?.[linerNoteSeasonIndex];
    console.log("Current Liner Note Season:", currentLinerNoteSeason);

    // TODO
    if (!currentLinerNoteSeason) {
      console.log("No current Liner Note Season found:", currentLinerNoteSeason);
      return;
    }

    const queueId = generateTracksListId('songs', currentLinerNoteSeason.id);
    console.log("Generated queue ID:", queueId);
    console.log("Current playback state:", { playing, currentLinerNoteSeasonId });

    if (playing && currentLinerNoteSeasonId === currentLinerNoteSeason.id) {
      // If already playing this linerNoteSeason, pause it
      console.log("Pausing current Liner Note Season");
      await TrackPlayer.pause();
    } else if (currentLinerNoteSeasonId === currentLinerNoteSeason.id) {
      // If this linerNoteSeason is loaded but paused, resume
      console.log("Resuming paused Liner Note Season");
      await TrackPlayer.play();
    } else {
      // Load and play this linerNoteSeason
      console.log("Loading and playing new Liner Note Season");
      console.log("Resetting track player");
      await TrackPlayer.reset();
      await clearLastActiveTrack();

      // TODO  
      console.log("Adding songs to track player:", currentLinerNoteSeason.chapters);
      await TrackPlayer.add(currentLinerNoteSeason.chapters);

      console.log("Starting playback");
      await TrackPlayer.play();

      console.log("Updating queue ID:", queueId);
      setActiveQueueId(queueId);

      console.log("Setting current album ID:", currentLinerNoteSeason.id);
      setCurrentLinerNoteSeasonId(currentLinerNoteSeason.id);

      // TODO
      // Set the first track as last active track
      if (currentLinerNoteSeason.chapters.length > 0) {
        console.log("Setting last active track:", currentLinerNoteSeason.chapters[0]);
        setLastActiveTrack(currentLinerNoteSeason.chapters[0]);
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
    if (newPosition > linerNoteSeasonIndex) {
      await setStateAsync(setLinerNoteSeasonIndex, newPosition, 'affectsSomethingVisual');
      await TrackPlayer.reset();
      await TrackPlayer.setQueue([]);
      if (playing) {
        await TrackPlayer.pause();
      }
      clearLastActiveTrack();
      setCurrentLinerNoteSeasonId(null);
      setActiveQueueId(null);
    } else if (newPosition < linerNoteSeasonIndex) {
      await setStateAsync(setLinerNoteSeasonIndex, newPosition, 'affectsSomethingVisual');
      await TrackPlayer.reset();
      await TrackPlayer.setQueue([]);
      if (playing) {
        await TrackPlayer.pause();
      }
      clearLastActiveTrack();
      await setStateAsync(setCurrentLinerNoteSeasonId, null, 'backendData')
      await setStateAsync(setActiveQueueId, null, 'backendData')
    }
    lightFeedback();
  };

  const handlePress = () => {
    router.back();
  }

  interface Section {
    id: string;
    type: 'display-name' | 'linerNoteSeason-cover' | 'linerNoteSeason-chapters' | 'observer';
    data?: LotusArticle[];
  }

  // Create sections for the FlatList with explicit typing
  const sections: Section[] = [
    { id: 'display-name', type: 'display-name' },
    { id: 'linerNoteSeason-cover', type: 'linerNoteSeason-cover' },
    { id: 'linerNoteSeason-chapters', type: 'linerNoteSeason-chapters' },
  ];

  const linerNoteSeasonCategories = [
    'Lotus Liner Notes',
  ]


  // Create a dynamic data structure based on the current music category
  const currentLinerNoteSeasonData = React.useMemo(() => {
    
    console.log("Current Liner Note Season Index:", linerNoteSeasonIndex);
    
    console.log('all linernote 1 name', linerNoteArticles?.[0]?.name)
    console.log('all linernote 2 name', linerNoteArticles?.[1]?.name)
    console.log('all linernote 3 name', linerNoteArticles?.[2]?.name)

    return {
          linerNoteSeasons: linerNoteArticles,
          linerNoteChapters: linerNoteArticles?.[linerNoteSeasonIndex]?.chapters
        }
  }, [linerNoteArticles, linerNoteSeasonIndex])

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
                    <Animated.View style={{ paddingHorizontal: 20, height: 140, justifyContent: 'flex-end' }} entering={FadeInUp.duration(600)} exiting={FadeInDown.duration(600)}>
                      <TouchableOpacity style={{ opacity: 0.5 }} onPress={handlePress}>
                        <FontAwesome color={colors.readioWhite} size={20} name='chevron-left' />
                      </TouchableOpacity>
                      <LotusPageDisplayName title={shortLengthArticle_Name} />
                    </Animated.View>

                      {/* <LotusButtonSelectGroup 
                    buttons={audiobookCategories}
                    activeButton={currentAudiobookCategory}
                    onButtonPress={setCurrentAudiobookCategory}
                    containerStyle={{
                      alignSelf: 'center',
                    }}
                  /> */}

                  {/* NOTE INDEX LINER NOTE COUNTER SMALL CIRCLES */}
                      <View style={{ padding: 5, marginVertical: 10, display: 'flex', flexDirection: 'row', alignSelf: 'center', alignContent: 'center', justifyContent: 'center', backgroundColor: colors.readioBlack, borderRadius: 10 }}>
                        {currentLinerNoteSeasonData.linerNoteSeasons?.map((season: any, index: number) => (
                          <View key={index} style={{
                            width: 10,
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: season?.id === linerNoteSeasonIndex + 1 ? colors.readioOrange : colors.readioWhite,
                            opacity: season?.id === linerNoteSeasonIndex + 1 ? 1 : 0.4,
                            marginHorizontal: 5
                          }}></View>
                        ))}
                      </View>

                    </View>
                  </>
                );
              case 'linerNoteSeason-cover':
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

                      {currentLinerNoteSeasonData.linerNoteSeasons?.length > 0 && currentLinerNoteSeasonData.linerNoteSeasons?.map((season: any, index: number) => (
                        <View key={index} style={[styles.audiobookCoverContainer, { width: screenWidth }]}>
                          <View style={styles.audiobookCoverContainer}>
                            <View style={styles.audiobookImageContainer}>
                              <Image
                                source={{ uri: getLocalImageUri('filter') }}
                                style={[styles.audiobookImage, { zIndex: 1, opacity: 0.4 }]}
                                resizeMode='cover'
                              />
                              {/* // NOTE: THE SEASON IMAGE */}
                              <LotusImageWithLoader
                                  source={{ uri: season.seasonImage }}
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
                                  <Text style={styles.audiobookTitle}>{season.name}</Text>
                                  <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() => {
                                      console.log("Play button pressed");
                                      handlePlayPauseLinerNoteSeason();
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
                                      name={playing && currentLinerNoteSeasonId === season.id ? "pause" : "play"}
                                      size={20}
                                      color={colors.readioWhite}
                                    />
                                  </TouchableOpacity>
                                </View>
                              </View>
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
                                style={{
                                  position: 'absolute',
                                  bottom: 0,
                                  width: '100%',
                                  height: '100%',
                                  zIndex: 1
                                }}
                              />
                            </View>
                          </View>
                          <View style={{ display: 'flex', paddingHorizontal: 35 }}>
                            {/* TODO */}
                            <Text numberOfLines={3} style={[styles.audiobookArtist, { textAlign: 'center' }]}>
                              {season.season_description}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                );
              case 'linerNoteSeason-chapters':
                return (
                  <>
                    {currentLinerNoteSeasonData.linerNoteChapters && currentLinerNoteSeasonData.linerNoteChapters.length > 0 && (
                      <View style={styles.tracksContainer}>
                        <ReadioTracksList
                          hideQueueControls
                          id={generateTracksListId('songs', '')}
                          tracks={currentLinerNoteSeasonData.linerNoteChapters}
                          scrollEnabled={false}
                        />
                      </View>
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
    height: 320,
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
});