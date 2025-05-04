import InputField from '@/components/inputField';
import LotusGap from '@/components/LotusGap';
import LotusImageWithLoader from '@/components/LotusImageWithLoader';
import { LotusPageDisplayName } from '@/components/LotusPageDisplayName';
import { getLocalImageUri, ImageAssets } from '@/constants/imageAssets';
import { colors, giantFont, readioBoldFont, readioRegularFont } from '@/constants/tokens';
import { trackTitleFilter } from '@/helpers/filter';
import sql from "@/helpers/neonClient";
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
import { Button, FlatList, KeyboardAvoidingView, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOutDown, FadeInUp, FadeOut } from 'react-native-reanimated';
import { match } from 'ts-pattern';

// TODO
export default function Playlists() {

  const search = useNavigationSearch({
    searchBarOptions: {
      placeholder: 'Find in songs',
    },
  })

  const { user } = useLotusUser()

  const [playlists, setPlaylists] = useState<any[]>([]);
  const { needsToRefresh, setNeedsToRefresh } = useLotusUser()
  const { readioSelectedPlaylistId, setReadioSelectedPlaylistId, setReadioSelectedPlaylistName, floatingPlayerIsVisible } = useLotusUtils()
  const [playListUpdate, setPlaylistUpdate] = useState(false)
  const { communityPlaylistArticles } = useLotusUser()
  const {lightFeedback, mediumFeedback, successFeedback} = useLotusHaptic();

  useEffect(() => {
    let isMounted = true; // Flag to track whether the component is still mounted

    const getPlaylists = async () => {

      const response = await sql`
          SELECT * FROM playlists WHERE user_db_id = ${user?.user_db_id}
      `;

      setPlaylists(response)

    }

    getPlaylists()

    return () => {
      isMounted = false; // Set the flag to false when the component unmounts
    };

  }, [])

  useEffect(() => {
    let isMounted = true; // Flag to track whether the component is still mounted

    const getPlaylists = async () => {

      const response = await sql`
          SELECT * FROM playlists WHERE user_db_id = ${user?.user_db_id}
      `;

      setPlaylists(response)

    }

    if (needsToRefresh) {
      getPlaylists()
    }

    return () => {
      isMounted = false; // Set the flag to false when the component unmounts
    };

  }, [needsToRefresh])

  useEffect(() => {

    let isMounted = true; // Flag to track whether the component is still mounted

    const getPlaylists = async () => {

      const response = await sql`
          SELECT * FROM playlists WHERE user_db_id = ${user?.user_db_id}
      `;

      setPlaylists(response)

    }

    if (playListUpdate === true) {
      getPlaylists()
    }

    return () => {
      isMounted = false; // Set the flag to false when the component unmounts
    };

  }, [playListUpdate])

  const handleShowPlaylist = (id: number) => {

    const strId = id.toString()
    const route = `/`
    console.log(route)

    setReadioSelectedPlaylistId?.(id)
    setClickedFromLibrary?.(true);
    setClickedFromHome?.(false);

    // router.push(route as Href)
    router.push('/(library)/selected:playlistId')

    // router.push(route)
  }

  const handleShowFavorites = () => {
    // setClickedFromLibrary?.(true);
    // setClickedFromHome?.(false);
    lightFeedback();
    router.push('/(tabs)/(library)/(myplaylist)/favorites')
  }

  const [isModalVisible, setIsModalVisible] = useState(false);

  const toggleModal = () => {
    lightFeedback();
    setIsModalVisible(!isModalVisible);
  };

  const navigation = useNavigation<RootNavigationProp>(); // use typed navigation

  const handlePress = () => {
    lightFeedback();
    router.back();
  }

  const [form, setForm] = useState({
    title: '',
  })

  const handleCreatePlaylist = async () => {
    console.log(createPlaylistSelections)

    // Step 1: Insert the new playlist
    const [newPlaylist] = await sql`
      INSERT INTO playlists (
          name,
          user_db_id
      )
      VALUES (
          ${form.title},
          ${user?.user_db_id}
      )
      RETURNING id, name;
  `;

    console.log("newPlaylist", newPlaylist)

    // Step 2: Associate readios with the new playlist
    const playlistId = newPlaylist.id;

    console.log("playlistId", playlistId)

    // for (const selection of createPlaylistSelections) {

    //   console.log("selection", selection)

    //   await sql`
    //     INSERT INTO playlist_readios (
    //         playlist_id,
    //         readio_id
    //     )
    //     VALUES (
    //         ${playlistId},
    //         ${selection.id}
    //     )
    //     ON CONFLICT DO NOTHING;
    //   `;

    //   console.log("added to playlist")
    // }

    console.log("readioAssociations")

    setCreatePlaylistSelections([])
    toggleModal()
    setPlaylistUpdate(true)
    setTimeout(() => {
      setPlaylistUpdate(false)
    }, 1000);

  }

  const [createPlaylistSelections, setCreatePlaylistSelections] = useState<{ id: number, name: string }[]>([]);

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

    const name = playlistName
    const id = user?.user_db_id

    console.log("uidu", id)
    console.log("name", name)

    try {
      await sql`
    DELETE FROM playlists WHERE name = ${name} AND user_db_id = ${id}
    `.then(() => {
        setNeedsToRefresh?.(true)
        setTimeout(() => {
          setNeedsToRefresh?.(true)
        }, 1000)
        console.log('Record deleted successfully');
      }).catch((error) => {
        console.error('Error deleting record:', error);
      });

      console.log('success')
    } catch (error) {
      console.log('fail', error)
    }
  }

  const handlePressAction = (id: string, playlistName?: string, readioName?: string) => {
    match(id)
      .with('add-to-favorites', async () => {
        console.log("add-t-f")
      })
      .with('remove-from-favorites', async () => {
        console.log("remove-f-f")
      })
      .with('add-to-playlist', () => {
        console.log("add-t-p")
      })
      .with('remove-from-playlist', () => {
        console.log('remove-f-p')
      })
      .with('delete', () => {
        handleDeletePlaylist(playlistName)
        console.log("delete")
      })

      .otherwise(() => console.warn(`Unknown menu action ${id}`))
  }

  const handleGoToSelectedPlaylist = (id: number, name: string) => {
    lightFeedback();
    setReadioSelectedPlaylistName?.(name)
    router.push(`/(tabs)/(library)/(myplaylist)/${id}` as Href)
  }

  const { clickedFromHome, setClickedFromHome, clickedFromLibrary, setClickedFromLibrary } = useLotusUtils()

  type LotusCommunityPlaylists = {
    category: string;
    categoryImage: string;
    articles: LotusArticle[];
  }

  interface Section {
    id: string;
    type: 'display-name' | 'list-of-playlists' | 'observer';
    data?: LotusCommunityPlaylists[];
  }

  // Create sections for the FlatList with explicit typing
  const sections: Section[] = [
    { id: 'display-name', type: 'display-name' },
    // TODO now add everything in database
    { id: 'list-of-playlists', type: 'list-of-playlists', data: communityPlaylistArticles },
    // { id: 'observer', type: 'observer' }
  ];

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

        <FlatList
          data={sections}
          renderItem={({ item }: { item: Section }) => {
            switch (item.type) {
              case 'display-name':
                return (
                  <LotusPageDisplayName title='MY PLAYLISTS' paddingTop={0} />
                );
              case 'list-of-playlists':
                return (
                  <>

                    <View style={{ paddingHorizontal: 20 }}>
                      <Text numberOfLines={3} style={[styles.pageDescription, { textAlign: 'center' }]}>
                        Your space for curated journeys and custom playlists of your favorites.
                      </Text>
                    </View>


                    {item.data && item.data.length > 0 && (
                      <>
                        <LotusGap backgroundColor={colors.readioBrown} gapNumber={15} />
                        <View style={styles.recentlySavedContainer}>

                          {/* NOTE - FAVORITES */}
                          <TouchableOpacity
                            activeOpacity={0.9}
                            // TODO
                            onPress={() => handleShowFavorites()}
                            // TODO
                            style={styles.recentlySavedItems}
                          >
                            <Animated.View style={{ gap: 10 }} entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(100)}>
                              <View style={styles.recentlySavedImg}>
                                <LotusImageWithLoader source={{ uri: getLocalImageUri('filter') }} style={[styles.nowPlayingImage, { zIndex: 1, opacity: 0.4 }]} resizeMode='cover' />
                                {/* <Image source={{ uri: playlist?.categoryImage ? playlist?.categoryImage : getLocalImageUri('unknownArticle') }} style={styles.nowPlayingImage} resizeMode='cover' /> */}
                              </View>
                              <View style={{ display: 'flex', flexDirection: 'column', height: 58, }}>
                                {/* NOTE - THE PLAYLIST TITLE */}
                                <Text allowFontScaling={false} numberOfLines={2} style={styles.recentlySavedTItle}>Favorites</Text>
                                <Text allowFontScaling={false} numberOfLines={1} style={[styles.recentlySavedSubheading, {opacity: 0.6}]}>{user?.name}</Text>
                              </View>
                            </Animated.View>
                          </TouchableOpacity>

                          {item.data.map((playlist: LotusCommunityPlaylists, index: number) => (
                            <TouchableOpacity
                              activeOpacity={0.9}
                              // TODO
                              onPress={() => handleGoToSelectedPlaylist(playlist?.articles[index]?.id as number, playlist?.category as string)}
                              // TODO
                              key={index}
                              style={styles.recentlySavedItems}
                            >
                                <View style={styles.recentlySavedImg}>
                                  <LotusImageWithLoader source={{ uri: getLocalImageUri('filter') }} style={[styles.nowPlayingImage, { zIndex: 1, opacity: 0.4 }]} resizeMode='cover' />
                                  <LotusImageWithLoader source={{ uri: playlist?.categoryImage ? playlist?.categoryImage : getLocalImageUri('unknownArticle') }} style={styles.nowPlayingImage} resizeMode='cover' />
                                </View>
                                <View style={{ display: 'flex', flexDirection: 'column', height: 58, }}>
                                  {/* NOTE - THE PLAYLIST TITLE */}
                                  <Text allowFontScaling={false} numberOfLines={2} style={styles.recentlySavedTItle}>{playlist.category}</Text>
                                  <Text allowFontScaling={false} numberOfLines={1} style={[styles.recentlySavedSubheading, {opacity: 0.6}]}>Lotus</Text>
                                </View>
                              {/* <Animated.View style={{ gap: 10 }} entering={FadeInUp.duration(300 + (index * 100))} exiting={FadeOutDown.duration(100)}>
                              </Animated.View> */}
                            </TouchableOpacity>
                          ))}
                        </View>
                      </>
                    )}

                    {item.data && item.data.length === 0 && (
                      // <>
                      <View style={{ paddingHorizontal: 10, opacity: 0.5, height: '58%', justifyContent: 'center' }}>
                        <LotusImageWithLoader source={ImageAssets.whiteLogo} style={{ width: 100, height: 100, alignSelf: 'center' }} resizeMode='contain' />
                        <Animated.Text entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(100)} allowFontScaling={false} style={[styles.title, { textAlign: 'center' }]}>{`You haven't created or \n saved any articles yet.`}</Animated.Text>
                        <LotusGap backgroundColor={colors.readioBrown} gapNumber={15} />
                        <Animated.Text entering={FadeInUp.duration(300)} exiting={FadeOutDown.duration(100)} allowFontScaling={false} style={[styles.title, { textAlign: 'center' }]}>Start by pressing the plus, or heading over to "My Playlists."</Animated.Text>
                      </View>
                      // </>
                    )}

                    <View style={[styles.divider, { opacity: 0 }]} />
                    <View style={{height: floatingPlayerIsVisible ? 130 : 100}}/>
                  </>
                );
              // case 'observer':
              //   return (
              //     <>
              //       <LotusComponentObserver markerColor='transparent' />
              //       <LotusPresenceIntro/>
              //     </>
              //   );
              default:
                return null;
            }
          }}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
        />


        {/* NOTE - CREATE PLAYLIST MODAL */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={toggleModal}
        >
          <SafeAreaView style={{ backgroundColor: colors.readioBrown }}>
            <KeyboardAvoidingView behavior="padding"
              keyboardVerticalOffset={10} style={{ padding: 20, backgroundColor: "transparent", width: '100%', height: '100%', display: 'flex', justifyContent: "space-between" }}>

              <View style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', backgroundColor: 'transparent' }}>
                  <Button title="Close" color={colors.readioOrange} onPress={toggleModal} />
                </View>
                <Text allowFontScaling={false} style={styles.heading}>New Playlist</Text>
              </View>

              <View style={{ marginVertical: 10, backgroundColor: 'transparent' }}>
                <InputField allowFontScaling={false} onChangeText={(text) => setForm({ ...form, title: text })} placeholder="Name your playlist here..." style={{ width: '100%', height: 50, padding: 15, color: colors.readioWhite }} label=""></InputField>



                <TouchableOpacity style={{ backgroundColor: colors.readioOrange, padding: 10, marginVertical: 10, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }} activeOpacity={0.9} onPress={handleCreatePlaylist}>
                  <Text allowFontScaling={false} style={{ color: colors.readioWhite, fontWeight: 'bold', fontSize: 20 }}>
                    Create  Playlist
                  </Text>
                </TouchableOpacity>
              </View>

            </KeyboardAvoidingView>

          </SafeAreaView>
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
    marginTop: 120,
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
