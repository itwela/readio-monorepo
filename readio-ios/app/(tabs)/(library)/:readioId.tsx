import { StyleSheet, Image, TouchableOpacity, Modal, Button, FlatList, Text, View, Share, Pressable, ActivityIndicator } from 'react-native';
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
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { ContentType, LotusTrack } from '@/types/type';

// TODO
export default function SelectedReadio() {
  // STUB ======================================== [
  const [createPlaylistSelections, setCreatePlaylistSelections] = useState<{ _id: string, name: string }[]>([]);
  const { isFavorite, setIsFavorite, articleSelectedId, selectedReadios, setSelectedReadios, setFeatureArticleImage, setFeatureArticleName, wantsToUpdateFavoriteStatus, setWantsToUpdateFavoriteStatus, } = useLotusUtils()
    // STUB ======================================== ]

  const { needsToRefresh, setNeedsToRefresh } = useLotusUser()
  const [isDownloading, setIsDownloading] = useState(false)
  const {lightFeedback, mediumFeedback, successFeedback} = useLotusHaptic();

  const { 
    user, 
    userArticles, 
    toggleArticleFavoriteMutation,
    addToPlaylistMutation,
    removeFromPlaylistMutation 
  } = useLotusUser()

  // Load user playlists for the "Add to Playlist" modal
  const userPlaylists = useQuery(api.playlists.getPlaylistsByUser, 
    user?.user_db_id ? { user_db_id: user.user_db_id } : "skip"
  );

  // 🎯 FIX: Move all useState hooks to the top before any conditional logic
  const [isModalVisible, setIsModalVisible] = useState(false);

  // 🎯 FIX: Handle article selection AFTER all hooks are declared
  const selectedArticle = userArticles?.find((article: any) => article._id === articleSelectedId)
  
  // 🎯 FIX: Early returns now happen AFTER all hooks
  if (selectedArticle === undefined) return <View style={styles.container}><Text>Loading...</Text></View>
  if (selectedArticle === null) return <View style={styles.container}><Text>Article not found</Text></View>
  
  const tracks = selectedArticle
  const trackIsFeatured = tracks?.featured

  // ANCHOR ----------------------- FUNCTIONS
  // REVIEW
  const handlePress = () => {
    lightFeedback();
    router.back();
  }
  // REVIEW
  const handleDownload = async () => {

    mediumFeedback();
    setIsDownloading(true)
    // console.log('[handleDownload] Attempting to download track...');


    try {
      // Ensure tracks is available and has at least one item
      if (!tracks) {
        console.error('[handleDownload] Error: No tracks available to download.');
        setIsDownloading(false);
        return;
      }
      const track = tracks; // Assuming 'tracks' is the single selected article object, not an array of tracks for this article.
                            // If 'tracks' is meant to be an array of actual audio tracks within the article, 
                            // you might need to adjust this, e.g., tracks[0] if it's the first audio file.
                            // For now, proceeding as if 'tracks' is the article object itself.

      // console.log('[handleDownload] Track data:', JSON.stringify(track, null, 2));

      if (track?.url) {
        // console.log('[handleDownload] Track URL:', track.url);

        let safeTitle = track.title?.replace(/[^a-zA-Z0-9\s]/gi, '_').replace(/\s+/g, '_') || 'DownloadedTrack';
        if (safeTitle.length > 50) { // Keep filename reasonably short
          safeTitle = safeTitle.substring(0, 50);
        }
        // console.log('[handleDownload] Safe title for file:', safeTitle);

        const downloadDest = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/${safeTitle}.mp3`;
        // console.log('[handleDownload] Download destination:', downloadDest);

        const response = await ReactNativeBlobUtil.config({
            fileCache: true,
            path: downloadDest,
            // appendExt: 'mp3', // 'path' option usually makes appendExt redundant if extension is in path
          }).fetch('GET', track.url);

        // console.log('[handleDownload] Download response status:', response.info().status);
        const filePath = response.path(); // Get the actual path where the file was saved
        // console.log('[handleDownload] File downloaded to:', filePath);

        if (!filePath) {
          console.error('[handleDownload] Error: File path is undefined after download.');
          throw new Error('File path is undefined after download.');
        }

        const shareOptions = {
          title: track.title || 'Shared Track',
          message: track.title || "Check out this track!",
          url: `file://${filePath}`, // Make sure to include file:// prefix
          saveToFiles: true, // This is iOS specific for "Save to Files" option
        };
        // console.log('[handleDownload] Share options:', JSON.stringify(shareOptions, null, 2));

        try {
          // console.log('[handleDownload] Attempting to share...');
          await Share.share(shareOptions);
          // console.log('[handleDownload] Share successful.');
        } catch (error) {
          console.error('[handleDownload] Error sharing track:', error);
        }
      } else {
        console.warn('[handleDownload] Track URL is missing. Cannot download.');
      }
    } catch (error) {
      console.error('[handleDownload] Error during download process:', error);
    } finally {
      setIsDownloading(false);
      // console.log('[handleDownload] Download process finished.');
    }
  }
  // REVIEW
  const toggleFavorite = async () => {
    await toggleArticleFavoriteMutation({
      articleId: selectedArticle?._id as any,
      favorited: selectedArticle?.favorited === true ? false : true,
    });
  }
  // REVIEW
  const handleAddToPlaylist = async () => {
    if (!user?.user_db_id || !selectedArticle?._id) return;

    try {
      await Promise.all(
        createPlaylistSelections.map(playlist => 
          addToPlaylistMutation({
            playlistId: playlist._id as any,
            articleId: selectedArticle._id as any,
            userId: user.user_db_id
          })
        )
      );

      toggleModal();
    
    } catch (error) {
      console.error('Error adding to playlist:', error);
    }
  }

  // TODO
  const removeLotusFromPlaylist = async (playlistId: string) => {
    if (!user?.user_db_id || !selectedArticle?._id) return;

    try {
      await removeFromPlaylistMutation({
        playlistId: playlistId as any, // Convert to proper playlist ID type
        articleId: selectedArticle._id as any, // Use the selected article ID
        userId: user.user_db_id
      });
    } catch (error) {
      console.error('Error removing lotus from playlist:', error);
    }
  }
  // TODO
  const toggleModal = () => {
    lightFeedback();
    setIsModalVisible(!isModalVisible);
  };
  // TODO
  function toggleSelection(selectionId: string, selectionName: string) {
    // Check if the item with this id is already in the selections
    const isSelected = createPlaylistSelections.some(item => item._id === selectionId);

    if (isSelected) {
      // Remove the item if it exists
      setCreatePlaylistSelections(createPlaylistSelections.filter(item => item._id !== selectionId));
    } else {
      // Add the item if it does not exist
      setCreatePlaylistSelections([...createPlaylistSelections, { _id: selectionId, name: selectionName }]);
    }
  }
  // ANCHOR -----------------------

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
                <>
                {
                  isDownloading ? (
                    <ActivityIndicator size="small" color={colors.readioOrange} />
                  ) : (
                    <FontAwesome onPress={() => handleDownload()} name={'download'} size={20} color={colors.readioOrange} />
                  )
                }
                </>
              )}

              <FontAwesome onPress={toggleModal} name={"plus"} size={20} color={colors.readioOrange} />

              {/* TODO , IN THE FUTURE I WILL GIVE THIS AN EVEN MORE OPTIMISTIC UPDATE */}
              {selectedArticle?.favorited === true && (
                <FontAwesome onPress={toggleFavorite} name={"heart"} size={20} color={colors.readioOrange} />
              )}

              {/* TODO , IN THE FUTURE I WILL GIVE THIS AN EVEN MORE OPTIMISTIC UPDATE */}
              {selectedArticle?.favorited === false && (
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

                <View style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center', width: '100%', justifyContent: 'center', backgroundColor: "transparent", position: 'relative' }}>
                  <LotusImageWithLoader source={ImageAssets.filter} style={[{ zIndex: 1, width: 250, height: 250, borderRadius: 10, opacity: 0.4, position: 'absolute' }]} resizeMode='cover' />
                  <LotusImageWithLoader source={{ uri: tracks?.artwork ?? unknownTrackImageUri }} style={styles.nowPlayingImage} resizeMode='cover' />
                </View>


                {user?.user_role === 'admin' && (
                  <>
                  <View style={{height: 20}}/>
                    {/* <TouchableOpacity
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
                    </TouchableOpacity> */}
                  </>
                )}

                <Text allowFontScaling={false} style={styles.title}>{tracks?.title}</Text>


              </View>
            {/* {readios?.filter(readio => readio.id === readioSelectedReadioId).map((readio: LotusArticle) => (


            ))} */}

            <ReadioTracksList id={generateTracksListId('songs', tracks?.title)} tracks={tracks ? [tracks] : []} scrollEnabled={false} />
          </View>

        </ScrollView>


      </SafeAreaView>

{/* NOTE ADD TO PLAYLIST MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={toggleModal}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20
        }}>
          <View style={{
            backgroundColor: colors.readioBrown,
            borderRadius: 20,
            padding: 24,
            width: '100%',
            maxWidth: 400,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 8,
          }}>
            
            {/* NOTE - Header */}
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: 20
            }}>
              <Text allowFontScaling={false} style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: colors.readioWhite,
                fontFamily: readioRegularFont
              }}>
                Add to Playlist
              </Text>
              
              {/* CLOSE BUTTON */}
              <Pressable 
                onPress={toggleModal}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Text allowFontScaling={false} style={{
                  color: colors.readioWhite,
                  fontSize: 18,
                  fontWeight: 'bold'
                }}>×</Text>
              </Pressable>
            </View>

            {/* NOTE - Track Info */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 12,
              padding: 12,
              marginBottom: 20
            }}>
              <LotusImageWithLoader 
                source={{ uri: selectedArticle?.artwork ?? unknownTrackImageUri }}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 8,
                  marginRight: 12
                }}
                resizeMode="cover"
              />
              <View style={{ flex: 1 }}>
                <Text allowFontScaling={false} numberOfLines={2} style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: colors.readioWhite,
                  fontFamily: readioRegularFont,
                  marginBottom: 4
                }}>{selectedArticle?.title}</Text>
                <Text allowFontScaling={false} style={{
                  fontSize: 14,
                  color: colors.readioDustyWhite,
                  opacity: 0.8,
                  fontFamily: readioRegularFont
                }}>{selectedArticle?.topic}</Text>
              </View>
            </View>

            {/* NOTE - Playlist Selection */}
            {userPlaylists && userPlaylists.length > 0 ? (
              <>
                <Text allowFontScaling={false} style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: colors.readioWhite,
                  fontFamily: readioRegularFont,
                  marginBottom: 16
                }}>Choose Playlist(s):</Text>
                
                <FlatList
                  data={userPlaylists}
                  style={{
                    maxHeight: 200,
                    marginBottom: 20
                  }}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => {
                    const isSelected = createPlaylistSelections.some(selection => selection._id === item._id);
                    return (
                      <Pressable 
                        onPress={() => toggleSelection(item._id ? item._id : '', item.name ? item.name : '')} 
                        style={{
                          backgroundColor: isSelected ? colors.readioOrange : 'rgba(255, 255, 255, 0.05)',
                          borderRadius: 12,
                          padding: 16,
                          marginBottom: 8,
                          borderWidth: 1,
                          borderColor: isSelected ? colors.readioOrange : 'rgba(255, 255, 255, 0.1)',
                          flexDirection: 'row',
                          alignItems: 'center'
                        }}
                      >
                        <View style={{
                          width: 20,
                          height: 20,
                          borderRadius: 10,
                          borderWidth: 2,
                          borderColor: isSelected ? colors.readioWhite : colors.readioDustyWhite,
                          backgroundColor: isSelected ? colors.readioWhite : 'transparent',
                          marginRight: 12,
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}>
                          {isSelected && (
                            <View style={{
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: colors.readioOrange
                            }} />
                          )}
                        </View>
                        
                        <Text allowFontScaling={false} numberOfLines={1} style={{
                          fontSize: 16,
                          color: isSelected ? colors.readioWhite : colors.readioDustyWhite,
                          fontWeight: isSelected ? 'bold' : 'normal',
                          fontFamily: readioRegularFont,
                          flex: 1
                        }}>{item?.name}</Text>
                      </Pressable>
                    );
                  }}
                  keyExtractor={(item) => item._id ? item._id.toString() : Math.random().toString()}
                />
              </>
            ) : (
              <View style={{
                padding: 20,
                alignItems: 'center',
                marginBottom: 20
              }}>
                <Text allowFontScaling={false} style={{
                  fontSize: 16,
                  color: colors.readioDustyWhite,
                  textAlign: 'center',
                  fontFamily: readioRegularFont,
                  opacity: 0.7
                }}>No playlists found. Create a playlist first to add tracks.</Text>
              </View>
            )}

            {/* NOTE - Action Buttons */}
            <View style={{
              flexDirection: 'row',
              gap: 12
            }}>
              <Pressable 
                onPress={toggleModal}
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 12,
                  padding: 16,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.2)'
                }}
              >
                <Text allowFontScaling={false} style={{
                  color: colors.readioWhite,
                  fontSize: 16,
                  fontWeight: '600',
                  fontFamily: readioRegularFont
                }}>Cancel</Text>
              </Pressable>
              
              <Pressable 
                onPress={handleAddToPlaylist}
                disabled={createPlaylistSelections.length === 0}
                style={{
                  flex: 1,
                  backgroundColor: createPlaylistSelections.length > 0 ? colors.readioOrange : 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 12,
                  padding: 16,
                  alignItems: 'center',
                  opacity: createPlaylistSelections.length > 0 ? 1 : 0.5
                }}
              >
                <Text allowFontScaling={false} style={{
                  color: colors.readioWhite,
                  fontSize: 16,
                  fontWeight: 'bold',
                  fontFamily: readioRegularFont
                }}>
                  Add {createPlaylistSelections.length > 0 ? `(${createPlaylistSelections.length})` : ''}
                </Text>
              </Pressable>
            </View>

          </View>
        </View>
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
    width: '95%'
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
