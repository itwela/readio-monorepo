import InputField from '@/components/inputField';
import { LotusPageDisplayName } from '@/components/LotusPageDisplayName';
import { colors, giantFont, readioBoldFont } from '@/constants/tokens';
import { trackTitleFilter } from '@/helpers/filter';
import sql from "@/helpers/neonClient";
import { useLotusUser } from '@/helpers/providers/lotusUserContext';
import { useLotusUtils } from '@/helpers/providers/lotusUtilsContext';
import { useNavigationSearch } from '@/hooks/useNavigationSearch';
import { useTracks } from '@/store/library';
import { LotusArticle, RootNavigationProp } from "@/types/type";
import { FontAwesome } from '@expo/vector-icons';
import { MenuView } from '@react-native-menu/menu';
import { useNavigation } from "@react-navigation/native";
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Button, FlatList, KeyboardAvoidingView, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp, FadeOut } from 'react-native-reanimated';
import { match } from 'ts-pattern';

export default function Playlists() {
  const search = useNavigationSearch({
    searchBarOptions: {
      placeholder: 'Find in songs',
    },
  })

  const tracks = useTracks()
  const { user } = useLotusUser()

  const filteredTracks = useMemo(() => {
    if (!search) return tracks
    return tracks.filter(trackTitleFilter(search))
  }, [search, tracks])

  const [playlists, setPlaylists] = useState<any[]>([]);
  const [readios, setReadios] = useState<LotusArticle[]>([]);
  const {needsToRefresh, setNeedsToRefresh} = useLotusUser()
  const {readioSelectedPlaylistId, setReadioSelectedPlaylistId,} = useLotusUtils()
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

const {clickedFromHome, setClickedFromHome, clickedFromLibrary, setClickedFromLibrary} = useLotusUtils()

  return (
    <View style={styles.container}>

          <Animated.View style={{paddingHorizontal: 10}} entering={FadeInUp.duration(600)} exiting={FadeInDown.duration(600)}>
          <TouchableOpacity   style={styles.back} onPress={handlePress}>
            <FontAwesome color={colors.readioWhite}  size={20} name='chevron-left'/>
          </TouchableOpacity>
        </Animated.View>
            {/* <Animated.Text entering={FadeInUp.duration(600)} exiting={FadeInDown.duration(600)}   allowFontScaling={false} style={styles.back} onPress={handlePress}>Library</Animated.Text> */}
            <LotusPageDisplayName title='MY PLAYLISTS' paddingTop={0}/>

    <ScrollView style={{ 
     width: '93%', 
     minHeight: '100%',
     alignSelf: 'center',
    //  paddingTop: 30,
      }}
      showsVerticalScrollIndicator={false}
      >

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
              <KeyboardAvoidingView behavior="padding" 
              keyboardVerticalOffset={10} style={{padding: 20, backgroundColor: "transparent", width: '100%', height: '100%', display: 'flex', justifyContent: "space-between"}}>

                <View style={{width: '100%', display: 'flex', flexDirection: 'column'}}>
                  <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', backgroundColor: 'transparent'}}>
                    <Button  title="Close" color={colors.readioOrange} onPress={toggleModal} />
                  </View>
                  <Text  allowFontScaling={false} style={styles.heading}>New Playlist</Text>
                </View>

                <View style={{marginVertical: 10, backgroundColor: 'transparent'}}>               
                  <InputField  allowFontScaling={false} onChangeText={(text) => setForm({...form, title: text})} placeholder="Name your playlist here..." style={{width: '100%', height: 50, padding: 15, color: colors.readioWhite}} label=""></InputField>
                  
    

                  <TouchableOpacity style={{backgroundColor: colors.readioOrange, padding: 10, marginVertical: 10, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center'}} activeOpacity={0.9} onPress={handleCreatePlaylist}>
                      <Text  allowFontScaling={false} style={{color: colors.readioWhite, fontWeight: 'bold', fontSize: 20}}>
                          Create  Playlist
                      </Text>
                  </TouchableOpacity>
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
  }
});
