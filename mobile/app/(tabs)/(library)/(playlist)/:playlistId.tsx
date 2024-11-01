import { StyleSheet } from 'react-native';
import { ReadioTracksList } from '@/components/ReadioTrackList';
import { Text, View } from '@/components/Themed';
import { useTracks } from '@/store/library';
import { useMemo } from 'react';
import { trackTitleFilter } from '@/helpers/filter'
import { useNavigationSearch } from '@/hooks/useNavigationSearch'
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Playlist } from '@/helpers/types';
import { useFetch } from '@/lib/fetch';
import { useUser } from '@clerk/clerk-expo'
import { fetchAPI } from "@/lib/fetch";
import { useState, useEffect } from 'react';
import { TextInput } from 'react-native-gesture-handler';
import { RootNavigationProp } from "@/types/type";
import { useNavigation } from "@react-navigation/native";
import { generateTracksListId } from '@/helpers/misc'
import { Readio } from '@/types/type';
import { useReadio } from '@/constants/readioContext';

export default function Playlists() {

  const [search, setSearch] = useState('');
  const handleClearSearch = () => {
    setSearch('')
    setSearch('')
  }

  const { user } = useUser()

  const [playlists, setPlaylists] = useState<{ data: Playlist[] }>({ data: [] })
  const [readios, setReadios] = useState<{ data: Readio[] }>({ data: [] })
  const {readioSelectedPlaylistId, setReadioSelectedPlaylistId} = useReadio()
  const [selectedPlaylist, setSelectedPlaylist] = useState<{ data: Playlist[] }>({ data: [] });

  useEffect(() => {
    // Find the selected playlist based on the ID
    const selectedPlaylistData = playlists?.data?.find(
      (playlist) => playlist?.id === readioSelectedPlaylistId
    );

    // If a matching playlist is found, wrap it in an object with a `data` array to match state type
    if (selectedPlaylistData) {
      setSelectedPlaylist({ data: [selectedPlaylistData] });
    }
  }, [playlists, readioSelectedPlaylistId]); // Run the effect whenever these values change

  const tracks = readios.data

  const filteredTracks = useMemo(() => {
    if (!search) return tracks
    return tracks.filter(trackTitleFilter(search))
  }, [search, tracks])


  useEffect(() => {
    const getPlaylists = async () => {
      const response = await fetchAPI(`/(api)/getPlaylists`, {
        method: "POST",
        body: JSON.stringify({
          clerkId: user?.id as string,
        }),
      });

      setPlaylists(response)
      console.log("playlists", response)
    }

    const getReadios = async () => {
      
      const response = await fetchAPI(`/(api)/getReadiosFromPlaylist`, {
        method: "POST",
        body: JSON.stringify({
          clerkId: user?.id as string,
          playlistId: readioSelectedPlaylistId as number
        }),
      });

      setReadios(response)
      console.log("readios", response)
    }

    getPlaylists()
    getReadios()
  }, [])

  const navigation = useNavigation<RootNavigationProp>(); // use typed navigation
  const handlePress = () => {
    navigation.navigate("lib"); // <-- Using 'player' as screen name
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
      {/* {playlists?.data?.filter(playlist => playlist?.id === readioSelectedPlaylistId)?.map((playlist: Playlist) => (
        <Text key={playlist?.id} style={styles.heading}>{playlist?.name}</Text>
      ))} */}
      <Text style={styles.heading}>{selectedPlaylist?.data[0]?.name}</Text>
      <View style={{ 
        // display: 'flex',
        // flexDirection: 'row',
        // gap: 10,
        // alignItems: 'center',
        // alignContent: 'center',
        // justifyContent: 'space-between'
      }}>
        <TextInput
          style={[
            styles.searchBar,
            { width: search.length > 0 ? '84%' : '99%' }
          ]}
          placeholder="Find in songs"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <Text onPress={handleClearSearch} style={styles.back}>Cancel</Text>
        )}
      <ReadioTracksList id={generateTracksListId('songs', search)} tracks={filteredTracks} scrollEnabled={false}/>
      </View>
    
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
  searchBar: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 5,
  },
});
