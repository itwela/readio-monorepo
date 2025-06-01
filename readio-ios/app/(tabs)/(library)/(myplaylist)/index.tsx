import InputField from '@/components/inputField';
import LotusGap from '@/components/LotusGap';
import LotusImageWithLoader from '@/components/LotusImageWithLoader';
import { LotusPageDisplayName } from '@/components/LotusPageDisplayName';
import { getLocalImageUri, ImageAssets } from '@/constants/imageAssets';
import { colors, giantFont, readioBoldFont, readioRegularFont } from '@/constants/tokens';
import { trackTitleFilter } from '@/helpers/filter';
import { useLotusHaptic } from '@/helpers/providers/lotusHapticProvider';
import { useLotusUser } from '@/helpers/providers/lotusUserContext';
import { useLotusUtils } from '@/helpers/providers/lotusUtilsContext';
import { useNavigationSearch } from '@/hooks/useNavigationSearch';
import { useTracks } from '@/store/library';
import { LotusArticle, RootNavigationProp } from "@/types/type";
import { FontAwesome } from '@expo/vector-icons';
import { MenuView } from '@react-native-menu/menu';
import { useNavigation } from "@react-navigation/native";
import { Href, router } from 'expo-router';
import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Button, FlatList, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, Pressable, KeyboardAvoidingView } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOutDown, FadeInUp, FadeOut, FadeOutUp } from 'react-native-reanimated';
import { match } from 'ts-pattern';
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";

// TODO
export default function Playlists() {

  const search = useNavigationSearch({
    searchBarOptions: {
      placeholder: 'Find in songs',
    },
  })

  const { user, userFavoriteArticles } = useLotusUser()
  const { articleSelectedPlaylistId, setArticleSelectedPlaylistId, articleSelectedPlaylistName, setArticleSelectedPlaylistName, floatingPlayerIsVisible } = useLotusUtils()
  const { communityPlaylistArticles, userPlaylists, continueReadingPlaylist } = useLotusUser()
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { lightFeedback, mediumFeedback, successFeedback } = useLotusHaptic();
  const [createPlaylistSelections, setCreatePlaylistSelections] = useState<{ id: number, name: string }[]>([]);
  // Debug logging for community playlists

  const createPlaylistMutation = useMutation(api.playlists.createPlaylist);
  const deletePlaylistMutation = useMutation(api.playlists.deletePlaylistByNameAndUser);

  const handleShowPlaylist = (id: number) => {

    const strId = id.toString()
    const route = `/`
    // console.log(route)

    setArticleSelectedPlaylistId?.(id)
    setClickedFromLibrary?.(true);
    setClickedFromHome?.(false);

    // router.push(route as Href)
    router.push('/(library)/selected:playlistId')

    // router.push(route)
  }
  const handleShowFavorites = () => {
    // setClickedFromLibrary?.(true);
    // setClickedFromHome?.(false);
    setArticleSelectedPlaylistName?.('')
    lightFeedback();
    router.push('/(tabs)/(library)/(myplaylist)/favorites')
  }
  const handleShowContinueReading = () => {
    lightFeedback();
    setArticleSelectedPlaylistName?.('BOOKMARKED')
    router.push('/(tabs)/(library)/(myplaylist)/bookmarked')
  }
  const toggleModal = () => {
    lightFeedback();
    setIsModalVisible(!isModalVisible);
  };
  const handlePress = () => {
    lightFeedback();
    router.back();
  }
  const [form, setForm] = useState({
    title: '',
  })
  const handleCreatePlaylist = async () => {
    if (!user?.user_db_id || !form.title.trim()) return;

    try {
      await createPlaylistMutation({
        name: form.title.trim(),
        user_db_id: user.user_db_id
      });

      setForm({ title: '' });
      toggleModal();
      successFeedback();
    } catch (error) {
      console.error('Error creating playlist:', error);
    }
  }
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
  const handleDeletePlaylist = async (playlistName?: string) => {
    if (!playlistName || !user?.user_db_id) return;

    try {
      await deletePlaylistMutation({
        name: playlistName,
        user_db_id: user.user_db_id
      });

      successFeedback();
    } catch (error) {
      console.error('Error deleting playlist:', error);
    }
  }
  const handlePressAction = (id: string, playlistName?: string, readioName?: string) => {
    match(id)
      .with('add-to-favorites', async () => {
        // console.log("add-t-f")
      })
      .with('remove-from-favorites', async () => {
        // console.log("remove-f-f")
      })
      .with('add-to-playlist', () => {
        // console.log("add-t-p")
      })
      .with('remove-from-playlist', () => {
        // console.log('remove-f-p')
      })
      .with('delete', () => {
        handleDeletePlaylist(playlistName)
        // console.log("delete")
      })

      .otherwise(() => console.warn(`Unknown menu action ${id}`))
  }
  const handleGoToSelectedPlaylist = (playlistId: any, name: string) => {
    lightFeedback();
    setArticleSelectedPlaylistId?.(playlistId)
    setArticleSelectedPlaylistName?.(name)
    console.log('👤 Article Selected Playlist Name:', name)
    // console.log('👤 User Playlists id:', playlistId);
    // Navigate to the user playlist route using the playlist ID
    router.push(`/(tabs)/(library)/(myplaylist)/${playlistId}` as Href)
  }
  const { clickedFromHome, setClickedFromHome, clickedFromLibrary, setClickedFromLibrary } = useLotusUtils()

  type LotusCommunityPlaylists = {
    category: string;
    imageurl: string;
    articles: LotusArticle[];
  }


  return (
    <View style={styles.container}>

      <Animated.View style={{ paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between' }} entering={FadeInUp.duration(600)} exiting={FadeInDown.duration(600)}>

        <TouchableOpacity style={styles.back} onPress={handlePress}>
          <FontAwesome color={colors.readioWhite} size={20} name='chevron-left' />
        </TouchableOpacity>

        {/* NOTE - NEW PLAYLIST */}
        <TouchableOpacity activeOpacity={0.9} onPress={toggleModal} style={styles.playlistContainer}>
          <FontAwesome onPress={toggleModal} name={"plus"} size={20} color={colors.readioOrange} />
        </TouchableOpacity>

      </Animated.View>
      {/* <Animated.Text entering={FadeInUp.duration(600)} exiting={FadeInDown.duration(600)}   allowFontScaling={false} style={styles.back} onPress={handlePress}>Library</Animated.Text> */}

      <View style={{
        paddingVertical: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        backgroundColor: 'transparent',
      }}>

{/* NOTE - SCROLL VIEW */}
        <ScrollView showsVerticalScrollIndicator={false}>
          <LotusPageDisplayName title='MY PLAYLISTS' paddingTop={0} />

          <View style={{ paddingHorizontal: 20 }}>
            <Text allowFontScaling={false} numberOfLines={3} style={[styles.pageDescription, { textAlign: 'center' }]}>
              Your space for curated journeys and custom playlists of your favorites.
            </Text>
          </View>

          {/* Show favorites first */}
          <LotusGap backgroundColor={colors.readioBrown} gapNumber={15} />
          
          <View style={styles.recentlySavedContainer}>


            {/* NOTE - FAVORITES */}
            {userFavoriteArticles && userFavoriteArticles.length > 0 && (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => handleShowFavorites()}
              style={styles.recentlySavedItems}
            >
              <Animated.View style={{ gap: 10 }} entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(100)}>
                <View style={styles.recentlySavedImg}>
                  <LotusImageWithLoader source={{ uri: getLocalImageUri('filter') }} style={[styles.nowPlayingImage, { zIndex: 1, opacity: 0.4 }]} resizeMode='cover' />
                  <LotusImageWithLoader source={{ uri: userFavoriteArticles[0]?.artwork || getLocalImageUri('unknownArticle') }} style={styles.nowPlayingImage} resizeMode='cover' />
                </View>
                <View style={{ display: 'flex', flexDirection: 'column', height: 58, }}>
                  <Text allowFontScaling={false} numberOfLines={2} style={styles.recentlySavedTItle}>Favorites</Text>
                  <Text allowFontScaling={false} numberOfLines={1} style={[styles.recentlySavedSubheading, { opacity: 0.6 }]}>{user?.name}</Text>
                </View>
              </Animated.View>
            </TouchableOpacity>
            )}

            {/* 🎯 NEW: CONTINUE READING */}
            {continueReadingPlaylist && continueReadingPlaylist.articles && continueReadingPlaylist.articles.length > 0 && (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => handleShowContinueReading()}
                style={styles.recentlySavedItems}
              >
                <Animated.View style={{ gap: 10 }} entering={FadeInUp.duration(350)} exiting={FadeOutDown.duration(100)}>
                  <View style={styles.recentlySavedImg}>
                    <LotusImageWithLoader source={{ uri: getLocalImageUri('filter') }} style={[styles.nowPlayingImage, { zIndex: 1, opacity: 0.4 }]} resizeMode='cover' />
                    <LotusImageWithLoader source={{ uri: continueReadingPlaylist.articles[0]?.artwork || getLocalImageUri('unknownArticle') }} style={styles.nowPlayingImage} resizeMode='cover' />
                  </View>
                  <View style={{ display: 'flex', flexDirection: 'column', height: 58, }}>
                    <Text allowFontScaling={false} numberOfLines={2} style={styles.recentlySavedTItle}>Bookmarked</Text>
                    <Text allowFontScaling={false} numberOfLines={1} style={[styles.recentlySavedSubheading, { opacity: 0.6 }]}>{user?.name}</Text>
                  </View>
                </Animated.View>
              </TouchableOpacity>
            )}

            {/* Show user's custom playlists */}
            {userPlaylists && userPlaylists.length > 0 && userPlaylists.map((playlist: any, index: number) => (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => handleGoToSelectedPlaylist(playlist._id, playlist.category)}
                key={playlist._id}
                style={styles.recentlySavedItems}
              >
                <Animated.View style={{ gap: 10 }} entering={FadeInUp.duration(300 + (index * 100))} exiting={FadeOutDown.duration(100)}>
                  <View style={styles.recentlySavedImg}>
                    <LotusImageWithLoader source={{ uri: getLocalImageUri('filter') }} style={[styles.nowPlayingImage, { zIndex: 1, opacity: 0.4 }]} resizeMode='cover' />
                    <LotusImageWithLoader source={{ uri: getLocalImageUri('unknownArticle') }} style={styles.nowPlayingImage} resizeMode='cover' />
                  </View>
                  <View style={{ display: 'flex', flexDirection: 'column', height: 58, }}>
                    <Text allowFontScaling={false} numberOfLines={2} style={styles.recentlySavedTItle}>{playlist.name}</Text>
                    <Text allowFontScaling={false} numberOfLines={1} style={[styles.recentlySavedSubheading, { opacity: 0.6 }]}>{user?.name}</Text>
                  </View>
                </Animated.View>
              </TouchableOpacity>
            ))}

            {/* Show community playlists if available */}
            {communityPlaylistArticles && communityPlaylistArticles.length > 0 && communityPlaylistArticles.map((playlist: any, index: number) => (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => handleGoToSelectedPlaylist(String(playlist?._id || ''), playlist?.category as string)}
                key={`community-${index}`}
                style={styles.recentlySavedItems}
              >
                <Animated.View style={{ gap: 10 }} entering={FadeInUp.duration(300 + (index * 100))} exiting={FadeOutDown.duration(100)}>
                  <View style={styles.recentlySavedImg}>
                    <LotusImageWithLoader 
                      source={{ uri: getLocalImageUri('filter') }} 
                      style={[styles.nowPlayingImage, { zIndex: 1, opacity: 0.4 }]} 
                      resizeMode='cover' 
                    />
                    <LotusImageWithLoader 
                      source={{ uri: playlist?.imageurl || getLocalImageUri('unknownArticle') }} 
                      style={styles.nowPlayingImage} 
                      resizeMode='cover' 
                      onError={() => console.log(`Failed to load image for ${playlist?.category}`)}
                    />
                  </View>
                  <View style={{ display: 'flex', flexDirection: 'column', height: 58, }}>
                    <Text allowFontScaling={false} numberOfLines={2} style={styles.recentlySavedTItle}>{playlist.category}</Text>
                    <Text allowFontScaling={false} numberOfLines={1} style={[styles.recentlySavedSubheading, { opacity: 0.6 }]}>Lotus</Text>
                  </View>
                </Animated.View>
              </TouchableOpacity>
            ))}


          </View>

          {/* Show empty state if no playlists */}
          {(!userPlaylists || userPlaylists.length === 0) && (!communityPlaylistArticles || communityPlaylistArticles.length === 0) && (
            <View style={{ paddingHorizontal: 10, opacity: 0.5, height: '58%', justifyContent: 'center' }}>
              <LotusImageWithLoader source={ImageAssets.whiteLogo} style={{ width: 100, height: 100, alignSelf: 'center' }} resizeMode='contain' />
              <Animated.Text entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(100)} allowFontScaling={false} style={[styles.title, { textAlign: 'center' }]}>{`You haven't created any playlists yet.`}</Animated.Text>
              <LotusGap backgroundColor={colors.readioBrown} gapNumber={15} />
              <Animated.Text entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(100)} allowFontScaling={false} style={[styles.title, { textAlign: 'center' }]}>Start by pressing the plus button above.</Animated.Text>
            </View>
          )}

          <View style={[styles.divider, { opacity: 0 }]} />
          <View style={{ height: floatingPlayerIsVisible ? 130 : 100 }} />

        </ScrollView>

        {/* NOTE CREATE PLAYLIST MODAL */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={toggleModal}
        >
          <KeyboardAvoidingView style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20
          }} behavior={'padding'}>
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
                  fontFamily: readioBoldFont
                }}>
                  New Playlist
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

              {/* NOTE - Playlist Icon Display */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 12,
                padding: 12,
                marginBottom: 20
              }}>
                <LotusImageWithLoader 
                  source={{ uri: getLocalImageUri('filter') }}
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 8,
                    marginRight: 12
                  }}
                  resizeMode="cover"
                />
                <View style={{ flex: 1 }}>
                  <Text allowFontScaling={false} style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: colors.readioWhite,
                    fontFamily: readioBoldFont,
                    marginBottom: 4
                  }}>Create Your Playlist</Text>
                  <Text allowFontScaling={false} style={{
                    fontSize: 14,
                    color: colors.readioDustyWhite,
                    opacity: 0.8,
                    fontFamily: readioRegularFont
                  }}>Curate your perfect collection</Text>
                </View>
              </View>

              {/* NOTE - Input Section */}
              <View style={{ marginBottom: 20 }}>
                <Text allowFontScaling={false} style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: colors.readioWhite,
                  fontFamily: readioBoldFont,
                  marginBottom: 12
                }}>Playlist Name:</Text>
                
                <InputField
                  allowFontScaling={false}
                  onChangeText={(text) => setForm({ ...form, title: text })}
                  placeholder="Name your playlist..."
                  placeholderTextColor={colors.readioDustyWhite + '80'}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 12,
                    padding: 16,
                    fontSize: 16,
                    color: colors.readioWhite,
                    fontFamily: readioRegularFont,
                    borderWidth: 1,
                    width: '100%',
                    borderColor: form.title.trim() ? colors.readioOrange : 'rgba(255, 255, 255, 0.1)',
                  }}
                  label=""
                  value={form.title}
                />
              </View>

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
                    fontFamily: readioBoldFont
                  }}>Cancel</Text>
                </Pressable>
                
                <Pressable 
                  onPress={handleCreatePlaylist}
                  disabled={!form.title.trim()}
                  style={{
                    flex: 1,
                    backgroundColor: form.title.trim() ? colors.readioOrange : 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 12,
                    padding: 16,
                    alignItems: 'center',
                    opacity: form.title.trim() ? 1 : 0.5
                  }}
                >
                  <Text allowFontScaling={false} style={{
                    color: colors.readioWhite,
                    fontSize: 16,
                    fontWeight: 'bold',
                    fontFamily: readioBoldFont
                  }}>
                    Create Playlist
                  </Text>
                </Pressable>
              </View>

            </View>
          </KeyboardAvoidingView>
        </Modal>

      </View>

    </View>
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
    paddingTop: 10,
  },
  playlistContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
    backgroundColor: "transparent",
  },
  playlistIcon: {
    backgroundColor: colors.readioWhite,
    width: 60,
    height: 60,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  pageDescription: {
    fontSize: 14,
    color: colors.readioDustyWhite,
    marginTop: 5,
    fontFamily: readioRegularFont,
  },
  readioPlaylistTitle: {
    color: colors.readioOrange,
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: readioBoldFont
  },
  readioUserPlaylistTitle: {
    color: colors.readioWhite,
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: readioBoldFont
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: `${colors.readioWhite}50`,
    marginVertical: 20
  },
  heading: {
    marginTop: 10,
    fontSize: 35,
    fontWeight: 'bold',
    color: colors.readioWhite,
    fontFamily: giantFont
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  option: {
    fontSize: 20,
    paddingVertical: 5
  },
  back: {
    // fontSize: 15,
    // textDecorationLine: 'underline',
    // color: colors.readioOrange,
    // fontFamily: readioRegularFont,
    opacity: 0.5
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '100%',
  },
  playlistSelections: {
  },
  recentlySavedContainer: {
    display: 'flex',
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
