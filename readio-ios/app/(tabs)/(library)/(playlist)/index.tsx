import { StyleSheet, KeyboardAvoidingView, TouchableOpacity, Modal, Button, FlatList, Text, View } from 'react-native';
import { ReadioTracksList } from '@/components/ReadioTrackList';
import { useTracks } from '@/store/library';
import { useMemo } from 'react';
import { trackTitleFilter } from '@/helpers/filter'
import { useNavigationSearch } from '@/hooks/useNavigationSearch'
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native';
import { Href, router } from 'expo-router';
import { Playlist } from '@/helpers/types';
import { useFetch } from '@/lib/fetch';
import { fetchAPI } from "@/lib/fetch";
import { useState, useEffect } from 'react';
import { RootNavigationProp } from "@/types/type";
import { useNavigation } from "@react-navigation/native";
import InputField from '@/components/inputField';
import { Readio } from '@/types/type';
import { set } from 'ts-pattern/dist/patterns';
import FastImage from 'react-native-fast-image';
import { unknownTrackImageUri } from '@/constants/images';
import { useReadio } from '@/constants/readioContext';
import { MenuView } from '@react-native-menu/menu'
import { match } from 'ts-pattern'
import { retryWithBackoff } from "@/helpers/retryWithBackoff";
import { colors } from '@/constants/tokens';
import { readioRegularFont, readioBoldFont } from '@/constants/tokens';
import sql from "@/helpers/neonClient";
import Animated, { FadeIn, FadeInDown, FadeInUp, FadeOut } from 'react-native-reanimated';
import { FontAwesome } from '@expo/vector-icons';

export default function Playlists() {
  const search = useNavigationSearch({
    searchBarOptions: {
      placeholder: 'Find in songs',
    },
  })

  const tracks = useTracks()
  const { user } = useReadio()

  const filteredTracks = useMemo(() => {
    if (!search) return tracks
    return tracks.filter(trackTitleFilter(search))
  }, [search, tracks])

  const [playlists, setPlaylists] = useState<any[]>([]);
  const [readios, setReadios] = useState<Readio[]>([]);
  const {readioSelectedPlaylistId, setReadioSelectedPlaylistId, needsToRefresh, setNeedsToRefresh} = useReadio()
  const [playListUpdate, setPlaylistUpdate] = useState(false)


  useEffect(() => {
    let isMounted = true; // Flag to track whether the component is still mounted

    const getPlaylists = async () => {

      const response = await sql`
          SELECT * FROM playlists WHERE clerk_id = ${user?.clerk_id}
      `;

      setPlaylists(response)

    }
    const getReadios = async () => {

      const data = await sql`
      SELECT * FROM readios WHERE clerk_id = ${user?.clerk_id}
      `;

      setReadios(data)

    }

    getReadios()
    getPlaylists()

    return () => {
			isMounted = false; // Set the flag to false when the component unmounts
		};

  }, [])

  useEffect(() => {
    let isMounted = true; // Flag to track whether the component is still mounted

    const getPlaylists = async () => {

      const response = await sql`
          SELECT * FROM playlists WHERE clerk_id = ${user?.clerk_id}
      `;

      setPlaylists(response)

    }
    const getReadios = async () => {

      const data = await sql`
      SELECT * FROM readios WHERE clerk_id = ${user?.clerk_id}
      `;

      setReadios(data)

    }

    if (needsToRefresh){
      getReadios()
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
          SELECT * FROM playlists WHERE clerk_id = ${user?.clerk_id}
      `;

      setPlaylists(response)

    }
    const getReadios = async () => {

      const data = await sql`
      SELECT * FROM readios WHERE clerk_id = ${user?.clerk_id}
      `;

      setReadios(data)

    }

    if (playListUpdate === true) {
      getReadios()
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
    setClickedFromLibrary?.(true);
    setClickedFromHome?.(false);
    router.push('/(tabs)/(library)/(playlist)/favorites')
  }

  const [isModalVisible, setIsModalVisible] = useState(false);
  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };
  const navigation = useNavigation<RootNavigationProp>(); // use typed navigation
  const handlePress = () => {
    navigation.navigate("lib"); // <-- Using 'player' as screen name
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
          clerk_id
      )
      VALUES (
          ${form.title},
          ${user?.clerk_id}
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
  const id = user?.clerk_id

  console.log("uidu", id)
  console.log("name", name)

  try {
    await sql`
    DELETE FROM playlists WHERE name = ${name} AND clerk_id = ${id}
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

const {clickedFromHome, setClickedFromHome} = useReadio()
const {clickedFromLibrary, setClickedFromLibrary} = useReadio()


  return (
    <SafeAreaView style={{
      display: 'flex',
      alignItems: 'center',
      backgroundColor: colors.readioBrown,
    }}>

    <ScrollView style={{ 
      width: '90%', 
      minHeight: '100%' 
      }}
      showsVerticalScrollIndicator={false}
      >
          <Animated.View entering={FadeInUp.duration(600)} exiting={FadeInDown.duration(600)}>
          <TouchableOpacity   style={styles.back} onPress={handlePress}>
            <FontAwesome color={colors.readioWhite}  size={20} name='chevron-left'/>
          </TouchableOpacity>
        </Animated.View>
            {/* <Animated.Text entering={FadeInUp.duration(600)} exiting={FadeInDown.duration(600)}   allowFontScaling={false} style={styles.back} onPress={handlePress}>Library</Animated.Text> */}
            <Animated.Text entering={FadeInUp.duration(100)} exiting={FadeInDown.duration(100)}   allowFontScaling={false} style={styles.heading}>Playlist</Animated.Text>

        <View style={{ 
          paddingVertical: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          backgroundColor: 'transparent',
        }}>

          <Modal
            animationType="slide" 
            transparent={true} 
            visible={isModalVisible}
            onRequestClose={toggleModal}
          >
            <SafeAreaView style={{backgroundColor: colors.readioBrown}}>
              <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={10} style={{padding: 20, backgroundColor: "transparent", width: '100%', height: '100%', display: 'flex', justifyContent: "space-between"}}>

                <View style={{width: '100%', display: 'flex', flexDirection: 'column'}}>
                  <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', backgroundColor: 'transparent'}}>
                    <Button  title="Close" color={colors.readioOrange} onPress={toggleModal} />
                  </View>
                  <Text  allowFontScaling={false} style={styles.heading}>New Playlist</Text>
                </View>

                <View style={{marginVertical: 10, backgroundColor: 'transparent'}}>               
                  <InputField  allowFontScaling={false} onChangeText={(text) => setForm({...form, title: text})} placeholder="Name your playlist here..." style={{width: '100%', height: 50, padding: 15, color: colors.readioWhite}} label=""></InputField>
                  
                  {/* {readios && readios?.length > 0 && (
                    <>
                      <Text style={{fontSize: 16, marginVertical: 10, color: colors.readioWhite}}>Add Songs</Text>
                      <FlatList
                        data={readios}
                        renderItem={({ item }) =>

                          <TouchableOpacity onPress={() => toggleSelection(item.id ? item.id : -1, item.title ? item.title : '')} activeOpacity={0.9} style={{ backgroundColor: createPlaylistSelections.some(selection => selection.id === item.id) ? colors.readioOrange : 'transparent', display: 'flex', flexDirection: 'row', alignItems: 'center', height: 40, borderRadius: 5, marginVertical: 3}}>
                            <FastImage source={{uri: item?.image ? item.image : unknownTrackImageUri}} style={{width: 40, height: 40, borderRadius: 5, marginRight: 10}} />
                            <Text numberOfLines={1} style={{fontSize: 16, width: '80%', maxHeight: 20, color: createPlaylistSelections.some(selection => selection.id === item.id) ? colors.readioWhite : colors.readioWhite, fontWeight: createPlaylistSelections.some(selection => selection.id === item.id) ? 'bold' : 'normal'}}>{item?.title}</Text>
                          </TouchableOpacity>}
                        // keyExtractor={(item) => item?.id ? item.id.toString() : ''}
                      />
                    </>
                  )} */}
                  

                  <TouchableOpacity style={{backgroundColor: colors.readioOrange, padding: 10, marginVertical: 10, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center'}} activeOpacity={0.9} onPress={handleCreatePlaylist}>
                      <Text  allowFontScaling={false} style={{color: colors.readioWhite, fontWeight: 'bold', fontSize: 20}}>
                          Create  Playlist
                      </Text>
                  </TouchableOpacity>
                  {/* <Text>{text}</Text> */}
                </View>

              </KeyboardAvoidingView>

            </SafeAreaView>
          </Modal>

          <Animated.View entering={FadeInUp.duration(400)} exiting={FadeInDown.duration(400)} >
              <TouchableOpacity activeOpacity={0.9} onPress={toggleModal} style={styles.playlistContainer}>
                  <View style={styles.playlistIcon}>
                    <Text   allowFontScaling={false} style={styles.readioPlaylistTitle}>+</Text>
                  </View>
                  <Text  allowFontScaling={false} style={styles.readioPlaylistTitle}>New Playlist</Text>
              </TouchableOpacity>
            </Animated.View>
      
            <Animated.View entering={FadeInUp.duration(500)} exiting={FadeInDown.duration(500)}  style={styles.playlistContainer}>
                <View style={styles.playlistIcon}></View>
                <Text  allowFontScaling={false} onPress={handleShowFavorites} style={styles.readioPlaylistTitle}>Favorite Articles</Text>
            </Animated.View>

            <View style={styles.playlistContainer}>
              <FlatList
                data={playlists}
                scrollEnabled={false}
                keyExtractor={(playlist) => playlist?.id.toString()}
                renderItem={({ item: playlist, index }) => (
                  <Animated.View  entering={FadeIn.duration(300 + (index * 100))} exiting={FadeOut.duration(300 + (index * 100))}>
                    <TouchableOpacity
                      activeOpacity={0.9}
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 20,
                        width: '100%',
                        marginBottom: 20,
                        justifyContent:'space-between'
                      }}
                    >
                      <TouchableOpacity onPress={() => { handleShowPlaylist(playlist?.id) }} style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 20, width: '90%'}}>
                        <View style={styles.playlistIcon}></View>
                        <Text  allowFontScaling={false} style={styles.readioUserPlaylistTitle}>{playlist?.name}</Text>
                      </TouchableOpacity>
                      <MenuView
                  onPressAction={({ nativeEvent: { event } }) => handlePressAction(event, playlist?.name)}
                  actions={[
                    // {
                    // id: isFavorite ? 'remove-from-favorites' : 'add-to-favorites',
                    // title: isFavorite ? 'Remove from favorites' : 'Add to favorites',
                    // image: isFavorite ? 'heart.fill' : 'heart',
                    // },
                    // {
                    // 	id: 'add-to-playlist',
                    // 	title: 'Add to playlist',
                    // 	image: 'plus',
                    // },
                    {
                      id: 'delete',
                      title: 'Delete',
                      image: 'trash',
                    }	
                  ]}
                  >
                        <Text  style={{color: colors.readioWhite}}  allowFontScaling={false}>...</Text>
                      </MenuView>
                    </TouchableOpacity>
                 </Animated.View>
                )}
              />
            </View>

          </View>

        {/* <View style={styles.separator} lightColor="transparent" darkColor="rgba(255,255,255,0.1)" /> */}
        {/* <EditScreenInfo path="app/(tabs)/two.tsx" /> */}
    
    </ScrollView>
    
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  heading: {
    fontSize: 50,
    fontWeight: 'bold',
    color: colors.readioWhite,
    fontFamily: readioBoldFont
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
  }
});
