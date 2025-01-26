import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { ReadioTracksList } from '@/components/ReadioTrackList';
import { useTracks } from '@/store/library';
import { useMemo } from 'react';
import { trackContentFilter, trackTitleFilter } from '@/helpers/filter'
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
import TrackPlayer from 'react-native-track-player';
import Animated, { FadeInDown, FadeInUp, SlideInDown, SlideInUp, SlideOutDown } from 'react-native-reanimated';
import { FontAwesome } from '@expo/vector-icons';


export default function Stations() {

  const [search, setSearch] = useState('');
  const handleClearSearch = () => {
    setSearch('')
    setSearch('')
  }


  const [stations, setStations] = useState<any[]>([]);
  const [readios, setReadios] = useState<Readio[]>([]);
  const {readioSelectedPlaylistId, setReadioSelectedPlaylistId} = useReadio()
  const [selectedPlaylist, setSelectedPlaylist] = useState<any>();

  useEffect(() => {
    let isMounted = true; // Flag to track whether the component is still mounted

    const selectedStationData = stations?.find(
        (station) => station?.id === readioSelectedPlaylistId
    );

    const getReadios = async () => {

      const name = selectedStationData?.name
      console.log("name", name)
      
      // const data = await sql`SELECT * FROM readios WHERE topic = ${name} ORDER BY created_at DESC`;
      let data = await sql`SELECT * FROM readios ORDER BY created_at DESC`;
      data = data.filter((readio) => readio.topic === name)
      setReadios(data)
    }

    if (selectedStationData) {
        // console.log("selectedStationData", selectedStationData)
        setSelectedPlaylist(selectedStationData);
        getReadios()

    }

    return () => {
      isMounted = false; // Set the flag to false when the component unmounts
    };

  }, [stations, readioSelectedPlaylistId]); // Run the effect whenever these values change

  const tracks = readios

  const filteredTracks = useMemo(() => {
    if (!search) return tracks
    return tracks.filter(track => 
      trackTitleFilter(search)(track) || trackContentFilter(search)(track)
    )
  }, [search, tracks])


  useEffect(() => {

    let isMounted = true; // Flag to track whether the component is still mounted

    const getStations = async () => {

      const data = await sql`
          SELECT * FROM stations 
      `;

      setStations(data)

    }

    getStations()

    return () => {
      isMounted = false; // Set the flag to false when the component unmounts
    };

  }, [selectedPlaylist?.id, selectedPlaylist?.name])

  const navigation = useNavigation<RootNavigationProp>(); // use typed navigation
  const handlePressLibrary = () => {
    navigation.navigate("lib"); // <-- Using 'player' as screen name
  }
  const handleGoBack = () => {
    router.push('/(tabs)/(library)/(playlist)'); // <-- Using 'player' as screen name
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
          <TouchableOpacity onPress={handleGoBack}>
            <FontAwesome color={colors.readioWhite}  size={20} name='chevron-left'/>
          </TouchableOpacity>
        </Animated.View>
        <Animated.Text entering={FadeInUp.duration(100)} exiting={FadeInDown.duration(100)}     allowFontScaling={false} style={styles.heading}>{selectedPlaylist?.name}</Animated.Text>
      <View style={{ 
        // display: 'flex',
        // flexDirection: 'row',
        // gap: 10,
        // alignItems: 'center',
        // alignContent: 'center',
        // justifyContent: 'space-between'
        backgroundColor: "transparent"
      }}>
        <Animated.View entering={FadeInUp.duration(400)} exiting={FadeInDown.duration(400)}    style={{display: "flex", flexDirection: "row", backgroundColor: "transparent", alignItems: "center", gap: 10}}>

          <TextInput
           allowFontScaling={false}
            style={[
              styles.searchBar,
              { width: search.length > 0 ? '84%' : '99%', color: colors.readioWhite }
            ]}
            placeholder="Search for articles by title or content"
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
    fontSize: 20,
    textDecorationLine: 'underline',
    color: colors.readioOrange,
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
