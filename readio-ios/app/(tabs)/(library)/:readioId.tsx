import { StyleSheet, Image, TouchableOpacity, Modal, Button, FlatList, Text, View, Share, Pressable } from 'react-native';
import { ReadioTracksList } from '@/components/ReadioTrackList';
import { useTracks } from '@/store/library';
import { useMemo } from 'react';
import { trackTitleFilter } from '@/helpers/filter'
import { useNavigationSearch } from '@/hooks/useNavigationSearch'
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Playlist } from '@/helpers/types';
import { useFetch } from '@/lib/fetch';
import { fetchAPI } from "@/lib/fetch";
import { useState, useEffect } from 'react';
import { LotusArticle } from '@/types/type';
import { useLotusUser } from '@/helpers/providers/lotusUserContext';
import { generateTracksListId } from '@/helpers/misc'
import { filter, unknownTrackImageUri } from '@/constants/images';
import { useNavigation } from "@react-navigation/native";
import { RootNavigationProp } from "@/types/type";
import { FontAwesome } from '@expo/vector-icons';
// import { activeTrack } from 'react-native-track-player';
import { PlaylistRelationship } from '@/helpers/types';
import { set } from 'ts-pattern/dist/patterns';
import { retryWithBackoff } from "@/helpers/retryWithBackoff";
import { colors, readioRegularFont } from '@/constants/tokens';
import sql from "@/helpers/neonClient";
import ReactNativeBlobUtil from 'react-native-blob-util';
import { getLocalImageUri, ImageAssets } from '@/constants/imageAssets';
import React from 'react';
import { useLotusUtils } from '@/helpers/providers/lotusUtilsContext';
import LotusImageWithLoader from '@/components/LotusImageWithLoader';
import { useLotusHaptic } from '@/helpers/providers/lotusHapticProvider';

// TODO
export default function SelectedReadio() {
  const [readios, setReadios] = useState<LotusArticle[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [playlistRelationships, setPlaylistRelationships] = useState<any>([]);
  const [createPlaylistSelections, setCreatePlaylistSelections] = useState<{ id: number, name: string }[]>([]);
  const { isFavorite, setIsFavorite, readioSelectedReadioId, setReadioSelectedReadioId, selectedReadios, setSelectedReadios, setFeatureArticleImage, setFeatureArticleName, wantsToUpdateFavoriteStatus, setWantsToUpdateFavoriteStatus, } = useLotusUtils()
  const [isInPlaylist, setIsInPlaylist] = useState<boolean>(false)
  const { user } = useLotusUser()
  const { needsToRefresh, setNeedsToRefresh, userArticles } = useLotusUser()
  const [isDownloading, setIsDownloading] = useState(false)
  const {lightFeedback, mediumFeedback, successFeedback} = useLotusHaptic();

  const selectedArticle = useMemo(() => {
    if (!userArticles) {
      return undefined;
    }
    // Find the object in communityPlaylistArticles whose 'category' property matches the filteredCategory's name
    return userArticles.find((article: any) => article.id === readioSelectedReadioId);
  }, [userArticles, readioSelectedReadioId]);

  const tracks = selectedArticle

  const trackIsFeatured = tracks?.featured

  useEffect(() => {

    let isMounted = true; // Flag to track whether the component is still mounted

    if (wantsToUpdateFavoriteStatus === true) {
      const updateFavorite = async () => {
        const response = await sql`
          UPDATE readios
          SET favorited = ${isFavorite}
          WHERE id = ${readioSelectedReadioId} AND user_db_id = ${user?.user_db_id}
          RETURNING *;
        `;
      }
      updateFavorite();
    }

    setWantsToUpdateFavoriteStatus?.(false)
    console.log("updated favorite status")

    return () => {
      isMounted = false; // Set the flag to false when the component unmounts
    };

  }, [isFavorite, wantsToUpdateFavoriteStatus, readioSelectedReadioId, user?.user_db_id])

  useEffect(() => {

    let isMounted = true; // Flag to track whether the component is still mounted

    setIsFavorite?.(tracks?.favorited as boolean);
    console.log("isFavorite: ", isFavorite)

    return () => {
      isMounted = false; // Set the flag to false when the component unmounts
    };

  }, [tracks, readioSelectedReadioId])

  // useEffect(() => {
  //   setNeedsToRefresh?.(true)
  // }, [trackIsFeatured])


  const handlePress = () => {
    lightFeedback();
    router.back();
  }

  const handleDownload = async () => {

    lightFeedback();
    setIsDownloading(true)

    try {
      const track = tracks[0];
      if (track?.url) {

        const safeTitle = track.title?.replace(/[^a-z0-9]/gi, ' ').split(' ').map((word: any) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ') || 'Track';


        // First download the file with custom filename
        const response = await ReactNativeBlobUtil.config({
          fileCache: true,
          appendExt: 'mp3',
          path: `${ReactNativeBlobUtil.fs.dirs.CacheDir}/${safeTitle}.mp3` // Custom path with title
        }).fetch('GET', track.url);

        const filePath = response.path();

        const shareOptions = {
          title: track.title,
          message: track.title || "",
          url: `file://${filePath}`, // Make sure to include file:// prefix
          saveToFiles: true,
        };

        try {
          setIsDownloading(false)
          await Share.share(shareOptions);
        } catch (error) {
          console.error('Error sharing track:', error);
        }
      }
    } catch (error) {
      console.error('Error downloading track:', error);
    }
  }

  // ANCHOR -----------------------

  const toggleFavorite = async () => {
    let wantsToBeFavorite = null

    if (isFavorite === true) {
      setWantsToUpdateFavoriteStatus?.(true)
      wantsToBeFavorite = false
      setIsFavorite?.(false)
    }

    if (isFavorite === false) {
      setWantsToUpdateFavoriteStatus?.(true)
      wantsToBeFavorite = true
      setIsFavorite?.(true)
    }

    successFeedback();

  }

  const handleAddToPlaylist = async () => {

    const insertPromises = createPlaylistSelections.map((playlist: { id: number, name: string }) =>
      sql`
        INSERT INTO playlist_readios (playlist_id, readio_id, playlist, readio, user_db_id)
        VALUES (${playlist.id}, ${selectedReadios?.[0]?.id as number}, ${playlist.name}, ${selectedReadios?.[0]?.title}, ${user?.user_db_id as string})
        ON CONFLICT DO NOTHING
      `
    );

    setIsInPlaylist(true)
    toggleModal()

  }

  const removeReadioFromPlaylist = async () => {

    const response = await sql`
      DELETE FROM playlist_readios
      WHERE readio_id = ${selectedReadios?.[0]?.id} AND user_db_id = ${user?.user_db_id}
    `;

    setIsInPlaylist(false)

  }

  const handleDeleteReadio = async (id: number) => {

    const response = await sql`
      DELETE FROM readios
      WHERE id = ${id} AND user_db_id = ${user?.user_db_id}
      RETURNING *;
  `;

    if (response.length === 0) {
      console.log("Readio not found")
      return new Response(JSON.stringify({ error: 'Readio not found' }), { status: 404 });
    }

    setNeedsToRefresh?.(true)

    setTimeout(() => {
      setNeedsToRefresh?.(false)
      router.back();
    }, 500)
  }

  // ANCHOR -----------------------

  const [isModalVisible, setIsModalVisible] = useState(false);
  const toggleModal = () => {
    lightFeedback();
    setIsModalVisible(!isModalVisible);
  };

  function toggleSelection(selectionId: number, selectionName: string) {
    // Check if the item with this id is already in the selections
    const isSelected = createPlaylistSelections.some(item => item.id === selectionId);

    if (isSelected) {
      // Remove the item if it exists
      setCreatePlaylistSelections(createPlaylistSelections.filter(item => item.id !== selectionId));
    } else {
      // Add the item if it does not exist
      setCreatePlaylistSelections([...createPlaylistSelections, { id: selectionId, name: selectionName }]);
    }
  }

  const updateFeatured = async () => {

    const setOldArticleToFalse = await sql`
      UPDATE readios
      SET featured = ${false}
      WHERE featured = ${true}
      RETURNING *;
    `;

    const updateNewResponse = await sql`
      UPDATE readios
      SET featured = ${!tracks?.[0]?.featured}
      WHERE id = ${tracks?.[0]?.id}
      RETURNING *;
    `;

    setFeatureArticleImage?.(tracks?.[0]?.image as string);
    setFeatureArticleName?.(tracks?.[0]?.title as string);

    setNeedsToRefresh?.(true)

    console.log('updated')
  }




  return (

    <>
      <SafeAreaView style={styles.container}>


        <ScrollView style={{
          width: '93%',
          minHeight: '100%',
          alignSelf: 'center',
        }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ display: 'flex', paddingTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', backgroundColor: "transparent" }}>
            <TouchableOpacity style={styles.back} onPress={handlePress}>
              <FontAwesome color={colors.readioWhite} size={20} name='chevron-left' />
            </TouchableOpacity>

            <View style={{ display: 'flex', flexDirection: 'row', gap: 20, backgroundColor: "transparent" }}>


              {user?.user_role === 'admin' && (
                <FontAwesome onPress={() => handleDownload()} name={`${isDownloading ? 'spinner' : 'download'}`} size={20} color={colors.readioOrange} />
              )}

              {isInPlaylist == false && (
                <FontAwesome onPress={toggleModal} name={"plus"} size={20} color={colors.readioOrange} />
              )}
              {isInPlaylist == true && (
                <FontAwesome onPress={removeReadioFromPlaylist} name={"minus"} size={20} color={colors.readioOrange} />
              )}

              {isFavorite === true && (
                <FontAwesome onPress={toggleFavorite} name={"heart"} size={20} color={colors.readioOrange} />
              )}

              {isFavorite === false && (
                <FontAwesome onPress={toggleFavorite} name={"heart-o"} size={20} color={colors.readioOrange} />
              )}

            </View>
          </View>
          <View style={{
            paddingBottom: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            width: '100%',
            backgroundColor: "transparent",
          }}>

              <View  style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center', width: '100%', backgroundColor: "transparent" }}>


                <Text allowFontScaling={false} style={[styles.option, { fontWeight: 'bold', fontFamily: readioRegularFont, opacity: 0.5 }]}>{tracks?.topic}</Text>

                {/* NOTE this will show to a user if the article IS ✅ FEATURED AND NOT ❌ AN ADMIN */}
                {user?.user_role != 'admin' && trackIsFeatured && (
                  <>
                    <Pressable
                      style={styles.adminFeaturedButton}
                    >
                      <LotusImageWithLoader
                      useSpinnerLoader
                      loaderSize='small'
                        style={{ width: 20, height: 20 }}
                        source={ImageAssets.whiteLogo}
                        resizeMode="contain"
                      />
                      <Text allowFontScaling={false} style={styles.adminButtonText}>Featured</Text>
                    </Pressable>
                  </>
                )}

                <View style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center', width: '100%', justifyContent: 'center', backgroundColor: "transparent" }}>
                  <LotusImageWithLoader source={ImageAssets.filter} style={[{ zIndex: 1, width: "70%", height: "100%", borderRadius: 10, opacity: 0.4, position: 'absolute' }]} resizeMode='cover' />
                  <LotusImageWithLoader source={{ uri: tracks?.image ?? unknownTrackImageUri }} style={styles.nowPlayingImage} resizeMode='cover' />
                </View>

                {user?.user_role === 'admin' && (
                  <>
                    <TouchableOpacity
                      style={trackIsFeatured ? styles.adminFeaturedButton : styles.adminNotFeatured}
                      onPress={() => { updateFeatured() }}
                    >
                      {trackIsFeatured && (
                        <LotusImageWithLoader
                        useSpinnerLoader
                        loaderSize='small'
                          style={{ width: 20, height: 20 }}
                          source={ImageAssets.whiteLogo}
                          resizeMode="contain"
                        />
                      )}
                      <Text allowFontScaling={false} style={styles.adminNotFeaturedText}>{trackIsFeatured ? 'Featured' : 'Feature on Hompage?'}</Text>
                    </TouchableOpacity>
                  </>
                )}

                <Text allowFontScaling={false} style={styles.title}>{tracks?.title}</Text>


              </View>
            {/* {readios?.filter(readio => readio.id === readioSelectedReadioId).map((readio: LotusArticle) => (


            ))} */}

            <ReadioTracksList id={generateTracksListId('songs', tracks?.title)} tracks={[tracks]} scrollEnabled={false} />
          </View>

        </ScrollView>


      </SafeAreaView>

{/* NOTE CREATE PLAYLIST MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={toggleModal}
      >
        <SafeAreaView style={{ height: '100%' }}>
          <View style={{ padding: 20, backgroundColor: colors.readioBrown, width: '100%', display: 'flex', flexDirection: 'column', height: '100%' }}>

            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
              <Button title="Close" color={colors.readioOrange} onPress={toggleModal} />
            </View>

            <View style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
              {playlists && playlists?.length === 0 && (
                <>
                  <View style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <Text allowFontScaling={false} style={styles.heading}>We couldn't find any playlists.</Text>
                    <Text allowFontScaling={false} style={{ color: colors.readioWhite, marginTop: 10 }}>Create a playlist by going back and pressing:</Text>
                    <Text allowFontScaling={false} style={{ color: colors.readioWhite, fontWeight: 'bold' }}>(New Playlist)</Text>
                  </View>
                </>
              )}
              {playlists && playlists?.length > 0 && (
                <>
                  <Text allowFontScaling={false} style={styles.heading}>Adding to Playlist:</Text>
                  <View style={{ display: 'flex', flexDirection: 'column', width: '100%', maxHeight: 'auto' }}>
                    <Text allowFontScaling={false} numberOfLines={2} style={{ fontSize: 46, fontWeight: 'bold' }}>{selectedReadios?.[0]?.title}</Text>



                    <Text allowFontScaling={false} style={{ fontSize: 16, marginVertical: 10, fontWeight: 'bold' }}>Choose Playlist(s) to add to:</Text>
                    <FlatList
                      data={playlists}
                      renderItem={({ item }) =>

                        <TouchableOpacity onPress={() => toggleSelection(item.id ? item.id : -1, item.name ? item.name : '')} activeOpacity={0.9} style={{ backgroundColor: createPlaylistSelections.some(selection => selection.id === item.id) ? '#fc3c44' : 'transparent', display: 'flex', flexDirection: 'row', alignItems: 'center', height: 40, borderRadius: 5, marginVertical: 3 }}>
                          {/* <FastImage source={{uri: item?.image ? item.image : unknownTrackImageUri}} style={{width: 40, height: 40, borderRadius: 5, marginRight: 10}} /> */}
                          <Text allowFontScaling={false} numberOfLines={1} style={{ fontSize: 16, maxHeight: 20, marginHorizontal: 10, color: createPlaylistSelections.some(selection => selection.id === item.id) ? '#fff' : 'black', fontWeight: createPlaylistSelections.some(selection => selection.id === item.id) ? 'bold' : 'normal' }}>{item?.name}</Text>
                        </TouchableOpacity>}
                    // keyExtractor={(item) => item?.id ? item.id.toString() : ''}
                    />
                    <TouchableOpacity style={{ backgroundColor: colors.readioOrange, padding: 10, marginVertical: 10, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }} activeOpacity={0.9} onPress={handleAddToPlaylist}>
                      <Text allowFontScaling={false} style={{ color: colors.readioWhite, fontWeight: 'bold', fontSize: 20 }} >Add to Playlist</Text>
                    </TouchableOpacity>
                    {/* <Text style={{color: colors.readioOrange, marginTop: 10}} onPress={handleAddToPlaylist}>Add to Playlist</Text> */}
                  </View>
                </>
              )}
            </View>

          </View>

        </SafeAreaView>
      </Modal>
    </>


  );
}


const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    // alignItems: 'center',
    backgroundColor: colors.readioBrown,
    width: "100%",
    justifyContent: "space-between",
    flex: 1,
    marginTop: 110,
  },
  playlistContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center'
  },
  adminFeaturedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    borderColor: colors.readioOrange,
  },
  adminNotFeatured: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    borderColor: colors.readioBlack,
  },
  adminButtonText: {
    color: colors.readioDustyWhite,
    fontSize: 14,
    fontWeight: '600',
  },
  adminNotFeaturedText: {
    color: colors.readioDustyWhite,
    fontSize: 14,
    fontWeight: '600',
    opacity: .6
  },
  playlistIcon: {
    backgroundColor: '#ccc',
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  readioPlaylistTitle: {
    color: colors.readioOrange,
    fontSize: 20,
    fontWeight: 'bold',
  },
  readioUserPlaylistTitle: {
    color: '#000',
    fontSize: 20,
    fontWeight: 'bold',
  },
  nowPlayingImage: {
    width: 250,
    height: 250,
    right: 0,
    top: 0,
    borderRadius: 10
  },
  heading: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.readioWhite,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.readioWhite,
    textAlign: 'center',
  },
  option: {
    fontSize: 20,
    paddingVertical: 5,
    color: colors.readioWhite,
  },
  back: {
    opacity: 0.5,
    padding: 5
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '100%',
  },
});
