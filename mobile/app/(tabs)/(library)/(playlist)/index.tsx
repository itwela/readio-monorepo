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

  useEffect(() => {
    const getPlaylists = async () => {
      const response = await fetchAPI(`/(api)/getPlaylists`, {
        method: "POST",
        body: JSON.stringify({
          clerkId: user?.id as string,
        }),
      });

      setPlaylists(response)

    }
    const getReadios = async () => {
      const response = await fetchAPI(`/(api)/getReadios`, {
        method: "POST",
        body: JSON.stringify({
          clerkId: user?.id as string,
        }),
      });

      setReadios(response)

    }

    getReadios()


    getPlaylists()
  }, [])


  const handleShowPlaylist = (id: number) => {

    const strId = id.toString()
    const route = `/`
    console.log(route)

    // router.push(route as Href)
    router.push('/(library)/selected:playlistId')

    // router.push(route)
  }

  const handleSHowFavorites = () => {
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
  topic: ''
})

const handleCreatePlaylist = async () => {
  console.log(createPlaylistSelections)
}

const [createPlaylistSelections, setCreatePlaylistSelections] = useState<string[]>([]);
function toggleSelection(selection: string) {
  if (createPlaylistSelections.includes(selection)) {
    setCreatePlaylistSelections(createPlaylistSelections.filter(topic => topic !== selection));
  } else { 
    setCreatePlaylistSelections?.([...createPlaylistSelections, selection]);
  }
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
                <Text style={{fontSize: 16, marginVertical: 10}}>Add Songs</Text>
                <FlatList
                  data={readios?.data}
                  renderItem={({ item }) => <Text onPress={() => toggleSelection(item.title ? item.title : '')} style={{fontSize: 16, marginVertical: 10, color: createPlaylistSelections.includes(item.title ? item.title : '') ? '#fc3c44' : 'black'}}>{item?.title}</Text>}
                  keyExtractor={(item) => item?.id ? item.id.toString() : ''}
                  style={[styles.playlistSelections]}
                />
                <Text style={{color: '#fc3c44', marginTop: 10}} onPress={handleCreatePlaylist}>Generate</Text>
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
              <Text onPress={handleSHowFavorites} style={styles.readioPlaylistTitle}>Favorite Readios</Text>
          </View>

          <View style={styles.playlistContainer}>
              <View style={styles.playlistIcon}></View>
              {playlists?.data?.map((playlist) => (
                <Text onPress={() => handleShowPlaylist(playlist.id)} key={playlist.id} style={styles.readioUserPlaylistTitle}>{playlist.name}</Text>
              ))}
              <Text onPress={() => handleShowPlaylist(0)} style={styles.readioUserPlaylistTitle}>Yo</Text>
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
    padding: 10,
  }
});
