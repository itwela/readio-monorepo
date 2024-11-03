import { StyleSheet, TouchableOpacity, Modal, Button, FlatList } from 'react-native';
import { ReadioTracksList } from '@/components/ReadioTrackList';
import { Text, View } from '@/components/Themed';
import { useTracks } from '@/store/library';
import { useMemo } from 'react';
import { trackTitleFilter } from '@/helpers/filter'
import { useNavigationSearch } from '@/hooks/useNavigationSearch'
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native';
import { Href, router } from 'expo-router';
import { Playlist } from '@/helpers/types';
import { useFetch } from '@/lib/fetch';
import { useUser } from '@clerk/clerk-expo'
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
import { retryWithBackoff } from "@/helpers/retrywithBackoff";

export default function Playlists() {
  const search = useNavigationSearch({
    searchBarOptions: {
      placeholder: 'Find in songs',
    },
  })

  const tracks = useTracks()
  const { user } = useUser()

  const filteredTracks = useMemo(() => {
    if (!search) return tracks
    return tracks.filter(trackTitleFilter(search))
  }, [search, tracks])

  const [playlists, setPlaylists] = useState<{ data: Playlist[] }>({ data: [] })
  const [readios, setReadios] = useState<{ data: Readio[] }>({ data: [] })
  const {readioSelectedPlaylistId, setReadioSelectedPlaylistId} = useReadio()

  useEffect(() => {
    const getPlaylists = async () => {

      retryWithBackoff(async () => {

      const response = await fetchAPI(`/(api)/getPlaylists`, {
        method: "POST",
        body: JSON.stringify({
          clerkId: user?.id as string,
        }),
      });

      setPlaylists(response)
      console.log("playlists", response)
    }, 3, 1000)



    }
    const getReadios = async () => {

      retryWithBackoff(async () => {

      const response = await fetchAPI(`/(api)/getReadios`, {
        method: "POST",
        body: JSON.stringify({
          clerkId: user?.id as string,
        }),
      });
      setReadios(response)

    }, 3, 1000)



    }

    getReadios()
    getPlaylists()

    console.log("loaded")
  }, [])


  const handleShowPlaylist = (id: number) => {

    const strId = id.toString()
    const route = `/`
    console.log(route)

    setReadioSelectedPlaylistId?.(id)

    // router.push(route as Href)
    router.push('/(library)/selected:playlistId')

    // router.push(route)
  }

  const handleShowFavorites = () => {
    router.push('/(library)/favorites')
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


  retryWithBackoff(async () => {

  const response = await fetchAPI(`/(api)/createPlaylist`, {
    method: "POST",
    body: JSON.stringify({
      clerkId: user?.id as string,
      name: form.title,
      selections: createPlaylistSelections
    }),
  });
  console.log(response)

}, 3, 1000)


  setCreatePlaylistSelections([])
  toggleModal()
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
      console.log("delete")
    })

    .otherwise(() => console.warn(`Unknown menu action ${id}`))
}

  return (
    <SafeAreaView style={{
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#fff'
    }}>

    <ScrollView style={{ 
      width: '90%', 
      minHeight: '100%' 
      }}>
        <Text style={styles.back} onPress={handlePress}>Library</Text>
        <Text style={styles.heading}>Playlist</Text>

        <View style={{ 
          paddingVertical: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 20
        }}>

          <Modal
            animationType="slide" 
            transparent={true} 
            visible={isModalVisible}
            onRequestClose={toggleModal}
          >
            <SafeAreaView style={{}}>
              <View style={{padding: 20, backgroundColor: '#fff', width: '100%', height: '100%', display: 'flex'}}>
                
                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end'}}>
                  <Button title="Close" color="#fc3c44" onPress={toggleModal} />
                </View>
        
                <Text style={styles.heading}>New Playlist</Text>

                <View style={{marginVertical: 10}}>               
                  <InputField onChangeText={(text) => setForm({...form, title: text})} placeholder="Name your Readio here" style={{width: '100%', height: 50, padding: 15}} label="Title"></InputField>
                  
                  {readios?.data && readios?.data.length > 0 && (
                    <>
                      <Text style={{fontSize: 16, marginVertical: 10}}>Add Songs</Text>
                      <FlatList
                        data={readios?.data}
                        renderItem={({ item }) =>

                          <TouchableOpacity onPress={() => toggleSelection(item.id ? item.id : -1, item.title ? item.title : '')} activeOpacity={0.9} style={{ backgroundColor: createPlaylistSelections.some(selection => selection.id === item.id) ? '#fc3c44' : 'transparent', display: 'flex', flexDirection: 'row', alignItems: 'center', height: 40, borderRadius: 5, marginVertical: 3}}>
                            <FastImage source={{uri: item?.image ? item.image : unknownTrackImageUri}} style={{width: 40, height: 40, borderRadius: 5, marginRight: 10}} />
                            <Text numberOfLines={1} style={{fontSize: 16, maxHeight: 20, color: createPlaylistSelections.some(selection => selection.id === item.id) ? '#fff' : 'black', fontWeight: createPlaylistSelections.some(selection => selection.id === item.id) ? 'bold' : 'normal'}}>{item?.title}</Text>
                          </TouchableOpacity>}
                        // keyExtractor={(item) => item?.id ? item.id.toString() : ''}
                      />
                    </>
                  )}
                  

                  <Text style={{color: '#fc3c44', marginTop: 10}} onPress={handleCreatePlaylist}>Create Playlist</Text>
                  {/* <Text style={{color: '#fc3c44', marginTop: 10}} onPress={playReadio}>Generate</Text> */}
                  {/* <Text>{text}</Text> */}
                </View>

              </View>

            </SafeAreaView>
          </Modal>

            <TouchableOpacity activeOpacity={0.9} onPress={toggleModal} style={styles.playlistContainer}>
                <View style={styles.playlistIcon}>
                  <Text style={styles.readioPlaylistTitle}>+</Text>
                </View>
                <Text style={styles.readioPlaylistTitle}>New Playlist</Text>
            </TouchableOpacity>
      
            <View style={styles.playlistContainer}>
                <View style={styles.playlistIcon}></View>
                <Text onPress={handleShowFavorites} style={styles.readioPlaylistTitle}>Favorite Readios</Text>
            </View>

            <View style={styles.playlistContainer}>
              <FlatList
                data={playlists?.data}
                scrollEnabled={false}
                keyExtractor={(playlist) => playlist?.id.toString()}
                renderItem={({ item: playlist }) => (
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
                    <TouchableOpacity onPress={() => handleShowPlaylist(playlist?.id)} style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 20, width: '90%'}}>
                      <View style={styles.playlistIcon}></View>
                      <Text style={styles.readioUserPlaylistTitle}>{playlist?.name}</Text>
                    </TouchableOpacity>
                    <MenuView
                onPressAction={({ nativeEvent: { event } }) => handlePressAction(event)}
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
                      <Text>...</Text>
                    </MenuView>
                  </TouchableOpacity>
                )}
              />
            </View>

          </View>

        <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
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
    alignItems: 'center'
  },
  playlistIcon: {
    backgroundColor: '#ccc', 
    width: 60, 
    height: 60,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  readioPlaylistTitle: {
    color: '#fc3c44',
    fontSize: 20,
    fontWeight: 'bold',
  },
  readioUserPlaylistTitle: {
    color: '#000',
    fontSize: 20,
    fontWeight: 'bold',
  },
  heading: {
    fontSize: 60,
    fontWeight: 'bold',
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
    fontSize: 15,
    textDecorationLine: 'underline',
    color: '#fc3c44',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  playlistSelections: {
  }
});
