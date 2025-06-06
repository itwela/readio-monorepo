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
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import TrackPlayer, { State, Track, useIsPlaying, usePlaybackState } from 'react-native-track-player';
import { LotusPageDisplayName } from '@/components/LotusPageDisplayName';
import { LotusButtonSelectGroup } from '@/components/LotusButtonSelectGroup';
import LotusImageWithLoader from '@/components/LotusImageWithLoader';
import { useLotusHaptic } from '@/helpers/providers/lotusHapticProvider';
import { useLotusUser } from '@/helpers/providers/lotusUserContext';
import { LotusUpgradeBlur } from '@/components/LotusUpgradeBlur';

export default function FithopPage() {

  const playbackState = usePlaybackState();
  const { albums } = useLotusFithop();
  const { clearLastActiveTrack, setLastActiveTrack } = useLastActiveTrack();
  const { floatingPlayerIsVisible } = useLotusUtils();
  const queueOffset = useRef(0);
  const { activeQueueId, setActiveQueueId } = useQueue();
  const { playing } = useIsPlaying()
  const [currentAlbumId, setCurrentAlbumId] = React.useState<string | null>(null);
  const { lightFeedback, mediumFeedback, successFeedback } = useLotusHaptic();
  const { userIsSubscribed, userIsOnStarterPlan, userIsAdmin, userIsOnPremiumPlan } = useLotusUser();

  // Add these new states and refs
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const { width: screenWidth } = Dimensions.get('window');
  const [albumIndex, setAlbumIndex] = React.useState(0);

  const musicCategories = [
    'Fithop',
    // 'Instrumentals',
  ]

  const [currentMusicCategory, setCurrentMusicCategory] = React.useState(musicCategories?.[0])

  // Create a dynamic data structure based on the current music category
  const currentMusicData = React.useMemo(() => {
    switch (currentMusicCategory) {
      case 'Fithop':
        return {
          albums: albums,
          tracks: albums?.[albumIndex]?.album_songs || [] // Tracks now come with proper _id fields from the provider
        }
      // case 'Instrumentals':
      //   return {
      //     albums: [], // Add instrumental albums when available
      //     tracks: []
      //   }
      default:
        return {
          albums: [],
          tracks: []
        }
    }
  }, [currentMusicCategory, albums, albumIndex])

  // Check if the current album is playing
  useEffect(() => {
    const checkPlaybackState = async () => {
      if (playbackState.state === State.Playing &&
        currentAlbumId === albums?.[albumIndex]?._id) {
      } else if (playbackState.state !== State.Playing) {
      }
    };

    checkPlaybackState();
  }, [playbackState, albumIndex, currentAlbumId, albums]);

  // Function to play or pause the current album
  const handlePlayPauseAlbum = async () => {

    const currentAlbum = albums?.[albumIndex];
    // console.log("Current album:", currentAlbum);

    if (!currentAlbum || !currentMusicData.tracks || currentMusicData.tracks.length === 0) {
      // console.log("No current album or songs found:", currentAlbum);
      return;
    }

    const queueId = generateTracksListId('songs', currentAlbum._id);
    // console.log("Generated queue ID:", queueId);
    // console.log("Current playback state:", { playing, currentAlbumId });

    if (playing && currentAlbumId === currentAlbum._id) {
      // If already playing this album, pause it
      // console.log("Pausing current album");
      await TrackPlayer.pause();
    } else if (currentAlbumId === currentAlbum._id) {
      // If this album is loaded but paused, resume
      // console.log("Resuming paused album");
      await TrackPlayer.play();
    } else {
      // Load and play this album
      // console.log("Loading and playing new album");
      // console.log("Resetting track player");
      await TrackPlayer.reset();
      await clearLastActiveTrack();

      // console.log("Adding songs to track player:", currentMusicData.tracks);
      const tracksWithContentType = currentMusicData.tracks.map((track: any) => ({
        ...track,
        contentType: track.contentType || 'music' // Ensure contentType is set
      }));
      await TrackPlayer.add(tracksWithContentType);

      // console.log("Starting playback");
      await TrackPlayer.play();

      // console.log("Updating queue ID:", queueId);
      setActiveQueueId(queueId);

      // console.log("Setting current album ID:", currentAlbum._id);
      setCurrentAlbumId(currentAlbum._id);

      // Set the first track as last active track
      if (currentMusicData.tracks.length > 0) {
        // console.log("Setting last active track:", currentMusicData.tracks[0]);
        setLastActiveTrack(currentMusicData.tracks[0]);
      }
    }

    mediumFeedback();

  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const handleMomentumScrollEnd = async (e: any) => {

    const newPosition = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
    if (newPosition > albumIndex) {
      await setStateAsync(setAlbumIndex, newPosition, 'affectsSomethingVisual');
      await TrackPlayer.reset();
      await TrackPlayer.setQueue([]);
      if (playing) {
        await TrackPlayer.pause();
      }
      clearLastActiveTrack();
      setCurrentAlbumId(null);
      setActiveQueueId(null);
    } else if (newPosition < albumIndex) {
      await setStateAsync(setAlbumIndex, newPosition, 'affectsSomethingVisual');
      await TrackPlayer.reset();
      await TrackPlayer.setQueue([]);
      if (playing) {
        await TrackPlayer.pause();
      }
      clearLastActiveTrack();
      await setStateAsync(setCurrentAlbumId, null, 'backendData')
      await setStateAsync(setActiveQueueId, null, 'backendData')
    }

    lightFeedback();

    console.log('currentAlbumId', currentAlbumId)
    console.log('albumIndex', albumIndex)

  };

  interface Section {
    id: string;
    type: 'display-name' | 'album-cover' | 'album-tracks' | 'observer';
    data?: LotusArticle[];
  }

  // Create sections for the FlatList with explicit typing
  const sections: Section[] = [
    { id: 'display-name', type: 'display-name' },
    { id: 'album-cover', type: 'album-cover' },
    { id: 'album-tracks', type: 'album-tracks' },
  ];

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
                    <View style={{}}>
                      <LotusPageDisplayName title="MUSIC" />

                      <LotusButtonSelectGroup
                        buttons={musicCategories}
                        activeButton={currentMusicCategory}
                        onButtonPress={setCurrentMusicCategory}
                        containerStyle={{
                          alignSelf: 'center',
                        }}
                      />

                      <View style={{ padding: 5, marginVertical: 10, display: 'flex', flexDirection: 'row', alignSelf: 'center', alignContent: 'center', justifyContent: 'center', backgroundColor: colors.readioBlack, borderRadius: 10 }}>
                        {currentMusicData.albums?.map((album: any, index: number) => (
                          <View key={index} style={{
                            width: 10,
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: album?._id === currentAlbumId ? colors.readioOrange : colors.readioWhite,
                            opacity: index === albumIndex ? 1 : 0.4,
                            marginHorizontal: 5
                          }}></View>
                        ))}
                      </View>
                    </View>
                  </>
                );
              case 'album-cover':
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

                      {currentMusicData.albums?.length > 0 && currentMusicData.albums?.map((album: any, index: number) => (
                        <View key={index} style={[styles.albumCoverContainer, { width: screenWidth }]}>
                          <View key={album._id} style={styles.albumCoverContainer}>
                            {/* NOTE THE COVER IMAGE */}
                            <LotusUpgradeBlur intensity={0} show={!userIsSubscribed as boolean}>
                              <View style={styles.albumImageContainer}>
                                <LotusImageWithLoader
                                  source={{ uri: getLocalImageUri('filter') }}
                                  style={[styles.albumImage, { zIndex: 1, opacity: 0.4 }]}
                                  resizeMode='cover'
                                />
                                <LotusImageWithLoader
                                  source={{ uri: album.album_image }}
                                  style={styles.albumImage}
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
                                  <View style={{ flex: 1, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text allowFontScaling={false} style={styles.albumTitle}></Text>
                                    <TouchableOpacity
                                      activeOpacity={0.7}
                                      onPress={() => {
                                        // console.log("Play button pressed");
                                        handlePlayPauseAlbum();
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
                                        name={playing && currentAlbumId === album._id ? "pause" : "play"}
                                        size={20}
                                        color={colors.readioDustyWhite}
                                      />
                                    </TouchableOpacity>
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
                            <Text allowFontScaling={false} numberOfLines={3} style={[styles.albumArtist, { textAlign: 'center' }]}>
                              {album.album_name} - {album.album_description}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                );
              case 'album-tracks':
                return (
                  <>
                    {currentMusicData.tracks && currentMusicData.tracks.length > 0 && (
                      <LotusUpgradeBlur intensity={0} show={!userIsSubscribed as boolean}>
                        <View style={styles.tracksContainer}>
                          <ReadioTracksList
                            hideQueueControls
                            id={generateTracksListId('songs', '')}
                            tracks={currentMusicData.tracks}
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
  albumCoverContainer: {
    flex: 1,
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
  albumTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.readioWhite,
    fontFamily: readioBoldFont,
  },
  albumArtist: {
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
    marginTop: 100,
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
