import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
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
// import { TextInput } from 'react-native-gesture-handler';
import { RootNavigationProp } from "@/types/type";
import { useNavigation, useRoute } from "@react-navigation/native";
import { generateTracksListId } from '@/helpers/misc'
import { Readio } from '@/types/type';
import { useReadio } from '@/constants/readioContext';
   // Save S3 URL to the Neon database
import { retryWithBackoff } from "@/helpers/retryWithBackoff";
import { colors } from '@/constants/tokens';
import sql from "@/helpers/neonClient";
import { getFocusedRouteNameFromRoute } from '@react-navigation/native'; // Import this
import { CommonActions } from '@react-navigation/native';
import Animated, { FadeIn, FadeInDown, FadeInUp, FadeOut } from 'react-native-reanimated';
import { FontAwesome } from '@expo/vector-icons';

export default function Playlists() {

  const [search, setSearch] = useState('');
  const handleClearSearch = () => {
    setSearch('')
    setSearch('')
  }

  const { user } = useReadio()

  const [playlists, setPlaylists] = useState<any[]>([]);
  const [stations, setStations] = useState<any[]>([]);
  const [readios, setReadios] = useState<Readio[]>([]);
  const {readioSelectedPlaylistId, setReadioSelectedPlaylistId} = useReadio()
  const [selectedPlaylist, setSelectedPlaylist] = useState<any>();

  useEffect(() => {
    // Find the selected playlist based on the ID

    console.log("readioSelectedPlaylistId", readioSelectedPlaylistId)

    const selectedPlaylistData = playlists?.find(
      (playlist) => playlist?.id === readioSelectedPlaylistId
    );



    // If a matching playlist is found, wrap it in an object with a `data` array to match state type
    if (selectedPlaylistData) {
      console.log("selectedPlaylistData", selectedPlaylistData)
      setSelectedPlaylist(selectedPlaylistData);
    }

  }, [playlists, readioSelectedPlaylistId]); // Run the effect whenever these values change

  const tracks = readios

  const filteredTracks = useMemo(() => {
    if (!search) return tracks
    return tracks.filter(trackTitleFilter(search))
  }, [search, tracks])


  useEffect(() => {

    
    const getPlaylists = async () => {
      
      const response = await sql`
          SELECT * FROM playlists WHERE clerk_id = ${user?.clerk_id}
      `;

      setPlaylists(response)
      
      
      
    }
    
    const getReadios = async () => {
      
      const data = await sql`
      SELECT r.*
      FROM readios r
      JOIN playlist_readios pr ON r.id = pr.readio_id
      WHERE pr.playlist_id = ${selectedPlaylist?.id} AND r.clerk_id = ${user?.clerk_id}
      `;

      console.log("selectedPlaylist?.id", selectedPlaylist?.id)

      setReadios(data)

      console.log("readios", readios)

    }

    const getStations = async () => {

      const data = await sql`
          SELECT * FROM stations 
      `;

      setStations(data)

    }

    getPlaylists()
    getReadios()
    getStations()

  }, [selectedPlaylist?.id, user?.clerk_id])

  const navigation = useNavigation<RootNavigationProp>(); // use typed navigation
  const handlePressLibrary = () => {
    router.push('/(tabs)/(library)/(playlist)'); // <-- Using 'player' as screen name
  }
  const handlePressHome = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'home' }], // Replace 'home' with your actual route name
      })
    );
    // navigation.navigate("home"); // <-- Using 'player' as screen name
  }

const {clickedFromHome, setClickedFromHome } = useReadio()
const {clickedFromLibrary, setClickedFromLibrary } = useReadio()

  return (
    <SafeAreaView style={{
      display: 'flex',
      alignItems: 'center',
      backgroundColor: colors.readioBrown
    }}>

    <ScrollView style={{ 
      width: '90%', 
      minHeight: '100%',
      backgroundColor: "transparent" 
      }}
      showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.duration(600)} exiting={FadeInDown.duration(600)}>
          <TouchableOpacity   style={styles.back} onPress={handlePressLibrary}>
            <FontAwesome color={colors.readioWhite}  size={20} name='chevron-left'/>
          </TouchableOpacity>
        </Animated.View>
        
        <Animated.Text entering={FadeInUp.duration(100)} exiting={FadeInDown.duration(100)}   allowFontScaling={false} style={styles.heading}>{selectedPlaylist?.name}</Animated.Text>

      <View style={{ 
        backgroundColor: "transparent"
      }}>
            <Animated.View entering={FadeInUp.duration(400)} exiting={FadeInDown.duration(400)}   style={{display: "flex", flexDirection: "row", backgroundColor: "transparent", alignItems: "center", gap: 10}}>

          <TextInput
           allowFontScaling={false}
            style={[
              styles.searchBar,
              { width: search.length > 0 ? '84%' : '99%', color: colors.readioWhite }
            ]}
            placeholder="Search"
            value={search}
            onChangeText={setSearch}
            placeholderTextColor={colors.readioDustyWhite}
          />
          {search.length > 0 && (
            <Text  allowFontScaling={false} onPress={handleClearSearch} style={{color: colors.readioOrange, zIndex: 10, fontSize: 15}}>Cancel</Text>
          )}

        </Animated.View>
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
    color: colors.readioWhite
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
    opacity: 0.5,
    paddingRight: 20
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
    paddingHorizontal: 10,
    fontSize: 20,
    opacity: 0.5,
  },
});
